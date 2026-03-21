// Файл: src/main/java/service/AnalyticsService.java
package service;

import dto.Measure;
import dto.PivotRequest;
import org.springframework.stereotype.Service;
import repository.AnalyticsRepository;

import java.util.*;

@Service
public class AnalyticsService {

    private final AnalyticsRepository repository;

    public AnalyticsService(AnalyticsRepository repository) {
        this.repository = repository;
    }

    // Логика для GET запроса (сырые данные)
    public Map<String, Object> getRawData(int page, int size) {
        int offset = page * size;
        List<Map<String, Object>> data = repository.getRawDataset(size, offset);

        return Map.of(
                "page", page,
                "size", size,
                "data", data
        );
    }

    // Логика для POST запроса (сводная таблица)
    public Map<String, Object> buildPivot(PivotRequest request) {
        List<String> dimensions = new ArrayList<>();
        if (request.getRows() != null) dimensions.addAll(request.getRows());
        if (request.getColumns() != null) dimensions.addAll(request.getColumns());

        List<String> measureNames = new ArrayList<>();
        String aggType = "SUM"; // По умолчанию

        if (request.getMeasures() != null && !request.getMeasures().isEmpty()) {
            Measure firstMeasure = request.getMeasures().get(0);
            measureNames.add(firstMeasure.getField());
            if (firstMeasure.getAggregation() != null) {
                aggType = firstMeasure.getAggregation();
            }
        }

        // Получаем агрегированные данные из базы
        List<Map<String, Object>> dbResult = repository.getDynamicPivotData(dimensions, measureNames, aggType);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("dimensions", dimensions);
        response.put("data", dbResult); // Фронтенд получит готовый JSON массив объектов

        return response;
    }
}