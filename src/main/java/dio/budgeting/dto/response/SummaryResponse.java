package dio.budgeting.dto.response;

import dio.budgeting.domain.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resumo acumulado dos gastos por categoria e total")
public class SummaryResponse {

    @Schema(description = "Soma total dos gastos em centavos", example = "150000")
    private Long total;

    @Schema(description = "Mapeamento das categorias com seus respectivos totais em centavos")
    private Map<Category, Long> categories;
}
