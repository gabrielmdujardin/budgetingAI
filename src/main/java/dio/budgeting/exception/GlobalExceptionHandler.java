package dio.budgeting.exception;

import dio.budgeting.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Tratador centralizado de exceções da API REST.
 *
 * <p>{@code @RestControllerAdvice} intercepta exceções lançadas em qualquer
 * {@code @RestController} da aplicação, evitando blocos try/catch espalhados
 * pelos controllers.
 *
 * <p><strong>Princípio:</strong> Controllers não devem saber como formatar
 * erros — essa é responsabilidade desta classe (SRP).
 *
 * <p><strong>Como funciona:</strong>
 * <ol>
 *   <li>Uma exceção é lançada em um controller ou use case</li>
 *   <li>O Spring intercepta e busca o método {@code @ExceptionHandler} correto</li>
 *   <li>O método formata um {@link ErrorResponse} e retorna o HTTP status adequado</li>
 * </ol>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Trata: transação não encontrada no banco de dados.
     * HTTP 404 Not Found.
     */
    @ExceptionHandler(TransactionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            TransactionNotFoundException ex,
            HttpServletRequest request
    ) {
        log.warn("Transação não encontrada: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request));
    }

    /**
     * Trata: violações de Bean Validation (@NotBlank, @Positive, @Valid).
     * Ocorre quando o corpo da requisição não passa nas validações dos DTOs.
     * HTTP 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        // Agrupa todos os erros de campo em uma mensagem legível
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.warn("Erro de validação: {}", message);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, message, request));
    }

    /**
     * Trata: arquivo de áudio maior que o limite configurado.
     * HTTP 413 Payload Too Large.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleFileTooLarge(
            MaxUploadSizeExceededException ex,
            HttpServletRequest request
    ) {
        String message = "Arquivo muito grande. Limite: 50MB";
        log.warn("Upload excedeu o limite: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(buildError(HttpStatus.PAYLOAD_TOO_LARGE, message, request));
    }

    /**
     * Trata: qualquer exceção não mapeada explicitamente acima.
     * HTTP 500 Internal Server Error.
     * Não expõe detalhes internos ao cliente (segurança).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("Erro interno não esperado: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Ocorreu um erro interno. Tente novamente mais tarde.",
                        request
                ));
    }

    /**
     * Método auxiliar que constrói o {@link ErrorResponse} padronizado.
     */
    private ErrorResponse buildError(HttpStatus status, String message, HttpServletRequest request) {
        return ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
