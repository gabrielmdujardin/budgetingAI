package dio.budgeting.controller;

import dio.budgeting.dto.response.ErrorResponse;
import dio.budgeting.dto.response.VoiceResponse;
import dio.budgeting.service.VoiceAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Voice", description = "Comandos de voz e integração com inteligência artificial")
public class VoiceController {

    private final VoiceAssistantService voiceAssistantService;

    @PostMapping(value = "/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Registrar transação por comando de voz",
            description = "Recebe um arquivo de áudio (mp3, wav, webm), realiza a transcrição utilizando o Faster-Whisper e interpreta o valor, categoria e intenção com IA para criar a transação correspondente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Áudio processado com sucesso e transação criada",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = VoiceResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "message": "Transação criada com sucesso",
                                              "transcription": "Gastei 150 reais no mercado hoje",
                                              "transaction": {
                                                "id": 10,
                                                "description": "Mercado",
                                                "amount": 15000,
                                                "category": "FOOD",
                                                "createdAt": "2026-08-05T11:45:00",
                                                "updatedAt": "2026-08-05T11:45:00"
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Arquivo de áudio ausente ou inválido",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro ao processar áudio ou comunicação com serviço de transcrição/IA",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<VoiceResponse> processVoiceCommand(
            @Parameter(description = "Arquivo de áudio contendo o comando de voz", required = true)
            @RequestParam("audio") MultipartFile audio
    ) {
        VoiceResponse response = voiceAssistantService.processVoiceCommand(audio);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/text", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Processar comando financeiro por texto",
            description = "Recebe uma frase em texto enviada pelo usuário, interpreta a intenção, extrai o valor e a categoria e executa a transação ou consulta correspondente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Comando em texto processado com sucesso",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = VoiceResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Comando em texto ausente ou inválido",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<VoiceResponse> processTextCommand(
            @jakarta.validation.Valid @RequestBody dio.budgeting.dto.request.TextCommandRequest request
    ) {
        VoiceResponse response = voiceAssistantService.interpretTextAndExecute(request.getText());
        return ResponseEntity.ok(response);
    }
}
