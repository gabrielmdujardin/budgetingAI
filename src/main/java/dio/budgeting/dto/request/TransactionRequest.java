package dio.budgeting.dto.request;

import dio.budgeting.domain.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para criação de uma nova transação financeira")
public class TransactionRequest {

    @NotBlank(message = "A descrição é obrigatória")
    @Schema(description = "Descrição detalhada do gasto ou receita", example = "Compra no supermercado")
    private String description;

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser maior que zero")
    @Schema(description = "Valor monetário em centavos (ex: 15000 representa R$ 150,00)", example = "15000")
    private Long amount;

    @NotNull(message = "A categoria é obrigatória")
    @Schema(description = "Categoria financeira da transação", example = "FOOD")
    private Category category;
}
