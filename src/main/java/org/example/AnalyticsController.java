package org.example;

import dto.PivotRequest;
import org.springframework.web.bind.annotation.*;
import service.AnalyticsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // Временно разрешить все
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dataset")
    public Map<String, Object> getDataset(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100000") int size) {
        int safeSize = Math.min(size, 100000);
        return analyticsService.getRawData(page, safeSize);
    }

    @PostMapping("/pivot")
    public Map<String, Object> buildPivot(@RequestBody PivotRequest request) {
        return analyticsService.buildPivot(request);
    }

    @GetMapping("/attributes")
    public List<Map<String, Object>> getAttributes() {
        return analyticsService.getAttributes();
    }

    @GetMapping("/attributes/{name}/values")
    public Map<String, Object> getAttributeValues(@PathVariable("name") String name) {
        return analyticsService.getAttributeValues(name);
    }

    @PostMapping("/ai/recommend")
    public Map<String, Object> recommendPivot(@RequestBody Map<String, String> request) {
        return analyticsService.recommendPivot(request);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "message", "Сервер работает, подключён к БД");
    }
}