package dio.budgeting.service;

import dio.budgeting.domain.Category;
import dio.budgeting.dto.request.TransactionRequest;
import dio.budgeting.dto.response.SummaryResponse;
import dio.budgeting.dto.response.TransactionResponse;
import dio.budgeting.dto.response.VoiceResponse;
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
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceAssistantService {

    private static final Locale PT_BR = Locale.of("pt", "BR");
    private static final NumberFormat BRL = NumberFormat.getCurrencyInstance(PT_BR);
    private static final Pattern MONEY_PATTERN = Pattern.compile("(\\d+(?:[\\.,]\\d{1,2})?)");

    private final TransactionService transactionService;

    @Value("${app.whisper.base-url:http://localhost:8000}")
    private String whisperBaseUrl;

    @Value("${app.finances.opening-balance-cents:500000}")
    private long openingBalanceCents;

    public VoiceResponse processVoiceCommand(MultipartFile audioFile) {
        if (audioFile == null || audioFile.isEmpty()) {
            return VoiceResponse.builder()
                    .action("INVALID_AUDIO")
                    .message("Não recebi um arquivo de áudio válido. Grave novamente ou envie outro arquivo.")
                    .transcription("")
                    .build();
        }

        String transcription = transcribeAudio(audioFile);
        log.info("Transcrição obtida: {}", transcription);

        if (transcription == null || transcription.isBlank()) {
            return VoiceResponse.builder()
                    .action("TRANSCRIPTION_FAILED")
                    .message("Recebi seu áudio, mas não consegui transcrever com segurança. Verifique se o Faster-Whisper está rodando e tente gravar novamente.")
                    .transcription("")
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

        if (isListIntent(lowerText) || isExpenseQuestion(lowerText)) {
            return buildTransactionsResponse(text, detectCategory(lowerText));
        }

        return buildCreateTransactionResponse(text, lowerText);
    }

    private static final java.util.Set<Category> INCOME_CATEGORIES =
            java.util.Set.of(Category.SALARY, Category.INVESTMENTS);

    private VoiceResponse buildBalanceResponse(String transcription) {
        List<TransactionResponse> transactions = transactionService.getTransactions(null, null, null);
        long income = transactions.stream()
                .filter(t -> INCOME_CATEGORIES.contains(t.getCategory()))
                .mapToLong(TransactionResponse::getAmount)
                .sum();
        long expenses = transactions.stream()
                .filter(t -> !INCOME_CATEGORIES.contains(t.getCategory()))
                .mapToLong(TransactionResponse::getAmount)
                .sum();
        long balance = openingBalanceCents + income - expenses;

        String message = "Seu saldo estimado e " + formatCurrency(balance)
                + ". Considerei saldo inicial de " + formatCurrency(openingBalanceCents)
                + ", receitas de " + formatCurrency(income)
                + " e gastos de " + formatCurrency(expenses) + ".";

        return VoiceResponse.builder()
                .action("BALANCE")
                .message(message)
                .transcription(transcription)
                .balance(balance)
                .summary(buildSummary(transactions))
                .transactions(limit(transactions, 8))
                .build();
    }

    private VoiceResponse buildTransactionsResponse(String transcription, Category category) {
        List<TransactionResponse> transactions = transactionService.getTransactions(category, null, null).stream()
                .filter(t -> !INCOME_CATEGORIES.contains(t.getCategory()))
                .sorted(Comparator.comparing(TransactionResponse::getCreatedAt).reversed())
                .toList();

        long total = transactions.stream().mapToLong(TransactionResponse::getAmount).sum();
        List<TransactionResponse> limited = limit(transactions, 8);

        String scope = category != null ? " em " + categoryLabel(category) : "";
        String message;
        if (transactions.isEmpty()) {
            message = "Não encontrei gastos" + scope + " até agora.";
        } else {
            message = "Encontrei " + transactions.size() + " gasto(s)" + scope
                    + ", totalizando " + formatCurrency(total) + ". " + summarizeTransactions(limited);
        }

        return VoiceResponse.builder()
                .action(category != null ? "LIST_TRANSACTIONS_BY_CATEGORY" : "LIST_TRANSACTIONS")
                .message(message)
                .transcription(transcription)
                .summary(buildSummary(transactions))
                .transactions(limited)
                .build();
    }

    private VoiceResponse buildCreateTransactionResponse(String transcription, String lowerText) {
        Long amountCentavos = extractAmountInCents(lowerText);
        if (amountCentavos == null || amountCentavos <= 0) {
            return VoiceResponse.builder()
                    .action("NEEDS_AMOUNT")
                    .message("Entendi o comando, mas não encontrei um valor. Tente dizer algo como: gastei 45 reais no mercado.")
                    .transcription(transcription)
                    .build();
        }

        Category category = detectCategory(lowerText);
        TransactionRequest request = TransactionRequest.builder()
                .description(buildDescription(transcription))
                .amount(amountCentavos)
                .category(category != null ? category : Category.OTHER)
                .build();

        TransactionResponse transaction = transactionService.createTransaction(request);

        return VoiceResponse.builder()
                .action("CREATE_TRANSACTION")
                .message("Registrei " + formatCurrency(transaction.getAmount()) + " em "
                        + categoryLabel(transaction.getCategory()) + ". Descrição: " + transaction.getDescription() + ".")
                .transcription(transcription)
                .transaction(transaction)
                .build();
    }

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

        // 1. Check for "X mil" or "X,Y mil" (e.g. "2 mil", "1,5 mil", "1.5 mil")
        Matcher milMatcher = Pattern.compile("(\\d+(?:[\\.,]\\d{1,2})?)\\s*mil", Pattern.CASE_INSENSITIVE).matcher(lowerText);
        if (milMatcher.find()) {
            try {
                String raw = milMatcher.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(raw).multiply(BigDecimal.valueOf(1000));
                return val.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
            } catch (Exception ignored) {}
        }

        // 2. Extract formatted digits (e.g. "1.000", "1.500,50", "1000", "10.000,00", "45,50")
        Pattern pattern = Pattern.compile("(\\d{1,3}(?:[\\.,\\s]\\d{3})*(?:[\\.,]\\d{1,2})?|\\d+)");
        Matcher matcher = pattern.matcher(text);

        Long bestDigitAmount = null;
        while (matcher.find()) {
            String raw = matcher.group(1).trim();
            Long cents = parseRawNumberToCents(raw, text);
            if (cents != null && cents > 0) {
                bestDigitAmount = cents;
                // If the digit amount is >= 100000 cents (R$ 1.000), return immediately
                if (cents >= 100000) {
                    return cents;
                }
            }
        }

        if (bestDigitAmount != null) {
            return bestDigitAmount;
        }

        // 3. Fallback to spoken "mil" (e.g. "gastei mil reais", "dois mil e quinhentos")
        return parseSpokenMil(lowerText);
    }

    private Long parseRawNumberToCents(String raw, String fullText) {
        try {
            String clean = raw.replaceAll("\\s+", "");

            if (clean.contains(".") && clean.contains(",")) {
                int lastDot = clean.lastIndexOf('.');
                int lastComma = clean.lastIndexOf(',');
                if (lastComma > lastDot) {
                    // Brazilian format: 1.500,50 -> 1500.50
                    clean = clean.replace(".", "").replace(',', '.');
                } else {
                    // US format: 1,500.50 -> 1500.50
                    clean = clean.replace(",", "");
                }
            } else if (clean.contains(".")) {
                int dotIndex = clean.lastIndexOf('.');
                int digitsAfterDot = clean.length() - 1 - dotIndex;
                if (digitsAfterDot == 3) {
                    // Thousand separator: 1.000, 10.000
                    clean = clean.replace(".", "");
                }
            } else if (clean.contains(",")) {
                int commaIndex = clean.lastIndexOf(',');
                int digitsAfterComma = clean.length() - 1 - commaIndex;
                if (digitsAfterComma == 3) {
                    // Thousand separator: 1,000
                    clean = clean.replace(",", "");
                } else {
                    // Decimal comma: 45,50
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

    private List<TransactionResponse> limit(List<TransactionResponse> transactions, int size) {
        return transactions.stream().limit(size).toList();
    }

    private String summarizeTransactions(List<TransactionResponse> transactions) {
        return transactions.stream()
                .map(transaction -> transaction.getDescription() + " (" + formatCurrency(transaction.getAmount()) + ")")
                .reduce((first, second) -> first + "; " + second)
                .orElse("");
    }

    private String buildDescription(String text) {
        String trimmed = text.trim();
        if (trimmed.length() > 80) {
            trimmed = trimmed.substring(0, 77) + "...";
        }
        return "Voz: " + trimmed;
    }

    private String categoryLabel(Category category) {
        return switch (category) {
            case FOOD -> "alimentação/mercado";
            case HEALTH -> "saúde";
            case TRANSPORT -> "transporte";
            case SHOPPING -> "compras";
            case LEISURE -> "lazer";
            case HOME -> "casa";
            case EDUCATION -> "educação";
            case SERVICES -> "serviços";
            case INVESTMENTS -> "investimentos";
            case SALARY -> "receita";
            case OTHER -> "outros";
        };
    }

    private String formatCurrency(long cents) {
        return BRL.format(BigDecimal.valueOf(cents, 2));
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
