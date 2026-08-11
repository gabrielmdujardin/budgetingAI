package dio.budgeting.exception;

/**
 * Exceção lançada quando uma transação não é encontrada no banco de dados.
 *
 * <p><strong>Por que RuntimeException e não Exception?</strong>
 * {@code RuntimeException} (unchecked exception) não precisa ser declarada
 * no método com {@code throws} nem forçada a ser capturada. Em Spring,
 * exceções de negócio são convencionalmente unchecked — o
 * {@code GlobalExceptionHandler} as intercepta centralmente.
 *
 * <p><strong>Exemplo de uso:</strong>
 * <pre>
 *   transactionRepository.findById(id)
 *       .orElseThrow(() -> new TransactionNotFoundException(id));
 * </pre>
 */
public class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(Long id) {
        super("Transação não encontrada com ID: " + id);
    }

    public TransactionNotFoundException(String message) {
        super(message);
    }
}
