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
 *
 * <p>SpringDoc lê automaticamente todas as anotações {@code @RestController},
 * {@code @GetMapping}, etc. e gera a especificação OpenAPI 3.0 em JSON.
 * Esta classe personaliza os metadados que aparecem na UI do Swagger.
 *
 * <p><strong>URLs disponíveis após subir a aplicação:</strong>
 * <ul>
 *   <li>Swagger UI: <a href="http://localhost:8080/swagger-ui.html">http://localhost:8080/swagger-ui.html</a></li>
 *   <li>JSON spec: <a href="http://localhost:8080/api-docs">http://localhost:8080/api-docs</a></li>
 * </ul>
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI budgetingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("💰 Budgeting API — Assistente Financeiro Inteligente")
                        .description("""
                                API de gerenciamento financeiro pessoal com IA local.
                                
                                ## Funcionalidades
                                - 🎙️ **Comandos de voz** para registrar e consultar transações
                                - 🤖 **IA com Ollama** (Qwen3 / Llama 3.1) — 100% local e gratuito
                                - 🔍 **Tool Calling** — a IA executa funções reais da aplicação
                                - 📊 **Resumo mensal** por categoria
                                - 🗑️ **Exclusão** de transações por ID
                                
                                ## Tecnologias
                                Java 21 · Spring Boot 4 · Spring AI · Ollama · MySQL · Faster-Whisper
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
                                .description("Relatórios e resumos financeiros")
                ));
    }
}
