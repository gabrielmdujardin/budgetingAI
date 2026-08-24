package dio.budgeting.dto;

import dio.budgeting.domain.Transaction;
import dio.budgeting.dto.request.TransactionRequest;
import dio.budgeting.dto.response.TransactionResponse;
import dio.budgeting.entity.TransactionEntity;

public class TransactionMapper {

    public static TransactionEntity toEntity(TransactionRequest request) {
        if (request == null) return null;
        return TransactionEntity.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(request.getCategory())
                .build();
    }

    public static Transaction toDomain(TransactionEntity entity) {
        if (entity == null) return null;
        return Transaction.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .category(entity.getCategory())
                .customCategory(entity.getCustomCategory())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static TransactionResponse toResponse(TransactionEntity entity) {
        if (entity == null) return null;
        return TransactionResponse.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .category(entity.getCategory())
                .customCategory(entity.getCustomCategory())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static TransactionResponse toResponse(Transaction domain) {
        if (domain == null) return null;
        return TransactionResponse.builder()
                .id(domain.getId())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .category(domain.getCategory())
                .customCategory(domain.getCustomCategory())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
