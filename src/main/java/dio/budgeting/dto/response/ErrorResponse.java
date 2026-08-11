package dio.budgeting.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object) para respostas de erro da API.
 *
 * <p><strong>Por que um DTO de erro padronizado?</strong>
 * Sem um formato de erro consistente, cada exceção retorna uma estrutura
 * diferente, dificultando o tratamento no frontend/cliente.
 * Este DTO garante que TODOS os erros seguem o mesmo formato JSON.
 *
 * <p><strong>Exemplo de resposta:</strong>
 * <pre>
 * {
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Transação não encontrada com ID: 99",
 *   "path": "/transactions/99",
 *   "timestamp": "2024-01-15T10:30:00"
 * }
 * </pre>
 *
 * <p><strong>Por que usar record?</strong>
 * Java 21 Records são imutáveis, concisos e ideais para DTOs de leitura.
 * O compilador gera automaticamente construtor, getters, equals e toString.
 *
 * <p><strong>@JsonFormat:</strong> Formata a data em ISO 8601 sem milissegundos.
 */
@Builder
public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp
) {}
