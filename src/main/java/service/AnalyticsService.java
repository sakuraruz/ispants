package service;

import dto.Measure;
import dto.PivotRequest;
import org.springframework.stereotype.Service;
import repository.AnalyticsRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AnalyticsRepository repository;

    public AnalyticsService(AnalyticsRepository repository) {
        this.repository = repository;
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С БД ==========
    
    public Map<String, Object> getRawData(int page, int size) {
        int offset = page * size;
        List<Map<String, Object>> data = repository.getRawDataset(size, offset);
        
        Map<String, Object> result = new HashMap<>();
        result.put("page", page);
        result.put("size", size);
        result.put("data", data);
        return result;
    }

    public Map<String, Object> buildPivot(PivotRequest request) {
        // Собираем измерения (строки и колонки)
        List<String> dimensions = new ArrayList<>();
        if (request.getRows() != null) {
            dimensions.addAll(request.getRows());
        }
        if (request.getColumns() != null) {
            dimensions.addAll(request.getColumns());
        }

        // Собираем информацию о мерах (агрегируемых полях)
        List<String> measureNames = new ArrayList<>();
        String aggType = "SUM";

        if (request.getMeasures() != null && !request.getMeasures().isEmpty()) {
            Measure firstMeasure = request.getMeasures().get(0);
            if (firstMeasure.getField() != null) {
                measureNames.add(firstMeasure.getField());
            }
            if (firstMeasure.getAggregation() != null) {
                aggType = firstMeasure.getAggregation();
            }
        }

        // Получаем данные из БД
        List<Map<String, Object>> dbResult = repository.getDynamicPivotData(dimensions, measureNames, aggType);

        // Трансформируем в формат, понятный фронтенду
        Map<String, Object> response = transformToFrontendFormat(dbResult, request);
        response.put("status", "success");
        
        return response;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ТРАНСФОРМАЦИИ ==========
    
    /**
     * Преобразование данных БД в формат, ожидаемый фронтендом
     */
    private Map<String, Object> transformToFrontendFormat(List<Map<String, Object>> dbResult, PivotRequest request) {
        Map<String, Object> result = new HashMap<>();
        
        // Если данных нет, возвращаем пустую структуру
        if (dbResult.isEmpty()) {
            result.put("columns", new ArrayList<>());
            result.put("rows", new ArrayList<>());
            result.put("totals", new HashMap<>());
            return result;
        }
        
        // Получаем поля для строк и колонок
        List<String> rowFields = request.getRows() != null ? request.getRows() : new ArrayList<>();
        List<String> colFields = request.getColumns() != null ? request.getColumns() : new ArrayList<>();
        
        // Собираем уникальные значения для строк и колонок
        Set<String> rowKeys = new LinkedHashSet<>();
        Set<String> colKeys = new LinkedHashSet<>();
        
        for (Map<String, Object> row : dbResult) {
            String rowKey = buildCompositeKey(row, rowFields);
            String colKey = buildCompositeKey(row, colFields);
            rowKeys.add(rowKey);
            colKeys.add(colKey);
        }
        
        // Строим матрицу значений
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String rowKey : rowKeys) {
            List<Object> values = new ArrayList<>();
            for (String colKey : colKeys) {
                Object value = findValueInResult(dbResult, rowKey, colKey, rowFields, colFields, request);
                values.add(value != null ? value : 0);
            }
            
            Map<String, Object> pivotRow = new HashMap<>();
            pivotRow.put("label", rowKey);
            pivotRow.put("values", values);
            rows.add(pivotRow);
        }
        
        result.put("columns", new ArrayList<>(colKeys));
        result.put("rows", rows);
        result.put("totals", calculateTotals(rows));
        
        return result;
    }
    
    /**
     * Формирует составной ключ из значений полей
     */
    private String buildCompositeKey(Map<String, Object> row, List<String> fields) {
        if (fields == null || fields.isEmpty()) {
            return "Всего";
        }
        return fields.stream()
                .map(f -> {
                    Object value = row.getOrDefault(f, "");
                    return String.valueOf(value);
                })
                .collect(Collectors.joining(" | "));
    }
    
    /**
     * Находит значение в результате запроса по ключам строки и колонки
     */
    private Object findValueInResult(List<Map<String, Object>> dbResult, 
                                      String rowKey, 
                                      String colKey,
                                      List<String> rowFields, 
                                      List<String> colFields, 
                                      PivotRequest request) {
        for (Map<String, Object> row : dbResult) {
            String currentRowKey = buildCompositeKey(row, rowFields);
            String currentColKey = buildCompositeKey(row, colFields);
            
            if (currentRowKey.equals(rowKey) && currentColKey.equals(colKey)) {
                // Если есть меры, возвращаем значение первой меры
                if (request.getMeasures() != null && !request.getMeasures().isEmpty()) {
                    String measureField = request.getMeasures().get(0).getField();
                    Object value = row.get(measureField);
                    if (value != null) {
                        return value;
                    }
                }
                // Если нет мер, возвращаем значение из поля total
                return row.getOrDefault("total", 0);
            }
        }
        return null;
    }
    
    /**
     * Вычисляет итоги по строкам и колонкам
     */
    private Map<String, Object> calculateTotals(List<Map<String, Object>> rows) {
        Map<String, Object> totals = new HashMap<>();
        
        if (rows.isEmpty()) {
            totals.put("rowTotals", new ArrayList<>());
            totals.put("columnTotals", new ArrayList<>());
            totals.put("grandTotal", 0);
            return totals;
        }
        
        // Получаем количество колонок из первой строки
        int columnCount = ((List<?>) rows.get(0).get("values")).size();
        
        // Вычисляем итоги по колонкам
        List<Object> columnTotals = new ArrayList<>();
        for (int i = 0; i < columnCount; i++) {
            double sum = 0;
            for (Map<String, Object> row : rows) {
                @SuppressWarnings("unchecked")
                List<Object> values = (List<Object>) row.get("values");
                if (i < values.size() && values.get(i) instanceof Number) {
                    sum += ((Number) values.get(i)).doubleValue();
                }
            }
            columnTotals.add(sum);
        }
        
        // Вычисляем итоги по строкам и общий итог
        List<Object> rowTotals = new ArrayList<>();
        double grandTotal = 0;
        
        for (Map<String, Object> row : rows) {
            @SuppressWarnings("unchecked")
            List<Object> values = (List<Object>) row.get("values");
            double rowSum = 0;
            for (Object value : values) {
                if (value instanceof Number) {
                    rowSum += ((Number) value).doubleValue();
                }
            }
            rowTotals.add(rowSum);
            grandTotal += rowSum;
        }
        
        totals.put("rowTotals", rowTotals);
        totals.put("columnTotals", columnTotals);
        totals.put("grandTotal", grandTotal);
        
        return totals;
    }

    // ========== МЕТОДЫ ДЛЯ АТРИБУТОВ ==========
    
    public List<Map<String, Object>> getAttributes() {
        return repository.getAttributesFromDB();
    }

    public Map<String, Object> getAttributeValues(String attributeName) {
        List<String> values = repository.getAttributeValues(attributeName);
        Map<String, Object> result = new HashMap<>();
        result.put("attribute", attributeName);
        result.put("values", values);
        result.put("count", values.size());
        return result;
    }

    // ========== МЕТОДЫ ДЛЯ AI-РЕКОМЕНДАЦИЙ ==========
    
    public Map<String, Object> recommendPivot(Map<String, String> request) {
        // Формируем рекомендации (пока заглушка)
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        Map<String, Object> rec1 = new HashMap<>();
        rec1.put("name", "Анализ продаж по регионам");
        rec1.put("rows", List.of("region"));
        rec1.put("columns", List.of("quarter"));
        rec1.put("measures", List.of("sales_amount"));
        rec1.put("aggregation", "SUM");
        recommendations.add(rec1);
        
        Map<String, Object> rec2 = new HashMap<>();
        rec2.put("name", "Топ продуктов по прибыли");
        rec2.put("rows", List.of("product_category"));
        rec2.put("measures", List.of("profit"));
        rec2.put("aggregation", "SUM");
        rec2.put("sort", "DESC");
        rec2.put("limit", 10);
        recommendations.add(rec2);
        
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("recommendations", recommendations);
        
        return result;
    }
}