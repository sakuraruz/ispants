// src/main/java/org/example/OllamaTest.java
package org.example;

import org.springframework.web.client.RestTemplate;
import java.util.*;

public class OllamaTest {

    public static void main(String[] args) {
        RestTemplate rest = new RestTemplate();

        // URL для подключения к Ollama
        String url = "http://localhost:11434/api/generate";

        // Тело запроса
        Map<String, Object> request = new HashMap<>();
        request.put("model", "qwen3:4b");
        request.put("prompt", "Привет! Как дела?");
        request.put("stream", false);

        try {
            // Отправляем запрос
            var response = rest.postForObject(url, request, Map.class);
            System.out.println("Ответ: " + response.get("response"));
        } catch (Exception e) {
            System.out.println("Ошибка: " + e.getMessage());
        }
    }
}