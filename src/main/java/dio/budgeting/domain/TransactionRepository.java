package dio.budgeting.domain;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Contrato de repositório para o domínio de transações.
 *
 * <p><strong>Por que uma interface no domínio?</strong>
 * Esta é a aplicação do <em>Princípio da Inversão de Dependência (DIP)</em>
 * do SOLID:
 * <ul>
 *   <li>Os {@code UseCase}s dependem desta interface (abstração)</li>
 *   <li>A implementação concreta ({@code JpaTransactionRepositoryAdapter}) fica
 *       na camada de infraestrutura</li>
 *   <li>Se trocarmos MySQL por MongoDB amanhã, apenas o adapter muda —
 *       os Use Cases não tocamos</li>
 * </ul>
 *
 * <p><strong>Domínio vs Entidade:</strong>
 * Este repositório trabalha com {@code Transaction} (objeto de domínio puro,
 * sem anotações JPA), não com {@code TransactionEntity}.
 * A conversão entre os dois é responsabilidade do {@code TransactionMapper}.
 */
public interface TransactionRepository {

    /** Persiste uma nova transação e retorna com o ID gerado. */
    Transaction save(Transaction transaction);

    /** Busca por ID. Retorna empty se não encontrado. */
    Optional<Transaction> findById(Long id);

    /** Retorna todas as transações cadastradas. */
    List<Transaction> findAll();

    /** Filtra por categoria. */
    List<Transaction> findByCategory(Category category);

    /** Filtra transações criadas em um intervalo de datas. */
    List<Transaction> findByPeriod(LocalDateTime from, LocalDateTime to);

    /** Filtra por categoria + intervalo de datas. */
    List<Transaction> findByCategoryAndPeriod(Category category, LocalDateTime from, LocalDateTime to);

    /** Retorna a transação com maior valor. */
    Optional<Transaction> findHighestExpense();

    /**
     * Resumo de gastos: soma por categoria em um período.
     * Retorna lista de {@link CategorySummary}.
     */
    List<CategorySummary> sumByCategoryAndPeriod(LocalDateTime from, LocalDateTime to);

    /** Remove por ID. */
    void deleteById(Long id);

    /** Verifica se existe transação com o ID informado. */
    boolean existsById(Long id);

    /**
     * Registro interno para representar o resumo por categoria.
     *
     * <p>Java 21 Records: imutáveis, concisos e ideais para projeções.
     * Equivalente a uma classe com construtor, getters, equals e toString.
     */
    record CategorySummary(Category category, Long totalAmount) {}
}
