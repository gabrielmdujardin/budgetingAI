package dio.budgeting.domain;

/**
 * Categorias financeiras disponíveis para classificação de transações.
 *
 * <p><strong>Decisão de design:</strong> Usar enum garante que a IA só possa
 * escolher valores válidos durante o Tool Calling. O prompt do sistema instrui
 * o modelo a usar exatamente estes nomes ao criar uma transação.
 *
 * <p><strong>Categorias incluídas:</strong>
 * <ul>
 *   <li>FOOD — Alimentação (mercado, restaurantes, delivery)</li>
 *   <li>HEALTH — Saúde (farmácia, médico, plano de saúde)</li>
 *   <li>TRANSPORT — Transporte (combustível, Uber, ônibus, manutenção)</li>
 *   <li>SHOPPING — Compras gerais (roupas, eletrônicos, presentes)</li>
 *   <li>LEISURE — Lazer (cinema, viagens, assinaturas de streaming)</li>
 *   <li>HOME — Casa (aluguel, condomínio, reparos, móveis)</li>
 *   <li>EDUCATION — Educação (cursos, livros, mensalidade escolar)</li>
 *   <li>SERVICES — Serviços (internet, energia, água, academia)</li>
 *   <li>INVESTMENTS — Investimentos (ações, poupança, CDB)</li>
 *   <li>SALARY — Receita (salário, freelance, renda extra)</li>
 *   <li>OTHER — Outros (não classificado)</li>
 * </ul>
 */
public enum Category {
    FOOD,
    HEALTH,
    TRANSPORT,
    SHOPPING,
    LEISURE,
    HOME,
    EDUCATION,
    SERVICES,
    INVESTMENTS,
    SALARY,
    OTHER
}
