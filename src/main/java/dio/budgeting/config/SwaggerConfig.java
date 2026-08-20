package dio.budgeting.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração do Swagger / OpenAPI.
 */
@Configuration
public class SwaggerConfig {

        @Bean
        public OpenAPI budgetingOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("💰 Budgeting API — Assistente Financeiro Inteligente")
                                                .description("""
                                                                API de gerenciamento financeiro pessoal.

                                                                ## Funcionalidades
                                                                -  **Comandos de voz** para registrar e consultar transações
                                                                -  **Resumo mensal** por categoria
                                                                -  **Exclusão** de transações por ID

                                                                ## Tecnologias
                                                                Java 21 · Spring Boot 4 · MySQL · Faster-Whisper
                                                                """)
                                                .version("1.0.0")
                                                .contact(new Contact()
                                                                .name("DIO Spring Boot Challenge")
                                                                .url("https://github.com/digitalinnovationone/dio-spring-boot-learning-track"))
                                                .license(new License()
                                                                .name("MIT")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .tags(List.of(
                                                new Tag().name("Transactions")
                                                                .description("CRUD de transações financeiras"),
                                                new Tag().name("Voice")
                                                                .description("Comandos de voz processados por IA"),
                                                new Tag().name("Reports")
                                                                .description("Relatórios e resumos financeiros")));
        }
}
