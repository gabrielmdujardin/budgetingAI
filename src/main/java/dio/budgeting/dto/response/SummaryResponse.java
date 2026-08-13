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

    @Schema(description = "Soma total de todas as transacoes (receitas + despesas) em centavos", example = "150000")
    private Long total;

    @Schema(description = "Total apenas das receitas (SALARY, INVESTMENTS) em centavos", example = "500000")
    private Long totalIncome;

    @Schema(description = "Total apenas das despesas (todas as categorias exceto SALARY e INVESTMENTS) em centavos", example = "150000")
    private Long totalExpenses;

    @Schema(description = "Mapeamento das categorias com seus respectivos totais em centavos")
    private Map<Category, Long> categories;
}

