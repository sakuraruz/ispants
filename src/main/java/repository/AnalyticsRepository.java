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

    public List<Map<String, Object>> getRawDataset(int limit, int offset) {
        String sql = "SELECT id, region, quarter, sales_amount, profit, quantity, product_category, year, created_at FROM dataset LIMIT ? OFFSET ?";
        return jdbcTemplate.queryForList(sql, limit, offset);
    }

    public List<Map<String, Object>> getDynamicPivotData(List<String> dimensions, List<String> measures, String aggFunc) {
        if (measures.isEmpty()) {
            return new ArrayList<>();
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
        sql += " ORDER BY " + (dimensions.isEmpty() ? "1" : dimensions.get(0));
        sql += " LIMIT 5000";
        
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getAttributesFromDB() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Явно определяем атрибуты для понятного отображения
        List<Map<String, Object>> attrs = new ArrayList<>();
        
        Map<String, Object> region = new HashMap<>();
        region.put("id", 1);
        region.put("name", "region");
        region.put("type", "dimension");
        region.put("dataType", "string");
        region.put("displayName", "Регион");
        region.put("aggregations", List.of("COUNT", "COUNT_DISTINCT"));
        attrs.add(region);
        
        Map<String, Object> quarter = new HashMap<>();
        quarter.put("id", 2);
        quarter.put("name", "quarter");
        quarter.put("type", "dimension");
        quarter.put("dataType", "string");
        quarter.put("displayName", "Квартал");
        quarter.put("aggregations", List.of("COUNT", "COUNT_DISTINCT"));
        attrs.add(quarter);
        
        Map<String, Object> productCategory = new HashMap<>();
        productCategory.put("id", 3);
        productCategory.put("name", "product_category");
        productCategory.put("type", "dimension");
        productCategory.put("dataType", "string");
        productCategory.put("displayName", "Категория товара");
        productCategory.put("aggregations", List.of("COUNT", "COUNT_DISTINCT"));
        attrs.add(productCategory);
        
        Map<String, Object> year = new HashMap<>();
        year.put("id", 4);
        year.put("name", "year");
        year.put("type", "dimension");
        year.put("dataType", "number");
        year.put("displayName", "Год");
        year.put("aggregations", List.of("SUM", "AVG", "MIN", "MAX", "COUNT"));
        attrs.add(year);
        
        Map<String, Object> salesAmount = new HashMap<>();
        salesAmount.put("id", 5);
        salesAmount.put("name", "sales_amount");
        salesAmount.put("type", "measure");
        salesAmount.put("dataType", "number");
        salesAmount.put("displayName", "Сумма продаж");
        salesAmount.put("aggregations", List.of("SUM", "AVG", "MIN", "MAX", "COUNT"));
        attrs.add(salesAmount);
        
        Map<String, Object> profit = new HashMap<>();
        profit.put("id", 6);
        profit.put("name", "profit");
        profit.put("type", "measure");
        profit.put("dataType", "number");
        profit.put("displayName", "Прибыль");
        profit.put("aggregations", List.of("SUM", "AVG", "MIN", "MAX", "COUNT"));
        attrs.add(profit);
        
        Map<String, Object> quantity = new HashMap<>();
        quantity.put("id", 7);
        quantity.put("name", "quantity");
        quantity.put("type", "measure");
        quantity.put("dataType", "number");
        quantity.put("displayName", "Количество");
        quantity.put("aggregations", List.of("SUM", "AVG", "MIN", "MAX", "COUNT"));
        attrs.add(quantity);
        
        return attrs;
    }

    public List<String> getAttributeValues(String attributeName) {
        try {
            String sql = "SELECT DISTINCT " + attributeName + " FROM dataset WHERE " + attributeName + " IS NOT NULL ORDER BY " + attributeName + " LIMIT 100";
            return jdbcTemplate.queryForList(sql, String.class);
        } catch (Exception e) {
            return List.of("Москва", "СПб", "Казань", "Новосибирск");
        }
    }
}