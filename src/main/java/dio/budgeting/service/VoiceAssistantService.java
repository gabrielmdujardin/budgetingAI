package dio.budgeting.service;

import dio.budgeting.domain.Category;
import dio.budgeting.dto.request.TransactionRequest;
import dio.budgeting.dto.response.SummaryResponse;
import dio.budgeting.dto.response.TransactionResponse;
import dio.budgeting.dto.response.VoiceResponse;
import dio.budgeting.dto.response.VoiceResponse.CardPayload;
import dio.budgeting.dto.response.VoiceResponse.MessagePayload;
import dio.budgeting.dto.response.VoiceResponse.StructuredTransactionPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceAssistantService {

    private static final Locale PT_BR = Locale.of("pt", "BR");
    private static final NumberFormat BRL = NumberFormat.getCurrencyInstance(PT_BR);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final TransactionService transactionService;

    @Value("${app.whisper.base-url:http://localhost:8000}")
    private String whisperBaseUrl;

    @Value("${app.finances.opening-balance-cents:500000}")
    private long openingBalanceCents;

    private static final Set<Category> INCOME_CATEGORIES = Set.of(Category.SALARY, Category.INVESTMENTS);

    public VoiceResponse processVoiceCommand(MultipartFile audioFile) {
        if (audioFile == null || audioFile.isEmpty()) {
            return VoiceResponse.builder()
                    .action("INVALID_AUDIO")
                    .transcription("")
                    .message(MessagePayload.builder()
                            .text("Não recebi um arquivo de áudio válido. Por favor, tente gravar novamente.")
                            .speech("Não recebi um arquivo de áudio válido. Por favor tente gravar novamente.")
                            .build())
                    .cards(List.of())
                    .transactions(List.of())
                    .build();
        }

        String transcription = transcribeAudio(audioFile);
        log.info("Transcrição obtida: {}", transcription);

        if (transcription == null || transcription.isBlank()) {
            return VoiceResponse.builder()
                    .action("TRANSCRIPTION_FAILED")
                    .transcription("")
                    .message(MessagePayload.builder()
                            .text("Não consegui compreender o áudio gravado. Pode tentar novamente?")
                            .speech("Não consegui compreender o áudio gravado. Pode tentar novamente?")
                            .build())
                    .cards(List.of())
                    .transactions(List.of())
                    .build();
        }

        return interpretTextAndExecute(transcription.trim());
    }

    private String transcribeAudio(MultipartFile audioFile) {
        try {
            RestClient restClient = RestClient.builder().baseUrl(whisperBaseUrl).build();
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(audioFile.getBytes()) {
                @Override
                public String getFilename() {
                    return audioFile.getOriginalFilename() != null ? audioFile.getOriginalFilename() : "audio.webm";
                }
            });
            builder.part("model", "Systran/faster-whisper-small");
            builder.part("language", "pt");

            Map<?, ?> response = restClient.post()
                    .uri("/v1/audio/transcriptions")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(builder.build())
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.get("text") instanceof String text) {
                return text;
            }
        } catch (Exception e) {
            log.warn("Falha ao transcrever áudio com Faster-Whisper: {}", e.getMessage());
        }

        return "";
    }

    public VoiceResponse interpretTextAndExecute(String text) {
        String lowerText = text.toLowerCase(PT_BR);

        if (isBalanceIntent(lowerText)) {
            return buildBalanceResponse(text);
        }

        if (isIncomeIntent(lowerText)) {
            return buildIncomeResponse(text);
        }

        if (isListIntent(lowerText) || isExpenseQuestion(lowerText)) {
            return buildTransactionsResponse(text, detectCategory(lowerText));
        }

        return buildCreateTransactionResponse(text, lowerText);
    }

    private boolean isIncomeIntent(String text) {
        return text.contains("receita") || text.contains("receitas") || text.contains("quanto recebi") || text.contains("meus ganhos");
    }

    private VoiceResponse buildBalanceResponse(String transcription) {
        List<TransactionResponse> allTx = transactionService.getTransactions(null, null, null);
        long incomeCents = allTx.stream()
                .filter(t -> INCOME_CATEGORIES.contains(t.getCategory()))
                .mapToLong(TransactionResponse::getAmount)
                .sum();
        long expensesCents = allTx.stream()
                .filter(t -> !INCOME_CATEGORIES.contains(t.getCategory()))
                .mapToLong(TransactionResponse::getAmount)
                .sum();
        long balanceCents = openingBalanceCents + incomeCents - expensesCents;

        double balanceVal = centsToDouble(balanceCents);

        String chatText = "Seu saldo estimado é **" + formatCurrency(balanceCents) + "**.";
        String speechText = "Seu saldo estimado é de " + formatMoneyToSpeech(balanceCents) + ".";

        CardPayload balanceCard = CardPayload.builder()
                .type("balance")
                .title("Saldo estimado")
                .value(balanceVal)
                .build();

        List<StructuredTransactionPayload> structuredTxs = allTx.stream()
                .sorted(Comparator.comparing(TransactionResponse::getCreatedAt).reversed())
                .limit(8)
                .map(this::toStructuredPayload)
                .toList();

        return VoiceResponse.builder()
                .action("BALANCE")
                .transcription(transcription)
                .balance(balanceCents)
                .summary(buildSummary(allTx))
                .transactions(allTx) // retrocompatível
                .message(MessagePayload.builder()
                        .text(chatText)
                        .speech(speechText)
                        .build())
                .cards(List.of(balanceCard))
                .transactions(structuredTxs)
                .build();
    }

    private VoiceResponse buildIncomeResponse(String transcription) {
        List<TransactionResponse> incomeTxs = transactionService.getTransactions(null, null, null).stream()
                .filter(t -> INCOME_CATEGORIES.contains(t.getCategory()))
                .sorted(Comparator.comparing(TransactionResponse::getCreatedAt).reversed())
                .toList();

        long totalIncomeCents = incomeTxs.stream().mapToLong(TransactionResponse::getAmount).sum();

        String chatText = "Você recebeu **" + formatCurrency(totalIncomeCents) + "** em receitas.";
        String speechText = "Você recebeu " + formatMoneyToSpeech(totalIncomeCents) + " em receitas.";

        CardPayload incomeCard = CardPayload.builder()
                .type("income")
                .title("Total de receitas")
                .value(centsToDouble(totalIncomeCents))
                .build();

        List<StructuredTransactionPayload> structuredTxs = incomeTxs.stream()
                .map(this::toStructuredPayload)
                .toList();

        return VoiceResponse.builder()
                .action("LIST_INCOME")
                .transcription(transcription)
                .summary(buildSummary(incomeTxs))
                .message(MessagePayload.builder()
                        .text(chatText)
                        .speech(speechText)
                        .build())
                .cards(List.of(incomeCard))
                .transactions(structuredTxs)
                .build();
    }

    private VoiceResponse buildTransactionsResponse(String transcription, Category category) {
        List<TransactionResponse> transactions = transactionService.getTransactions(category, null, null).stream()
                .filter(t -> !INCOME_CATEGORIES.contains(t.getCategory()))
                .sorted(Comparator.comparing(TransactionResponse::getCreatedAt).reversed())
                .toList();

        long totalCents = transactions.stream().mapToLong(TransactionResponse::getAmount).sum();
        int count = transactions.size();

        String scopeText = category != null ? " em " + categoryLabelReadable(category) : "";
        String scopeSpeech = category != null ? " em " + categoryLabelReadable(category) : "";

        String chatText;
        String speechText;

        if (transactions.isEmpty()) {
            chatText = "Não encontrei **gastos**" + scopeText + ".";
            speechText = "Não encontrei gastos" + scopeSpeech + " até o momento.";
        } else {
            chatText = "Encontrei **" + count + " " + (count == 1 ? "gasto" : "gastos") + "**" + scopeText + ", totalizando **" + formatCurrency(totalCents) + "**.";
            speechText = buildExpensesSpeechNarrative(count, totalCents, transactions);
        }

        CardPayload summaryCard = CardPayload.builder()
                .type("summary")
                .title("Total de gastos")
                .value(centsToDouble(totalCents))
                .build();

        List<StructuredTransactionPayload> structuredTxs = transactions.stream()
                .map(this::toStructuredPayload)
                .toList();

        return VoiceResponse.builder()
                .action(category != null ? "LIST_TRANSACTIONS_BY_CATEGORY" : "LIST_TRANSACTIONS")
                .transcription(transcription)
                .summary(buildSummary(transactions))
                .message(MessagePayload.builder()
                        .text(chatText)
                        .speech(speechText)
                        .build())
                .cards(List.of(summaryCard))
                .transactions(structuredTxs)
                .build();
    }

    private VoiceResponse buildCreateTransactionResponse(String transcription, String lowerText) {
        Long amountCentavos = extractAmountInCents(lowerText);
        if (amountCentavos == null || amountCentavos <= 0) {
            return VoiceResponse.builder()
                    .action("NEEDS_AMOUNT")
                    .transcription(transcription)
                    .message(MessagePayload.builder()
                            .text("Entendi seu comando, mas não identifiquei um valor. Por exemplo, diga: **\"Gastei R$ 45 no mercado\"**.")
                            .speech("Entendi seu comando mas não identifiquei um valor. Por exemplo diga: gastei quarenta e cinco reais no mercado.")
                            .build())
                    .cards(List.of())
                    .transactions(List.of())
                    .build();
        }

        Category category = detectCategory(lowerText);
        Category finalCategory = category != null ? category : Category.OTHER;

        TransactionRequest request = TransactionRequest.builder()
                .description(buildDescription(transcription))
                .amount(amountCentavos)
                .category(finalCategory)
                .build();

        TransactionResponse tx = transactionService.createTransaction(request);

        boolean isIncome = INCOME_CATEGORIES.contains(finalCategory);
        String actionType = isIncome ? "income" : "expense";
        String verb = isIncome ? "Recebeu" : "Gastou";

        String chatText = "Registrado! **" + tx.getDescription() + "** no valor de **" + formatCurrency(tx.getAmount()) + "** em **" + categoryLabelReadable(finalCategory) + "**.";
        String speechText = (isIncome ? "Você recebeu " : "Você gastou ") + formatMoneyToSpeech(tx.getAmount()) + " no " + tx.getDescription().replace("Voz: ", "");

        StructuredTransactionPayload structuredTx = toStructuredPayload(tx);

        return VoiceResponse.builder()
                .action("CREATE_TRANSACTION")
                .transcription(transcription)
                .transaction(tx)
                .message(MessagePayload.builder()
                        .text(chatText)
                        .speech(speechText)
                        .build())
                .cards(List.of(CardPayload.builder()
                        .type(actionType)
                        .title(verb + " registrado")
                        .value(centsToDouble(tx.getAmount()))
                        .build()))
                .transactions(List.of(structuredTx))
                .build();
    }

    /* ── Converters and Formatters for Rules 2.1 to 2.11 ── */

    private StructuredTransactionPayload toStructuredPayload(TransactionResponse tx) {
        boolean isIncome = INCOME_CATEGORIES.contains(tx.getCategory());
        String cleanDescription = tx.getDescription() != null && tx.getDescription().startsWith("Voz: ")
                ? tx.getDescription().substring(5)
                : tx.getDescription();

        String formattedDate = tx.getCreatedAt() != null ? tx.getCreatedAt().format(ISO_FORMATTER) : LocalDateTime.now().format(ISO_FORMATTER);

        return StructuredTransactionPayload.builder()
                .id(String.valueOf(tx.getId()))
                .type(isIncome ? "income" : "expense")
                .description(cleanDescription)
                .amount(centsToDouble(tx.getAmount()))
                .category(categoryLabelReadable(tx.getCategory()))
                .date(formattedDate)
                .source("voice")
                .build();
    }

    private String buildExpensesSpeechNarrative(int count, long totalCents, List<TransactionResponse> txs) {
        StringBuilder sb = new StringBuilder();
        sb.append("Encontrei ").append(numberToSpokenText(count)).append(count == 1 ? " gasto" : " gastos")
          .append(", totalizando ").append(formatMoneyToSpeech(totalCents)).append(". ");

        int limit = Math.min(txs.size(), 4);
        if (limit > 0) {
            List<String> items = new ArrayList<>();
            for (int i = 0; i < limit; i++) {
                TransactionResponse t = txs.get(i);
                String desc = t.getDescription() != null ? t.getDescription().replace("Voz: ", "") : categoryLabelReadable(t.getCategory());
                items.add(formatMoneyToSpeech(t.getAmount()) + " no " + desc);
            }
            sb.append("Você gastou ");
            if (items.size() == 1) {
                sb.append(items.get(0));
            } else {
                for (int i = 0; i < items.size(); i++) {
                    if (i > 0 && i == items.size() - 1) {
                        sb.append(" e ");
                    } else if (i > 0) {
                        sb.append(", ");
                    }
                    sb.append(items.get(i));
                }
            }
            sb.append(".");
        }
        return sb.toString();
    }

    private String formatMoneyToSpeech(long cents) {
        if (cents == 0) return "zero reais";

        long reais = cents / 100;
        long centavos = cents % 100;

        StringBuilder sb = new StringBuilder();

        if (reais > 0) {
            sb.append(numberToSpokenText(reais)).append(reais == 1 ? " real" : " reais");
        }

        if (centavos > 0) {
            if (reais > 0) {
                sb.append(" e ");
            }
            sb.append(numberToSpokenText(centavos)).append(centavos == 1 ? " centavo" : " centavos");
        }

        return sb.toString();
    }

    private String numberToSpokenText(long n) {
        if (n < 0) return "menos " + numberToSpokenText(-n);
        if (n == 0) return "zero";
        if (n == 1) return "um";
        if (n == 2) return "dois";
        if (n == 3) return "três";
        if (n == 4) return "quatro";
        if (n == 5) return "cinco";
        if (n == 6) return "seis";
        if (n == 7) return "sete";
        if (n == 8) return "oito";
        if (n == 9) return "nove";
        if (n == 10) return "dez";
        if (n == 11) return "onze";
        if (n == 12) return "doze";
        if (n == 13) return "treze";
        if (n == 14) return "quatorze";
        if (n == 15) return "quinze";
        if (n == 16) return "dezesseis";
        if (n == 17) return "dezessete";
        if (n == 18) return "dezoito";
        if (n == 19) return "dezenove";
        if (n == 20) return "vinte";
        if (n == 30) return "trinta";
        if (n == 40) return "quarenta";
        if (n == 50) return "cinquenta";
        if (n == 60) return "sessenta";
        if (n == 70) return "setenta";
        if (n == 80) return "oitenta";
        if (n == 90) return "noventa";
        if (n == 100) return "cem";
        if (n == 200) return "duzentos";
        if (n == 300) return "trezentos";
        if (n == 400) return "quatrocentos";
        if (n == 500) return "quinhentos";
        if (n == 600) return "seiscentos";
        if (n == 700) return "setecentos";
        if (n == 800) return "oitocentos";
        if (n == 900) return "novecentos";
        if (n == 1000) return "mil";

        if (n > 20 && n < 100) {
            long tens = (n / 10) * 10;
            long units = n % 10;
            return numberToSpokenText(tens) + " e " + numberToSpokenText(units);
        }

        if (n > 100 && n < 1000) {
            long hundreds = (n / 100) * 100;
            long rest = n % 100;
            String prefix = (hundreds == 100) ? "cento" : numberToSpokenText(hundreds);
            return prefix + " e " + numberToSpokenText(rest);
        }

        if (n > 1000 && n < 1000000) {
            long thousands = n / 1000;
            long rest = n % 1000;
            String prefix = (thousands == 1) ? "mil" : numberToSpokenText(thousands) + " mil";
            if (rest == 0) return prefix;
            if (rest < 100 || rest % 100 == 0) return prefix + " e " + numberToSpokenText(rest);
            return prefix + " " + numberToSpokenText(rest);
        }

        return String.valueOf(n);
    }

    private double centsToDouble(long cents) {
        return BigDecimal.valueOf(cents, 2).doubleValue();
    }

    private String categoryLabelReadable(Category category) {
        if (category == null) return "Geral";
        return switch (category) {
            case FOOD -> "Alimentação";
            case HEALTH -> "Saúde";
            case TRANSPORT -> "Transporte";
            case SHOPPING -> "Compras";
            case LEISURE -> "Lazer";
            case HOME -> "Casa";
            case EDUCATION -> "Educação";
            case SERVICES -> "Serviços";
            case INVESTMENTS -> "Investimentos";
            case SALARY -> "Receita";
            case OTHER -> "Outros";
        };
    }

    private String formatCurrency(long cents) {
        return BRL.format(BigDecimal.valueOf(cents, 2));
    }

    /* ── Intent and Parsing Helpers ── */

    private boolean isBalanceIntent(String text) {
        return text.contains("saldo")
                || text.contains("quanto tenho")
                || text.contains("quanto eu tenho")
                || text.contains("dinheiro tenho")
                || text.contains("disponível")
                || text.contains("disponivel");
    }

    private boolean isListIntent(String text) {
        return text.contains("liste")
                || text.contains("listar")
                || text.contains("lista")
                || text.contains("mostre")
                || text.contains("mostrar")
                || text.contains("quais são")
                || text.contains("quais foram")
                || text.contains("transações")
                || text.contains("transacoes")
                || text.contains("lançamentos")
                || text.contains("lancamentos");
    }

    private boolean isExpenseQuestion(String text) {
        return text.contains("quanto gastei")
                || text.contains("quanto eu gastei")
                || text.contains("meus gastos")
                || text.contains("gastos com")
                || text.contains("gastos de");
    }

    private Category detectCategory(String text) {
        if (containsAny(text, "mercado", "supermercado", "almoço", "almoco", "comida", "restaurante", "delivery", "ifood", "lanche")) {
            return Category.FOOD;
        }
        if (containsAny(text, "uber", "gasolina", "combustível", "combustivel", "transporte", "ônibus", "onibus", "metro", "metrô")) {
            return Category.TRANSPORT;
        }
        if (containsAny(text, "remédio", "remedio", "farmácia", "farmacia", "médico", "medico", "consulta", "saúde", "saude")) {
            return Category.HEALTH;
        }
        if (containsAny(text, "cinema", "viagem", "jogo", "lazer", "show", "bar")) {
            return Category.LEISURE;
        }
        if (containsAny(text, "aluguel", "condomínio", "condominio", "luz", "energia", "água", "agua", "casa", "internet")) {
            return Category.HOME;
        }
        if (containsAny(text, "curso", "livro", "faculdade", "escola", "educação", "educacao")) {
            return Category.EDUCATION;
        }
        if (containsAny(text, "salário", "salario", "recebi", "renda", "freelance", "pagamento")) {
            return Category.SALARY;
        }
        if (containsAny(text, "roupa", "shopping", "compra", "presente", "eletrônico", "eletronico")) {
            return Category.SHOPPING;
        }
        if (containsAny(text, "investimento", "investi", "cdb", "poupança", "poupanca", "ação", "acao")) {
            return Category.INVESTMENTS;
        }
        if (containsAny(text, "serviço", "servico", "academia", "assinatura")) {
            return Category.SERVICES;
        }
        return null;
    }

    private Long extractAmountInCents(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        String lowerText = text.toLowerCase(PT_BR);

        Matcher milMatcher = Pattern.compile("(\\d+(?:[\\.,]\\d{1,2})?)\\s*mil", Pattern.CASE_INSENSITIVE).matcher(lowerText);
        if (milMatcher.find()) {
            try {
                String raw = milMatcher.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(raw).multiply(BigDecimal.valueOf(1000));
                return val.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
            } catch (Exception ignored) {}
        }

        Pattern pattern = Pattern.compile("(\\d{1,3}(?:[\\.,\\s]\\d{3})*(?:[\\.,]\\d{1,2})?|\\d+)");
        Matcher matcher = pattern.matcher(text);

        Long bestDigitAmount = null;
        while (matcher.find()) {
            String raw = matcher.group(1).trim();
            Long cents = parseRawNumberToCents(raw, text);
            if (cents != null && cents > 0) {
                bestDigitAmount = cents;
                if (cents >= 100000) {
                    return cents;
                }
            }
        }

        if (bestDigitAmount != null) {
            return bestDigitAmount;
        }

        return parseSpokenMil(lowerText);
    }

    private Long parseRawNumberToCents(String raw, String fullText) {
        try {
            String clean = raw.replaceAll("\\s+", "");

            if (clean.contains(".") && clean.contains(",")) {
                int lastDot = clean.lastIndexOf('.');
                int lastComma = clean.lastIndexOf(',');
                if (lastComma > lastDot) {
                    clean = clean.replace(".", "").replace(',', '.');
                } else {
                    clean = clean.replace(",", "");
                }
            } else if (clean.contains(".")) {
                int dotIndex = clean.lastIndexOf('.');
                int digitsAfterDot = clean.length() - 1 - dotIndex;
                if (digitsAfterDot == 3) {
                    clean = clean.replace(".", "");
                }
            } else if (clean.contains(",")) {
                int commaIndex = clean.lastIndexOf(',');
                int digitsAfterComma = clean.length() - 1 - commaIndex;
                if (digitsAfterComma == 3) {
                    clean = clean.replace(",", "");
                } else {
                    clean = clean.replace(',', '.');
                }
            }

            BigDecimal value = new BigDecimal(clean);
            if (fullText.toLowerCase(PT_BR).contains("centavo")) {
                return value.setScale(0, RoundingMode.HALF_UP).longValue();
            }
            return value.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseSpokenMil(String text) {
        if (!text.contains("mil")) return null;

        long thousands = 0;
        if (text.contains("dez mil")) thousands = 10000;
        else if (text.contains("nove mil")) thousands = 9000;
        else if (text.contains("oito mil")) thousands = 8000;
        else if (text.contains("sete mil")) thousands = 7000;
        else if (text.contains("seis mil")) thousands = 6000;
        else if (text.contains("cinco mil")) thousands = 5000;
        else if (text.contains("quatro mil")) thousands = 4000;
        else if (text.contains("três mil") || text.contains("tres mil")) thousands = 3000;
        else if (text.contains("dois mil")) thousands = 2000;
        else if (text.contains("um mil") || text.contains("mil")) thousands = 1000;

        if (thousands == 0) return null;

        long rest = 0;
        if (text.contains("novecentos")) rest += 900;
        else if (text.contains("oitocentos")) rest += 800;
        else if (text.contains("setecentos")) rest += 700;
        else if (text.contains("seiscentos")) rest += 600;
        else if (text.contains("quinhentos")) rest += 500;
        else if (text.contains("quatrocentos")) rest += 400;
        else if (text.contains("trezentos")) rest += 300;
        else if (text.contains("duzentos")) rest += 200;
        else if (text.contains("cem") || text.contains("cento")) rest += 100;

        return (thousands + rest) * 100;
    }

    private SummaryResponse buildSummary(List<TransactionResponse> transactions) {
        Map<Category, Long> categories = transactions.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        TransactionResponse::getCategory,
                        () -> new java.util.EnumMap<>(Category.class),
                        java.util.stream.Collectors.summingLong(TransactionResponse::getAmount)
                ));

        long total = transactions.stream().mapToLong(TransactionResponse::getAmount).sum();

        return SummaryResponse.builder()
                .total(total)
                .categories(categories)
                .build();
    }

    private String buildDescription(String text) {
        String trimmed = text.trim();
        if (trimmed.length() > 80) {
            trimmed = trimmed.substring(0, 77) + "...";
        }
        return "Voz: " + trimmed;
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
    }
}
