// package repository;

// import org.springframework.stereotype.Repository;
// import java.util.*;

// @Repository
// public class AnalyticsRepository {

//     public List<Map<String, Object>> getAttributesFromDB() {
//         return getMockAttributes();
//     }

//     public List<Map<String, Object>> executePivotQuery(String sql) {
//         return getMockPivotData();
//     }

//     public List<String> getAttributeValues(String attributeName) {
//         return getMockValues(attributeName);
//     }

//     private List<Map<String, Object>> getMockAttributes() {
//         List<Map<String, Object>> attrs = new ArrayList<>();
//         attrs.add(createAttr(1, "region", "string", "Регион", List.of("COUNT", "COUNT_DISTINCT")));
//         attrs.add(createAttr(2, "city", "string", "Город", List.of("COUNT", "COUNT_DISTINCT")));
//         attrs.add(createAttr(3, "product_category", "string", "Категория", List.of("COUNT", "COUNT_DISTINCT")));
//         attrs.add(createAttr(4, "product_name", "string", "Продукт", List.of("COUNT", "COUNT_DISTINCT")));
//         attrs.add(createAttr(5, "quarter", "string", "Квартал", List.of("COUNT", "COUNT_DISTINCT")));
//         attrs.add(createAttr(6, "year", "number", "Год", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
//         attrs.add(createAttr(7, "sales_amount", "number", "Сумма продаж", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
//         attrs.add(createAttr(8, "profit", "number", "Прибыль", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
//         attrs.add(createAttr(9, "quantity", "number", "Количество", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
//         attrs.add(createAttr(10, "customer_count", "number", "Клиенты", List.of("SUM", "AVG", "MIN", "MAX", "COUNT")));
//         return attrs;
//     }

//     private Map<String, Object> createAttr(int id, String name, String type, String displayName, List<String> aggs) {
//         Map<String, Object> attr = new HashMap<>();
//         attr.put("id", id);
//         attr.put("name", name);
//         attr.put("type", type);
//         attr.put("displayName", displayName);
//         attr.put("aggregations", aggs);
//         return attr;
//     }

//     private List<Map<String, Object>> getMockPivotData() {
//         List<Map<String, Object>> result = new ArrayList<>();

//         Map<String, Object> row1 = new HashMap<>();
//         row1.put("region", "Москва");
//         row1.put("quarter", "Q1");
//         row1.put("total_sales", 12500.0);
//         result.add(row1);

//         Map<String, Object> row2 = new HashMap<>();
//         row2.put("region", "Москва");
//         row2.put("quarter", "Q2");
//         row2.put("total_sales", 13400.0);
//         result.add(row2);

//         Map<String, Object> row3 = new HashMap<>();
//         row3.put("region", "СПб");
//         row3.put("quarter", "Q1");
//         row3.put("total_sales", 8900.0);
//         result.add(row3);

//         Map<String, Object> row4 = new HashMap<>();
//         row4.put("region", "СПб");
//         row4.put("quarter", "Q2");
//         row4.put("total_sales", 9200.0);
//         result.add(row4);

//         return result;
//     }

//     private List<String> getMockValues(String attribute) {
//         return switch (attribute) {
//             case "region" -> Arrays.asList("Москва", "СПб", "Казань", "Новосибирск", "Екатеринбург");
//             case "quarter" -> Arrays.asList("Q1", "Q2", "Q3", "Q4");
//             case "product_category" -> Arrays.asList("Ноутбуки", "Смартфоны", "Планшеты");
//             default -> Arrays.asList("Значение 1", "Значение 2", "Значение 3");
//         };
//     }
// }

package repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class AnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С БД (от коллеги) ==========
    
    public List<Map<String, Object>> getRawDataset(int limit, int offset) {
        String sql = "SELECT * FROM dataset LIMIT ? OFFSET ?";
        return jdbcTemplate.queryForList(sql, limit, offset);
    }

    public List<Map<String, Object>> getDynamicPivotData(List<String> dimensions, List<String> measures, String aggFunc) {
        if (measures.isEmpty()) {
            return List.of();
        }
        
        String groupByCols = dimensions.isEmpty() ? "" : String.join(", ", dimensions);
        String aggCols = measures.stream()
                .map(m -> aggFunc + "(" + m + ") as " + m)
                .collect(Collectors.joining(", "));
        String selectFields = groupByCols.isEmpty() ? aggCols : (groupByCols + (aggCols.isEmpty() ? "" : ", " + aggCols));
        
        String sql = "SELECT " + selectFields + " FROM dataset";
        if (!dimensions.isEmpty()) {
            sql += " GROUP BY " + groupByCols;
        }
        sql += " LIMIT 5000";
        
        return jdbcTemplate.queryForList(sql);
    }

    // ========== МЕТОДЫ ДЛЯ АТРИБУТОВ (из вашего проекта, адаптированы) ==========
    
    public List<Map<String, Object>> getAttributesFromDB() {
        // Получаем список колонок из таблицы dataset
        String sql = """
            SELECT 
                column_name as name,
                data_type as type
            FROM information_schema.columns
            WHERE table_name = 'dataset'
            ORDER BY ordinal_position
            LIMIT 20
            """;
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);
        
        // Преобразуем в формат, ожидаемый фронтом
        List<Map<String, Object>> result = new ArrayList<>();
        int id = 1;
        for (Map<String, Object> col : columns) {
            Map<String, Object> attr = new HashMap<>();
            String name = (String) col.get("name");
            String type = (String) col.get("type");
            attr.put("id", id++);
            attr.put("name", name);
            attr.put("type", type.contains("int") ? "number" : "string");
            attr.put("displayName", name.replace("_", " "));
            attr.put("aggregations", type.contains("int") || type.contains("numeric") ?
                    List.of("SUM", "AVG", "MIN", "MAX", "COUNT") :
                    List.of("COUNT", "COUNT_DISTINCT"));
            result.add(attr);
        }
        return result;
    }

    public List<String> getAttributeValues(String attributeName) {
        try {
            String sql = "SELECT DISTINCT " + attributeName + " FROM dataset WHERE " + attributeName + " IS NOT NULL LIMIT 100";
            return jdbcTemplate.queryForList(sql, String.class);
        } catch (Exception e) {
            return List.of("Пример 1", "Пример 2", "Пример 3");
        }
    }
}