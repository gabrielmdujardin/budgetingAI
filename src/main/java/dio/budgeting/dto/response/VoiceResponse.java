package dio.budgeting.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Resposta estruturada do assistente de voz para chat e síntese de áudio (TTS)")
public class VoiceResponse {

    @Schema(description = "Estrutura de mensagens (texto formatado para o chat e speech exclusivamente para TTS)")
    private MessagePayload message;

    @Schema(description = "Cards visuais de resumo para a interface")
    private List<CardPayload> cards;

    @Schema(description = "Lista de lançamentos/transações estruturadas")
    private List<StructuredTransactionPayload> transactions;

    // Campos retrocompatíveis caso outros componentes dependam
    @Schema(description = "Tipo de ação executada pelo assistente (retrocompatibilidade)", example = "CREATE_TRANSACTION")
    private String action;

    @Schema(description = "Texto transcrito do áudio (retrocompatibilidade)", example = "Gastei 150 reais no mercado hoje")
    private String transcription;

    @Schema(description = "Saldo estimado em centavos (retrocompatibilidade)")
    private Long balance;

    @Schema(description = "Resumo financeiro (retrocompatibilidade)")
    private SummaryResponse summary;

    @Schema(description = "Detalhes da transação criada (retrocompatibilidade)")
    private TransactionResponse transaction;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessagePayload {
        @Schema(description = "Texto exibido no chat (pode conter Markdown simples e R$)", example = "Encontrei **5 gastos**, totalizando **R$ 291,00**.")
        private String text;

        @Schema(description = "Texto exclusivo para síntese de voz (TTS), sem pontuações faladas e com valores por extenso", example = "Encontrei cinco gastos, totalizando duzentos e noventa e um reais.")
        private String speech;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardPayload {
        @Schema(description = "Tipo do card visual (balance, income, expense, summary, goal, chart)", example = "balance")
        private String type;

        @Schema(description = "Título do card", example = "Saldo estimado")
        private String title;

        @Schema(description = "Valor numérico do card em Reais", example = "14729.00")
        private Double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StructuredTransactionPayload {
        @Schema(description = "ID único da transação", example = "1")
        private String id;

        @Schema(description = "Tipo de lançamento (income ou expense)", example = "expense")
        private String type;

        @Schema(description = "Descrição do lançamento", example = "Mercado")
        private String description;

        @Schema(description = "Valor da transação em Reais (ex: 45.00)", example = "45.00")
        private Double amount;

        @Schema(description = "Categoria formatada", example = "Alimentação")
        private String category;

        @Schema(description = "Data no formato ISO 8601", example = "2026-08-13T14:55:00")
        private String date;

        @Schema(description = "Origem do lançamento (voice, manual, etc)", example = "voice")
        private String source;
    }
}
