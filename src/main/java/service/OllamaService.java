package service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import java.util.function.Consumer;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class OllamaService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String OLLAMA_URL = "http://localhost:11434/api/generate";

    // СИНХРОННЫЙ ЗАПРОС (весь ответ сразу)
    public String ask(String prompt) {
        Map<String, Object> request = createRequest(prompt, false);
        var response = restTemplate.postForObject(OLLAMA_URL, request, Map.class);
        return (String) response.get("response");
    }

    // СТРИМИНГ (символы приходят постепенно)
    public void askStream(String prompt, Consumer<String> onToken) {
        Map<String, Object> request = createRequest(prompt, true);

        // Используем простой HTTP запрос через RestTemplate
        restTemplate.execute(OLLAMA_URL, HttpMethod.POST,
                (org.springframework.web.client.RequestCallback) requestCallback -> {
                    // Сериализуем request в JSON и пишем в тело
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    mapper.writeValue(requestCallback.getBody(), request);
                },
                (org.springframework.web.client.ResponseExtractor<Void>) response -> {
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(response.getBody(), "UTF-8"))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            if (line.trim().isEmpty()) continue;
                            // Парсим JSON строку
                            try {
                                // Ищем поле "response"
                                int start = line.indexOf("\"response\":\"") + 11;
                                if (start > 11) {
                                    int end = line.indexOf("\"", start);
                                    if (end > start) {
                                        String token = line.substring(start, end);
                                        // Экранируем спецсимволы
                                        token = token.replace("\\n", "\n")
                                                .replace("\\\"", "\"")
                                                .replace("\\\\", "\\");
                                        onToken.accept(token);
                                    }
                                }
                            } catch (Exception e) {
                                // Пропускаем ошибки парсинга
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return null;
                });
    }

    private Map<String, Object> createRequest(String prompt, boolean stream) {
        Map<String, Object> request = new HashMap<>();
        request.put("model", "qwen3:4b");
        request.put("prompt", prompt);
        request.put("stream", stream);

        Map<String, Object> options = new HashMap<>();
        options.put("num_predict", 100);      // макс 100 токенов (было 200+)
        options.put("temperature", 0.3);       // меньше творчества = быстрее
        request.put("options", options);

        return request;
    }
}