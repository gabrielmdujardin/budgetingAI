package dio.budgeting.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuração de auditoria JPA.
 * Habilita o preenchimento automático de datas de criação e atualização nas entidades.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {

}
