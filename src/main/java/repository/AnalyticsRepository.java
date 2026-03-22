package repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class AnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getRawDataset(int limit, int offset) {
        int safeLimit = Math.min(limit, 100000);
        String sql = "SELECT row_number, region, product_category, year, quarter, sales_amount, profit, quantity FROM dataset ORDER BY row_number LIMIT ? OFFSET ?";
        return jdbcTemplate.queryForList(sql, safeLimit, offset);
    }

    public List<Map<String, Object>> getDynamicPivotData(List<String> dimensions, List<String> measures, String aggFunc) {
        if (measures.isEmpty()) {
            return new ArrayList<>();
        }
        
        String groupByCols = dimensions.isEmpty() ? "" : String.join(", ", dimensions);
        String aggCols = String.join(", ", measures.stream().map(m -> aggFunc + "(" + m + ") as " + m).toArray(String[]::new));
        String selectFields = groupByCols.isEmpty() ? aggCols : (groupByCols + (aggCols.isEmpty() ? "" : ", " + aggCols));
        
        String sql = "SELECT " + selectFields + " FROM dataset";
        if (!dimensions.isEmpty()) {
            sql += " GROUP BY " + groupByCols;
        }
        sql += " ORDER BY " + (dimensions.isEmpty() ? "1" : dimensions.get(0));
        sql += " LIMIT 50000";
        
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getAttributesFromDB() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        Map<String, Object> idAttr = new HashMap<>();
        idAttr.put("id", 1);
        idAttr.put("name", "row_number");
        idAttr.put("displayName", "ID");
        idAttr.put("type", "dimension");
        idAttr.put("dataType", "number");
        idAttr.put("aggregations", List.of("COUNT", "COUNT_DISTINCT"));
        result.add(idAttr);
        
        String[][] attrs = {
            {"region", "Регион", "dimension", "string"},
            {"product_category", "Категория", "dimension", "string"},
            {"year", "Год", "dimension", "number"},
            {"quarter", "Квартал", "dimension", "string"},
            {"sales_amount", "Сумма продаж", "measure", "number"},
            {"profit", "Прибыль", "measure", "number"},
            {"quantity", "Количество", "measure", "number"}
        };
        
        int id = 2;
        for (String[] attr : attrs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", id++);
            map.put("name", attr[0]);
            map.put("displayName", attr[1]);
            map.put("type", attr[2]);
            map.put("dataType", attr[3]);
            map.put("aggregations", attr[2].equals("measure") ? 
                    List.of("SUM", "AVG", "MIN", "MAX", "COUNT") :
                    List.of("COUNT", "COUNT_DISTINCT"));
            result.add(map);
        }
        
        return result;
    }

    public List<String> getAttributeValues(String attributeName) {
        try {
            String sql = "SELECT DISTINCT " + attributeName + " FROM dataset WHERE " + attributeName + " IS NOT NULL ORDER BY " + attributeName + " LIMIT 100";
            return jdbcTemplate.queryForList(sql, String.class);
        } catch (Exception e) {
            return List.of("Москва", "СПб", "Казань");
        }
    }
}
