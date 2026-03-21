// Файл: src/main/java/repository/AnalyticsRepository.java
package repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class AnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1. Постраничная выгрузка сырых данных (GET)
    public List<Map<String, Object>> getRawDataset(int limit, int offset) {
        String sql = "SELECT * FROM dataset LIMIT ? OFFSET ?";
        return jdbcTemplate.queryForList(sql, limit, offset);
    }

    // 2. Выполнение динамического агрегирующего запроса для Pivot Table (POST)
    public List<Map<String, Object>> getDynamicPivotData(List<String> dimensions, List<String> measures, String aggFunc) {
        // Формируем блок SELECT (измерения + агрегация)
        String groupByCols = String.join(", ", dimensions);

        // Преобразуем список метрик в SQL: SUM(measure) as measure
        String aggCols = measures.stream()
                .map(m -> aggFunc + "(" + m + ") as " + m)
                .collect(Collectors.joining(", "));

        String selectFields = groupByCols.isEmpty() ? aggCols : (groupByCols + (aggCols.isEmpty() ? "" : ", " + aggCols));

        String sql = "SELECT " + selectFields + " FROM dataset";

        // Добавляем GROUP BY, если есть измерения
        if (!dimensions.isEmpty()) {
            sql += " GROUP BY " + groupByCols;
        }

        // Защита от слишком больших выборок при агрегации
        sql += " LIMIT 5000";

        return jdbcTemplate.queryForList(sql);
    }
}