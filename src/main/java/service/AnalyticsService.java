// package service;

// import repository.AnalyticsRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import java.util.*;

// @Service
// public class AnalyticsService {

//     @Autowired
//     private AnalyticsRepository analyticsRepository;

//     /**
//      * Получить список всех атрибутов
//      */
//     public List<Map<String, Object>> getAttributes() {
//         // Вызываем репозиторий для получения данных
//         return analyticsRepository.getAttributesFromDB();
//     }

//     /**
//      * Получить значения конкретного атрибута
//      */
//     public Map<String, Object> getAttributeValues(String attributeName) {
//         List<String> values = analyticsRepository.getAttributeValues(attributeName);
//         Map<String, Object> result = new HashMap<>();
//         result.put("attribute", attributeName);
//         result.put("values", values);
//         result.put("count", values.size());
//         return result;
//     }

//     /**
//      * Построить сводную таблицу
//      */
//     public Map<String, Object> buildPivot(Map<String, Object> request) {
//         // 1. Извлекаем параметры из запроса
//         List<String> rows = (List<String>) request.getOrDefault("rows", List.of("region"));
//         List<String> columns = (List<String>) request.getOrDefault("columns", List.of("quarter"));
//         List<String> measures = (List<String>) request.getOrDefault("measures", List.of("sales_amount"));

//         // 2. Формируем SQL запрос
//         String sql = buildPivotSQL(rows, columns, measures);
//         System.out.println("Выполняем SQL: " + sql);

//         // 3. Выполняем запрос через репозиторий
//         List<Map<String, Object>> queryResult = analyticsRepository.executePivotQuery(sql);

//         // 4. Формируем ответ
//         Map<String, Object> response = new HashMap<>();
//         response.put("status", "success");
//         response.put("rows", rows);
//         response.put("columns", columns);
//         response.put("measures", measures);
//         response.put("data", queryResult);

//         return response;
//     }

//     /**
//      * Построить SQL для сводной таблицы
//      */
//     private String buildPivotSQL(List<String> rows, List<String> columns, List<String> measures) {
//         StringBuilder sql = new StringBuilder("SELECT ");

//         // Добавляем поля для группировки
//         for (String row : rows) {
//             sql.append(row).append(", ");
//         }
        
//         // Добавляем агрегации (пока просто SUM для первого поля)
//         if (!measures.isEmpty()) {
//             sql.append("SUM(").append(measures.get(0)).append(") as total");
//         } else {
//             sql.append("COUNT(*) as total");
//         }
        
//         sql.append(" FROM sales_data");
        
//         // GROUP BY
//         if (!rows.isEmpty()) {
//             sql.append(" GROUP BY ");
//             for (int i = 0; i < rows.size(); i++) {
//                 sql.append(rows.get(i));
//                 if (i < rows.size() - 1) sql.append(", ");
//             }
//         }
        
//         return sql.toString();
//     }

//     /**
//      * ИИ-рекомендация структуры таблицы
//      */
//     public Map<String, Object> recommendPivot(Map<String, String> request) {
//         // Пока возвращаем мок-данные (позже можно подключить реальный ИИ)
//         return Map.of(
//                 "status", "success",
//                 "recommendations", List.of(
//                         Map.of(
//                                 "name", "Анализ продаж по регионам",
//                                 "rows", List.of("region"),
//                                 "columns", List.of("quarter"),
//                                 "measures", List.of("sales_amount"),
//                                 "aggregation", "SUM"
//                         ),
//                         Map.of(
//                                 "name", "Топ продуктов по прибыли",
//                                 "rows", List.of("product_category"),
//                                 "measures", List.of("profit"),
//                                 "aggregation", "SUM",
//                                 "sort", "DESC",
//                                 "limit", 10
//                         )
//                 )
//         );
//     }
// }

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

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С БД (от коллеги) ==========
    
    public Map<String, Object> getRawData(int page, int size) {
        int offset = page * size;
        List<Map<String, Object>> data = repository.getRawDataset(size, offset);
        return Map.of("page", page, "size", size, "data", data);
    }

    public Map<String, Object> buildPivot(PivotRequest request) {
        List<String> dimensions = new ArrayList<>();
        if (request.getRows() != null) dimensions.addAll(request.getRows());
        if (request.getColumns() != null) dimensions.addAll(request.getColumns());

        List<String> measureNames = new ArrayList<>();
        String aggType = "SUM";

        if (request.getMeasures() != null && !request.getMeasures().isEmpty()) {
            Measure firstMeasure = request.getMeasures().get(0);
            measureNames.add(firstMeasure.getField());
            if (firstMeasure.getAggregation() != null) {
                aggType = firstMeasure.getAggregation();
            }
        }

        List<Map<String, Object>> dbResult = repository.getDynamicPivotData(dimensions, measureNames, aggType);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("dimensions", dimensions);
        response.put("data", dbResult);
        return response;
    }

    // ========== МЕТОДЫ ДЛЯ АТРИБУТОВ И ИИ (из вашего проекта) ==========
    
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

    public Map<String, Object> recommendPivot(Map<String, String> request) {
        return Map.of(
                "status", "success",
                "recommendations", List.of(
                        Map.of("name", "Анализ продаж по регионам",
                                "rows", List.of("region"),
                                "columns", List.of("quarter"),
                                "measures", List.of("sales_amount"),
                                "aggregation", "SUM"),
                        Map.of("name", "Топ продуктов по прибыли",
                                "rows", List.of("product_category"),
                                "measures", List.of("profit"),
                                "aggregation", "SUM",
                                "sort", "DESC",
                                "limit", 10)
                )
        );
    }
}