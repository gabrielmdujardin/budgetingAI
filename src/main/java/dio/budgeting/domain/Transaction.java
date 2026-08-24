package dio.budgeting.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Objeto de domínio que representa uma transação financeira.
 *
 * <p><strong>Domínio vs Entidade:</strong>
 * Esta classe é o modelo de domínio puro — sem anotações JPA, sem
 * dependências de framework. Isso é a essência da Clean Architecture:
 * o domínio não sabe como é persistido.
 *
 * <p><strong>Sobre o campo amount (centavos):</strong>
 * Monetário em centavos (long) — ex: 3500 = R$ 35,00.
 * Evita erros de ponto flutuante que ocorrem com double/float.
 *
 * <p><strong>Sobre o uso de @Getter + @Builder (Lombok):</strong>
 * Objetos de domínio são idealmente imutáveis — usamos @Builder para
 * construção e não geramos setters. @AllArgsConstructor é necessário
 * para que o builder funcione corretamente.
 */
@Getter
@Builder
@AllArgsConstructor
public class Transaction {

    private Long id;
    private String description;
    private Long amount;          // em centavos
    private Category category;
    private String customCategory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Método auxiliar para exibir o valor formatado em reais.
     * Ex: 3500 → "R$ 35,00"
     */
    public String getFormattedAmount() {
        return String.format("R$ %.2f", amount / 100.0);
    }
}
