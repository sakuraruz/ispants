package org.example;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    // ========== 1. ПРОВЕРКА РАБОТЫ ==========
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "message", "Сервер работает");
    }

    // ========== 2. СПИСОК АТРИБУТОВ ==========
    @GetMapping("/attributes")
    public List<Map<String, Object>> getAttributes() {
        List<Map<String, Object>> attributes = new ArrayList<>();

        attributes.add(createAttr(1, "region", "string", "Регион"));
        attributes.add(createAttr(2, "city", "string", "Город"));
        attributes.add(createAttr(3, "product_category", "string", "Категория"));
        attributes.add(createAttr(4, "product_name", "string", "Продукт"));
        attributes.add(createAttr(5, "quarter", "string", "Квартал"));
        attributes.add(createAttr(6, "year", "string", "Год"));
        attributes.add(createAttr(7, "sales_amount", "number", "Сумма продаж"));
        attributes.add(createAttr(8, "profit", "number", "Прибыль"));
        attributes.add(createAttr(9, "quantity", "number", "Количество"));
        attributes.add(createAttr(10, "customer_count", "number", "Клиенты"));

        return attributes;
    }

    // ========== 3. ПОЛУЧЕНИЕ ЗНАЧЕНИЙ АТРИБУТА ==========
    @GetMapping("/attributes/{name}/values")
    public Map<String, Object> getAttributeValues(@PathVariable("name") String name) {
        List<String> values = getMockValues(name);
        Map<String, Object> result = new HashMap<>();
        result.put("attribute", name);
        result.put("values", values);
        result.put("count", values.size());
        return result;
    }

    // ========== 4. ПОСТРОЕНИЕ СВОДНОЙ ТАБЛИЦЫ ==========
    @PostMapping("/pivot")
    public Map<String, Object> buildPivot(@RequestBody Map<String, Object> request) {

        List<String> rows = (List<String>) request.getOrDefault("rows", List.of("region"));
        List<String> columns = (List<String>) request.getOrDefault("columns", List.of("quarter"));
        List<String> measures = (List<String>) request.getOrDefault("measures", List.of("sales_amount"));

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("rows", rows);
        response.put("columns", columns);
        response.put("measures", measures);
        response.put("data", generateMockData(rows, columns, measures));

        return response;
    }

    // ========== 5. ИИ-РЕКОМЕНДАЦИЯ ==========
    @PostMapping("/ai/recommend")
    public Map<String, Object> recommendPivot(@RequestBody Map<String, String> request) {
        return Map.of(
                "status", "success",
                "recommendations", List.of(
                        Map.of(
                                "name", "Анализ продаж по регионам",
                                "rows", List.of("region"),
                                "columns", List.of("quarter"),
                                "measures", List.of("sales_amount"),
                                "aggregation", "SUM"
                        ),
                        Map.of(
                                "name", "Топ продуктов по прибыли",
                                "rows", List.of("product_category"),
                                "measures", List.of("profit"),
                                "aggregation", "SUM",
                                "sort", "DESC",
                                "limit", 10
                        )
                )
        );
    }


    private Map<String, Object> createAttr(int id, String name, String type, String displayName) {
        Map<String, Object> attr = new HashMap<>();
        attr.put("id", id);
        attr.put("name", name);
        attr.put("type", type);
        attr.put("displayName", displayName);
        attr.put("aggregations", type.equals("number") ?
                List.of("SUM", "AVG", "MIN", "MAX", "COUNT") :
                List.of("COUNT", "COUNT_DISTINCT"));
        return attr;
    }

    private Map<String, Object> generateMockData(List<String> rows, List<String> columns, List<String> measures) {
        Map<String, Object> data = new HashMap<>();

        List<String> rowValues;
        if (rows != null && !rows.isEmpty()) {
            String firstRow = rows.get(0);
            switch (firstRow) {
                case "region":
                    rowValues = Arrays.asList("Москва", "СПб", "Казань", "Новосибирск");
                    break;
                case "product_category":
                    rowValues = Arrays.asList("Ноутбуки", "Смартфоны", "Планшеты");
                    break;
                default:
                    rowValues = Arrays.asList("Значение 1", "Значение 2", "Значение 3");
            }
        } else {
            rowValues = Arrays.asList("Строка 1", "Строка 2", "Строка 3");
        }

        List<String> colValues;
        if (columns != null && !columns.isEmpty()) {
            String firstCol = columns.get(0);
            switch (firstCol) {
                case "quarter":
                    colValues = Arrays.asList("Q1", "Q2", "Q3", "Q4");
                    break;
                case "year":
                    colValues = Arrays.asList("2023", "2024", "2025");
                    break;
                default:
                    colValues = Arrays.asList("Колонка 1", "Колонка 2", "Колонка 3");
            }
        } else {
            colValues = Arrays.asList("Колонка 1", "Колонка 2", "Колонка 3");
        }

        data.put("rows", rowValues);
        data.put("columns", colValues);

        List<List<Double>> values = new ArrayList<>();
        Random rand = new Random();
        for (int i = 0; i < rowValues.size(); i++) {
            List<Double> row = new ArrayList<>();
            for (int j = 0; j < colValues.size(); j++) {
                row.add(10000 + rand.nextDouble() * 50000);
            }
            values.add(row);
        }
        data.put("values", values);

        return data;
    }

    private List<String> getMockValues(String attribute) {
        switch (attribute) {
            case "region":
                return Arrays.asList("Москва", "СПб", "Казань", "Новосибирск", "Екатеринбург");
            case "quarter":
                return Arrays.asList("Q1", "Q2", "Q3", "Q4");
            case "product_category":
                return Arrays.asList("Ноутбуки", "Смартфоны", "Планшеты", "Аксессуары");
            default:
                return Arrays.asList("Значение 1", "Значение 2", "Значение 3");
        }
    }
}