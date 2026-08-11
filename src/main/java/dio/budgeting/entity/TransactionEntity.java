package dio.budgeting.entity;

import dio.budgeting.domain.Category;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entidade JPA que representa uma transação financeira no banco de dados.
 *
 * <p><strong>Decisões de design:</strong>
 *
 * <p><strong>1. Auditoria com @EntityListeners:</strong>
 * {@code AuditingEntityListener} é um listener do Spring Data JPA que
 * automaticamente popula os campos {@code createdAt} e {@code updatedAt}
 * sem nenhum código manual. Requer {@code @EnableJpaAuditing} na configuração.
 *
 * <p><strong>2. amount em centavos (Long):</strong>
 * Armazenar valores monetários como inteiro em centavos evita problemas
 * de ponto flutuante (ex: 1234 = R$ 12,34). Esta é a prática adotada
 * por sistemas financeiros sérios (Stripe, PagSeguro, etc.).
 *
 * <p><strong>3. Category como String no banco:</strong>
 * {@code @Enumerated(EnumType.STRING)} armazena o nome do enum ("FOOD")
 * em vez do índice (0). Isso torna o banco legível e protege contra
 * quebras se a ordem do enum mudar.
 *
 * <p><strong>4. Separação Entity / Domain:</strong>
 * Esta classe é específica de infraestrutura (JPA). O domínio puro
 * ficará em {@code dio.budgeting.domain.Transaction} sem anotações JPA,
 * mantendo o domínio livre de dependências de framework.
 */
@Entity
@Table(name = "transactions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Descrição legível da transação.
     * Exemplos: "Almoço no restaurante", "Uber para o trabalho", "Conta de luz"
     */
    @Column(nullable = false, length = 255)
    private String description;

    /**
     * Valor da transação em centavos.
     * Exemplo: 3500 = R$ 35,00
     */
    @Column(nullable = false)
    private Long amount;

    /**
     * Categoria da transação.
     * EnumType.STRING: armazena "FOOD", "HEALTH" etc. (legível no banco)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    /**
     * Data/hora de criação — preenchida automaticamente pelo Spring Data JPA.
     * updatable = false: este campo nunca é alterado após a criação.
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Data/hora da última atualização — preenchida automaticamente.
     */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
