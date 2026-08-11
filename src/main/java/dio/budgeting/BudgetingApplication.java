package dio.budgeting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação.
 *
 * <p>A anotação {@code @SpringBootApplication} é um atalho que combina:
 * <ul>
 *   <li>{@code @Configuration} — esta classe pode declarar beans Spring</li>
 *   <li>{@code @EnableAutoConfiguration} — Spring configura automaticamente
 *       os beans com base nas dependências no classpath (JPA, Web, etc.)</li>
 *   <li>{@code @ComponentScan} — escaneia todos os pacotes abaixo de
 *       {@code dio.budgeting} em busca de componentes Spring</li>
 * </ul>
 */
@SpringBootApplication
public class BudgetingApplication {

    public static void main(String[] args) {
        SpringApplication.run(BudgetingApplication.class, args);
    }
}
