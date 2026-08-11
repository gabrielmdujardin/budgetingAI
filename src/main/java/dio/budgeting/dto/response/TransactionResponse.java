package dio.budgeting.dto.response;

import dio.budgeting.domain.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Representação de uma transação cadastrada")
public class TransactionResponse {

    @Schema(description = "Identificador único da transação", example = "1")
    private Long id;

    @Schema(description = "Descrição da transação", example = "Compra no supermercado")
    private String description;

    @Schema(description = "Valor em centavos", example = "15000")
    private Long amount;

    @Schema(description = "Categoria da transação", example = "FOOD")
    private Category category;

    @Schema(description = "Data e hora de criação", example = "2026-08-05T11:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Data e hora da última atualização", example = "2026-08-05T11:30:00")
    private LocalDateTime updatedAt;
}
