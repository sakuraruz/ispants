package org.example.controller;

import service.AIAnalyticsService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/ai-analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AIAnalyticsController {

    private final AIAnalyticsService aiAnalyticsService;

    public AIAnalyticsController(AIAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }

    // Главный эндпоинт: естественный язык → данные + выводы
    @PostMapping("/ask")
    public Map<String, Object> ask(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        return aiAnalyticsService.processNaturalLanguage(userQuery);
    }

    // Только рекомендация структуры (без данных)
    @PostMapping("/recommend")
    public Map<String, Object> recommendStructure(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        return aiAnalyticsService.recommendStructure(userQuery);
    }

    // Анализ данных
    @PostMapping("/insights")
    public Map<String, Object> analyzeData(@RequestBody Map<String, Object> data) {
        return aiAnalyticsService.analyzeData(data);
    }
}