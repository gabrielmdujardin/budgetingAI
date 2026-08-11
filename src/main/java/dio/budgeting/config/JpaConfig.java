package dio.budgeting.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuração de auditoria JPA.
 *
 * <p>{@code @EnableJpaAuditing} ativa o mecanismo de auditoria automática
 * do Spring Data JPA. Com isso, os campos anotados com {@code @CreatedDate}
 * e {@code @LastModifiedDate} em {@code TransactionEntity} são preenchidos
 * automaticamente pelo framework sem nenhum código adicional.
 *
 * <p><strong>Por que em classe separada e não na BudgetingApplication?</strong>
 * Separar a configuração de auditoria da classe principal é uma boa prática
 * porque:
 * <ul>
 *   <li>Facilita testes: testes unitários não carregam a auditoria JPA
 *       desnecessariamente</li>
 *   <li>Segue o Princípio da Responsabilidade Única (SRP)</li>
 *   <li>Facilita manutenção futura (adicionar {@code AuditorAware} para
 *       rastrear quem criou o registro, por exemplo)</li>
 * </ul>
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // Classe de configuração — não precisa de métodos aqui por enquanto.
    // Futuramente, pode-se adicionar um bean AuditorAware<String>
    // para registrar o usuário que criou/modificou cada transação.
}
