package org.example.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import service.OllamaService;
import java.util.*;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/stream")
@CrossOrigin(origins = "http://localhost:3000")
public class StreamController {

    private final OllamaService ollamaService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public StreamController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    @GetMapping(value = "/chat", produces = "text/event-stream")
    public SseEmitter chat(@RequestParam String message) {
        SseEmitter emitter = new SseEmitter(120000L); // 2 минуты таймаут

        executor.execute(() -> {
            try {
                StringBuilder fullResponse = new StringBuilder();

                // Стриминг ответа
                ollamaService.askStream(message, token -> {
                    try {
                        // Отправляем каждый токен сразу
                        emitter.send(SseEmitter.event()
                                .name("message")
                                .data(token));
                        fullResponse.append(token);
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                });

                // Отправляем сигнал завершения
                emitter.send(SseEmitter.event()
                        .name("done")
                        .data(fullResponse.toString()));
                emitter.complete();

            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    @GetMapping(value = "/chat-with-history", produces = "text/event-stream")
    public SseEmitter chatWithHistory(@RequestParam String message,
                                      @RequestParam(required = false) String context) {
        SseEmitter emitter = new SseEmitter(120000L);

        executor.execute(() -> {
            try {
                String prompt = context != null && !context.isEmpty()
                        ? "Контекст: " + context + "\nПользователь: " + message + "\nАссистент: "
                        : message;

                ollamaService.askStream(prompt, token -> {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("token")
                                .data(token));
                    } catch (Exception e) {
                        // Продолжаем, даже если ошибка
                    }
                });

                emitter.send(SseEmitter.event().name("done").data(""));
                emitter.complete();

            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}