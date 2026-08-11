package dio.budgeting.controller;

import dio.budgeting.domain.Category;
import dio.budgeting.dto.request.TransactionRequest;
import dio.budgeting.dto.response.ErrorResponse;
import dio.budgeting.dto.response.SummaryResponse;
import dio.budgeting.dto.response.TransactionResponse;
import dio.budgeting.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Transactions", description = "Gerenciamento e CRUD completo de transações financeiras")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Operation(
            summary = "Cadastrar nova transação manual",
            description = "Cria uma nova transação financeira especificando descrição, valor em centavos e categoria."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Transação cadastrada com sucesso",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TransactionResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "id": 1,
                                              "description": "Compra supermercado",
                                              "amount": 20000,
                                              "category": "FOOD",
                                              "createdAt": "2026-08-05T11:30:00",
                                              "updatedAt": "2026-08-05T11:30:00"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados de entrada inválidos",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse response = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar e filtrar transações",
            description = "Retorna a lista de transações cadastradas. Permite aplicar filtros por categoria e período (data de início e fim)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de transações retornada com sucesso",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TransactionResponse.class)
                    )
            )
    })
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @Parameter(description = "Categoria para filtragem (opcional)", example = "FOOD")
            @RequestParam(required = false) Category category,

            @Parameter(description = "Data inicial do período (AAAA-MM-DD)", example = "2026-08-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @Parameter(description = "Data final do período (AAAA-MM-DD)", example = "2026-08-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<TransactionResponse> responses = transactionService.getTransactions(category, startDate, endDate);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/summary")
    @Operation(
            summary = "Obter resumo mensal de gastos",
            description = "Calcula a soma total das transações e o agrupamento de despesas por categoria no mês atual."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Resumo financeiro calculado com sucesso",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = SummaryResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "total": 150000,
                                              "categories": {
                                                "FOOD": 50000,
                                                "TRANSPORT": 30000,
                                                "HEALTH": 20000,
                                                "LEISURE": 50000
                                              }
                                            }
                                            """
                            )
                    )
            )
    })
    public ResponseEntity<SummaryResponse> getSummary() {
        SummaryResponse summary = transactionService.getSummary();
        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Excluir transação por ID",
            description = "Remove a transação especificada caso exista no sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Transação excluída com sucesso (sem conteúdo no corpo)"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Transação não encontrada",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> deleteTransaction(
            @Parameter(description = "ID único da transação a ser excluída", example = "1")
            @PathVariable Long id
    ) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
