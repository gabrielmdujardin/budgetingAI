package dio.budgeting.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta do processamento inteligente de comando de voz")
public class VoiceResponse {

    @Schema(description = "Tipo de ação executada pelo assistente", example = "CREATE_TRANSACTION")
    private String action;

    @Schema(description = "Mensagem explicativa do assistente IA", example = "Transação criada com sucesso")
    private String message;

    @Schema(description = "Texto transcrito a partir do áudio", example = "Gastei 150 reais no mercado hoje")
    private String transcription;

    @Schema(description = "Saldo estimado em centavos quando a intenção for consulta de saldo", example = "487660")
    private Long balance;

    @Schema(description = "Resumo financeiro quando aplicável")
    private SummaryResponse summary;

    @Schema(description = "Detalhes da transação criada, quando aplicável")
    private TransactionResponse transaction;

    @Schema(description = "Lista de transações encontradas em comandos de consulta")
    private List<TransactionResponse> transactions;
}
