package dio.budgeting.service;

import dio.budgeting.domain.Category;
import dio.budgeting.dto.TransactionMapper;
import dio.budgeting.dto.request.TransactionRequest;
import dio.budgeting.dto.response.SummaryResponse;
import dio.budgeting.dto.response.TransactionResponse;
import dio.budgeting.entity.TransactionEntity;
import dio.budgeting.exception.TransactionNotFoundException;
import dio.budgeting.repository.TransactionEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionEntityRepository repository;

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        TransactionEntity entity = TransactionMapper.toEntity(request);
        TransactionEntity saved = repository.save(entity);
        return TransactionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(Category category, LocalDate startDate, LocalDate endDate) {
        LocalDateTime from = startDate != null ? startDate.atStartOfDay() : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime to = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.of(2099, 12, 31, 23, 59);

        List<TransactionEntity> entities;

        if (category != null) {
            entities = repository.findByCategoryAndCreatedAtBetween(category, from, to);
        } else {
            entities = repository.findByCreatedAtBetween(from, to);
        }

        return entities.stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SummaryResponse getSummary() {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().atTime(LocalTime.MAX);

        List<Object[]> rawSummaries = repository.sumAmountByCategoryAndPeriod(startOfMonth, endOfMonth);

        // Categorias que representam receita (nao sao gastos)
        java.util.Set<Category> incomeCategories = java.util.Set.of(Category.SALARY, Category.INVESTMENTS);

        Map<Category, Long> categoryMap = new EnumMap<>(Category.class);
        long totalIncome = 0L;
        long totalExpenses = 0L;

        for (Object[] row : rawSummaries) {
            Category cat = (Category) row[0];
            Long sum = (Long) row[1];
            if (cat != null && sum != null) {
                categoryMap.put(cat, sum);
                if (incomeCategories.contains(cat)) {
                    totalIncome += sum;
                } else {
                    totalExpenses += sum;
                }
            }
        }

        return SummaryResponse.builder()
                .total(totalIncome - totalExpenses)   // saldo = receitas - despesas
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .categories(categoryMap)
                .build();
    }


    @Transactional
    public void deleteTransaction(Long id) {
        if (!repository.existsById(id)) {
            throw new TransactionNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
