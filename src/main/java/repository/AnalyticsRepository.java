package repository;

import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class AnalyticsRepository {

    public List<Map<String, Object>> getAttributesFromDB() {
        return getMockAttributes();
    }

    public List<Map<String, Object>> executePivotQuery(String sql) {
        return getMockPivotData();
    }

    public List<String> getAttributeValues(String attributeName) {
        return getMockValues(attributeName);
    }

    private List<Map<String, Object>> getMockAttributes() {
        List<Map<String, Object>> attrs = new ArrayList<>();
        attrs.add(createAttr(1, "region", "string", "Регион", List.of("COUNT", "COUNT_DISTINCT")));
        attrs.add(createAttr(2, "city", "string", "Город", List.of("COUNT", "COUNT_DISTINCT")));
        attrs.add(createAttr(3, "product_category", "string", "Категория", List.of("COUNT", "COUNT_DISTINCT")));
        attrs.add(createAttr(4, "product_name", "string", "Продукт", List.of("COUNT", "COUNT_DISTINCT")));
        attrs.add(createAttr(5, "quarter", "string", "Квартал", List.of("COUNT", "COUNT_DISTINCT")));
        attrs.add(createAttr(6, "year", "number", "Год", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
        attrs.add(createAttr(7, "sales_amount", "number", "Сумма продаж", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
        attrs.add(createAttr(8, "profit", "number", "Прибыль", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
        attrs.add(createAttr(9, "quantity", "number", "Количество", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
        attrs.add(createAttr(10, "customer_count", "number", "Клиенты", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
        return attrs;
    }

    private Map<String, Object> createAttr(int id, String name, String type, String displayName, List<String> aggs) {
        Map<String, Object> attr = new HashMap<>();
        attr.put("id", id);
        attr.put("name", name);
        attr.put("type", type);
        attr.put("displayName", displayName);
        attr.put("aggregations", aggs);
        return attr;
    }

    private List<Map<String, Object>> getMockPivotData() {
        List<Map<String, Object>> result = new ArrayList<>();

        Map<String, Object> row1 = new HashMap<>();
        row1.put("region", "Москва");
        row1.put("quarter", "Q1");
        row1.put("total_sales", 12500.0);
        result.add(row1);

        Map<String, Object> row2 = new HashMap<>();
        row2.put("region", "Москва");
        row2.put("quarter", "Q2");
        row2.put("total_sales", 13400.0);
        result.add(row2);

        Map<String, Object> row3 = new HashMap<>();
        row3.put("region", "СПб");
        row3.put("quarter", "Q1");
        row3.put("total_sales", 8900.0);
        result.add(row3);

        Map<String, Object> row4 = new HashMap<>();
        row4.put("region", "СПб");
        row4.put("quarter", "Q2");
        row4.put("total_sales", 9200.0);
        result.add(row4);

        return result;
    }

    private List<String> getMockValues(String attribute) {
        return switch (attribute) {
            case "region" -> Arrays.asList("Москва", "СПб", "Казань", "Новосибирск", "Екатеринбург");
            case "quarter" -> Arrays.asList("Q1", "Q2", "Q3", "Q4");
            case "product_category" -> Arrays.asList("Ноутбуки", "Смартфоны", "Планшеты");
            default -> Arrays.asList("Значение 1", "Значение 2", "Значение 3");
        };
    }
}