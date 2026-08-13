package dio.budgeting.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitação de comando de texto para a IA assistente")
public class TextCommandRequest {

    @NotBlank(message = "O texto do comando não pode estar em branco")
    @Schema(description = "Comando em texto enviado pelo usuário", example = "Gastei 45 reais no mercado hoje")
    private String text;
}
