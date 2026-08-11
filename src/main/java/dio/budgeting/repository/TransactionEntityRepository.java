package dio.budgeting.repository;

import dio.budgeting.domain.Category;
import dio.budgeting.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositório Spring Data JPA para {@link TransactionEntity}.
 *
 * <p><strong>Sobre Spring Data JPA:</strong>
 * Ao estender {@code JpaRepository<TransactionEntity, Long>}, o Spring
 * gera automaticamente em tempo de execução as implementações dos métodos
 * CRUD básicos (save, findById, findAll, delete, etc.) sem uma linha
 * de SQL ou implementação manual.
 *
 * <p><strong>Query Methods:</strong>
 * O Spring Data JPA interpreta o nome dos métodos e gera as queries:
 * <ul>
 *   <li>{@code findByCategory} → {@code WHERE category = ?}</li>
 *   <li>{@code findByCreatedAtBetween} → {@code WHERE created_at BETWEEN ? AND ?}</li>
 * </ul>
 *
 * <p><strong>Por que tem JPQL para o resumo mensal?</strong>
 * A agregação com GROUP BY não pode ser expressa apenas pelo nome do método,
 * então usamos {@code @Query} com JPQL (linguagem de query do JPA).
 */
@Repository
public interface TransactionEntityRepository extends JpaRepository<TransactionEntity, Long> {

    /**
     * Busca todas as transações de uma categoria específica.
     * Gerado automaticamente pelo Spring Data a partir do nome do método.
     */
    List<TransactionEntity> findByCategory(Category category);

    /**
     * Busca transações criadas em um intervalo de datas.
     * Útil para: "Quanto gastei na última semana?" / "Gastos deste mês"
     */
    List<TransactionEntity> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Busca transações por categoria em um intervalo de datas.
     * Combina filtro de categoria + período.
     */
    List<TransactionEntity> findByCategoryAndCreatedAtBetween(
            Category category,
            LocalDateTime from,
            LocalDateTime to
    );

    /**
     * Busca a transação com o maior valor (maior despesa).
     * {@code LIMIT 1} é necessário — o Spring Data não tem query method para isso.
     *
     * <p>JPQL usa o nome da classe Java ({@code TransactionEntity}),
     * não o nome da tabela SQL ({@code transactions}).
     */
    @Query("SELECT t FROM TransactionEntity t ORDER BY t.amount DESC LIMIT 1")
    Optional<TransactionEntity> findTopByOrderByAmountDesc();

    /**
     * Resumo mensal: soma dos gastos agrupados por categoria.
     * Retorna uma lista de arrays Object[] onde:
     * <ul>
     *   <li>[0] = Category (o enum)</li>
     *   <li>[1] = Long (soma dos valores em centavos)</li>
     * </ul>
     */
    @Query("""
            SELECT t.category, SUM(t.amount)
            FROM TransactionEntity t
            WHERE t.createdAt BETWEEN :from AND :to
            GROUP BY t.category
            ORDER BY SUM(t.amount) DESC
            """)
    List<Object[]> sumAmountByCategoryAndPeriod(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
