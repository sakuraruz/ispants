// Файл: src/main/java/org/example/AnalyticsController.java
package org.example;

import dto.PivotRequest;
import org.springframework.web.bind.annotation.*;
import service.AnalyticsService;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // Внедрение зависимости через конструктор
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // ========== 1. ВЫГРУЗКА БАЗЫ ДАННЫХ (GET) ==========
    @GetMapping("/dataset")
    public Map<String, Object> getDataset(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        // Ограничиваем выгрузку до 1000 строк за раз для безопасности
        int safeSize = Math.min(size, 1000);
        return analyticsService.getRawData(page, safeSize);
    }

    // ========== 2. ПОСТРОЕНИЕ СВОДНОЙ ТАБЛИЦЫ ИЗ БД (POST) ==========
    @PostMapping("/pivot")
    public Map<String, Object> buildPivot(@RequestBody PivotRequest request) {
        return analyticsService.buildPivot(request);
    }

    // health и attributes можно оставить как есть для проверки связи
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "message", "Подключено к БД, сервер работает");
    }
}