package dio.budgeting.dto;

import dio.budgeting.domain.Category;
import dio.budgeting.dto.response.SummaryResponse;
import dio.budgeting.dto.response.TransactionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentExecutionResult {
    private String responseText;
    private String action; // CREATE_TRANSACTION, BALANCE, LIST_TRANSACTIONS, SPENDING_BY_CATEGORY, GENERAL_CHAT
    private TransactionResponse createdTransaction;
    private List<TransactionResponse> fetchedTransactions;
    private Category filterCategory;
    private SummaryResponse summary;
}
