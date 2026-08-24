package dio.budgeting.service;

import dio.budgeting.domain.Category;
import dio.budgeting.dto.AgentExecutionResult;
import dio.budgeting.dto.request.TransactionRequest;
import dio.budgeting.dto.response.SummaryResponse;
import dio.budgeting.dto.response.TransactionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Agente financeiro inteligente baseado no Ollama via Spring AI Tool Calling.
 *
 * <p>O fluxo é: texto transcrito → Ollama (reasoning) → chamada de tool Java → resposta estruturada.
 * O modelo decide qual ferramenta usar e com quais argumentos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OllamaAgentService {

    private final ChatClient chatClient;
    private final TransactionService transactionService;

    @Value("${app.finances.opening-balance-cents:500000}")
    private long openingBalanceCents;

    private static final ThreadLocal<AgentExecutionResult> CURRENT_EXECUTION = ThreadLocal.withInitial(AgentExecutionResult::new);

    private static final String SYSTEM_PROMPT = """
            Você é um assistente financeiro pessoal inteligente chamado "Fin".
            Você interpreta comandos de voz transcritos em português e executa ações financeiras.

            REGRAS OBRIGATÓRIAS:
            1. Sempre chame uma das ferramentas disponíveis. Nunca responda apenas com texto sem chamar uma ferramenta.
            2. Para registrar gastos ou receitas, use registerTransaction.
            3. Para perguntas sobre saldo, use getBalance.
            4. Para listar transações, use listTransactions.
            5. Para gastos por categoria, use getSpendingByCategory.
            6. O valor monetário deve ser em CENTAVOS (ex: R$ 50,00 = 5000 centavos).
            7. Classifique em uma destas categorias padrão: FOOD, HEALTH, TRANSPORT, SHOPPING, LEISURE, HOME, EDUCATION, SERVICES, INVESTMENTS, SALARY, OTHER.
            8. Se o usuário mencionar uma categoria que NÃO está nas categorias padrão (ex: Tatuagem, Criptomoedas, Doação), você DEVE usar a ferramenta requestCategoryCreation para pedir confirmação antes de criar a transação.
            9. Use SALARY para receitas (salário, freelance, pagamentos recebidos).
            10. Se o comando for ambíguo ou não entendido, use listTransactions sem filtro.
            """;

    /**
     * Processa o texto transcrito via Ollama com Tool Calling, retornando a resposta textual.
     */
    public String processCommand(String transcription) {
        AgentExecutionResult detailed = processCommandDetailed(transcription);
        return detailed != null ? detailed.getResponseText() : null;
    }

    /**
     * Processa o texto transcrito via Ollama com Tool Calling e captura os detalhes de execução e entidades.
     */
    public AgentExecutionResult processCommandDetailed(String transcription) {
        try {
            log.info("Enviando ao Ollama: {}", transcription);
            CURRENT_EXECUTION.set(new AgentExecutionResult());

            String response = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(transcription)
                    .tools(this)
                    .call()
                    .content();

            log.info("Resposta do Ollama: {}", response);
            AgentExecutionResult result = CURRENT_EXECUTION.get();
            result.setResponseText(response);
            if (result.getAction() == null) {
                result.setAction("GENERAL_CHAT");
            }
            return result;
        } catch (Exception e) {
            log.warn("Falha ao chamar Ollama: {}", e.getMessage());
            return null;
        } finally {
            CURRENT_EXECUTION.remove();
        }
    }

    // ─── Tools expostas ao Ollama ────────────────────────────────────────────

    @Tool(description = "Registra uma nova transação financeira (gasto ou receita). Use esta tool sempre que o usuário mencionar que gastou, pagou, comprou, investiu ou recebeu algum valor.")
    public String registerTransaction(
            @ToolParam(description = "Descrição concisa do gasto ou receita, ex: 'Mercado', 'Uber', 'Salário maio'") String description,
            @ToolParam(description = "Valor em centavos inteiros, ex: R$ 50,00 = 5000, R$ 1.200,00 = 120000") long amountInCents,
            @ToolParam(description = "Categoria: FOOD, HEALTH, TRANSPORT, SHOPPING, LEISURE, HOME, EDUCATION, SERVICES, INVESTMENTS, SALARY ou OTHER") String category
    ) {
        try {
            Category cat = parseCategory(category);
            TransactionRequest request = TransactionRequest.builder()
                    .description(description)
                    .amount(amountInCents)
                    .category(cat)
                    .build();
            TransactionResponse saved = transactionService.createTransaction(request);
            log.info("Transação registrada via Ollama: id={}, desc={}, amount={}", saved.getId(), description, amountInCents);

            AgentExecutionResult exec = CURRENT_EXECUTION.get();
            exec.setAction("CREATE_TRANSACTION");
            exec.setCreatedTransaction(saved);
            exec.setFilterCategory(cat);

            return "Transação registrada com sucesso: %s — R$ %.2f (categoria: %s, ID: %d)"
                    .formatted(description, amountInCents / 100.0, cat.name(), saved.getId());
        } catch (Exception e) {
            log.error("Erro ao registrar transação via Ollama", e);
            return "Erro ao registrar a transação: " + e.getMessage();
        }
    }

    @Tool(description = "Solicita confirmação ao usuário para criar uma NOVA categoria. Use APENAS se a categoria mencionada não estiver na lista de padrões (ex: Tatuagem).")
    public String requestCategoryCreation(
            @ToolParam(description = "Nome da nova categoria sugerida pelo usuário (ex: 'Tatuagem', 'Cripto')") String categoryName,
            @ToolParam(description = "Valor da transação pendente em centavos (ex: 5000)") long amountInCents,
            @ToolParam(description = "Descrição concisa do gasto/receita pendente (ex: 'Sessão de tatuagem')") String description,
            @ToolParam(description = "Tipo da categoria: 'expense' para gasto, 'income' para receita") String type
    ) {
        AgentExecutionResult exec = CURRENT_EXECUTION.get();
        exec.setAction("CONFIRM_NEW_CATEGORY");
        
        // Passamos os detalhes temporários na transação criada falsamente (não salva no banco)
        // para que o frontend possa exibi-la no Card de Confirmação.
        TransactionResponse pending = TransactionResponse.builder()
            .description(description)
            .amount(amountInCents)
            .category(Category.OTHER)
            .customCategory(categoryName)
            .createdAt(java.time.LocalDateTime.now())
            .build();
            
        exec.setCreatedTransaction(pending);
        
        return "Solicitação enviada. O usuário verá um botão na tela para confirmar a criação da categoria '" + categoryName + "'. Diga apenas: Confirme a criação na tela para continuarmos.";
    }

    @Tool(description = "Retorna o saldo financeiro estimado do usuário, calculado com base nas receitas e despesas registradas.")
    public String getBalance() {
        AgentExecutionResult exec = CURRENT_EXECUTION.get();
        exec.setAction("BALANCE");

        List<TransactionResponse> all = transactionService.getTransactions(null, null, null);
        long income = all.stream()
                .filter(t -> t.getCategory() == Category.SALARY || t.getCategory() == Category.INVESTMENTS)
                .mapToLong(TransactionResponse::getAmount).sum();
        long expenses = all.stream()
                .filter(t -> t.getCategory() != Category.SALARY && t.getCategory() != Category.INVESTMENTS)
                .mapToLong(TransactionResponse::getAmount).sum();
        long balance = openingBalanceCents + income - expenses;
        return "Saldo estimado: R$ %.2f (receitas: R$ %.2f | despesas: R$ %.2f)"
                .formatted(balance / 100.0, income / 100.0, expenses / 100.0);
    }

    @Tool(description = "Lista as transações registradas. Pode filtrar por categoria. Use quando o usuário pedir para ver, listar ou mostrar transações.")
    public String listTransactions(
            @ToolParam(description = "Categoria para filtrar (FOOD, TRANSPORT, etc.) ou null para listar todas") String category
    ) {
        Category cat = (category != null && !category.isBlank() && !category.equalsIgnoreCase("null"))
                ? parseCategory(category) : null;
        List<TransactionResponse> txs = transactionService.getTransactions(cat, null, null);

        AgentExecutionResult exec = CURRENT_EXECUTION.get();
        exec.setAction("LIST_TRANSACTIONS");
        exec.setFetchedTransactions(txs);
        exec.setFilterCategory(cat);

        if (txs.isEmpty()) {
            return cat != null
                    ? "Nenhuma transação encontrada na categoria " + cat.name() + "."
                    : "Nenhuma transação registrada ainda.";
        }
        return "Encontrei %d transações. Os detalhes foram exibidos na tela.".formatted(txs.size());
    }

    @Tool(description = "Retorna o total gasto por categoria no mês atual. Use quando o usuário perguntar quanto gastou em uma categoria específica ou no geral.")
    public String getSpendingByCategory(
            @ToolParam(description = "Categoria específica (FOOD, TRANSPORT, etc.) ou null para ver todas as categorias") String category
    ) {
        SummaryResponse summary = transactionService.getSummary();
        Category cat = (category != null && !category.isBlank() && !category.equalsIgnoreCase("null"))
                ? parseCategory(category) : null;

        AgentExecutionResult exec = CURRENT_EXECUTION.get();
        exec.setAction("SPENDING_BY_CATEGORY");
        exec.setSummary(summary);
        exec.setFilterCategory(cat);

        if (cat != null) {
            Long amount = summary.getCategories().get(cat);
            return amount != null
                    ? "Os gastos em %s este mês somam R$ %.2f. Detalhes na tela.".formatted(cat.name(), amount / 100.0)
                    : "Nenhum gasto registrado em %s este mês.".formatted(cat.name());
        }
        return "Resumo de gastos do mês gerado com sucesso. Detalhes exibidos na tela.";
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Category parseCategory(String raw) {
        if (raw == null) return Category.OTHER;
        try {
            return Category.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Categoria inválida recebida do Ollama: '{}', usando OTHER", raw);
            return Category.OTHER;
        }
    }
}

