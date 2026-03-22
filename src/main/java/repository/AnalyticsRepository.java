
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
        int safeLimit = Math.min(limit, 100000);
        String sql = "SELECT * FROM dataset ORDER BY row_number LIMIT ? OFFSET ?";
        return jdbcTemplate.queryForList(sql, safeLimit, offset);
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
        sql += " LIMIT 50000";
        
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getAttributesFromDB() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        try {
            // Получаем все колонки из таблицы dataset
            String sql = """
                SELECT 
                    column_name as name,
                    data_type as type
                FROM information_schema.columns
                WHERE table_name = 'dataset'
                ORDER BY ordinal_position
                """;
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);
            
            int id = 1;
            for (Map<String, Object> col : columns) {
                String name = (String) col.get("name");
                String dbType = (String) col.get("type");
                
                Map<String, Object> attr = new HashMap<>();
                attr.put("id", id++);
                attr.put("name", name);
                
                // Определяем displayName (человекочитаемое название)
                String displayName = getDisplayName(name);
                attr.put("displayName", displayName);
                
                // Определяем тип атрибута (dimension или measure)
                boolean isMeasure = isMeasureColumn(name, dbType);
                attr.put("type", isMeasure ? "measure" : "dimension");
                
                // Определяем dataType
                attr.put("dataType", dbType.contains("int") || dbType.contains("numeric") || dbType.contains("decimal") ? "number" : "string");
                
                // Определяем доступные агрегации
                attr.put("aggregations", isMeasure ? 
                        List.of("SUM", "AVG", "MIN", "MAX", "COUNT") :
                        List.of("COUNT", "COUNT_DISTINCT"));
                
                result.add(attr);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Если не удалось получить из БД, возвращаем базовый набор
            return getFallbackAttributes();
        }
        
        return result;
    }
    
    private String getDisplayName(String columnName) {
        // Словарь для красивых названий
        Map<String, String> displayNames = new HashMap<>();
        displayNames.put("row_number", "ID");
        displayNames.put("created_at", "Дата создания");
        displayNames.put("region", "Регион");
        displayNames.put("product_category", "Категория товара");
        displayNames.put("year", "Год");
        displayNames.put("quarter", "Квартал");
        displayNames.put("sales_amount", "Сумма продаж");
        displayNames.put("profit", "Прибыль");
        displayNames.put("quantity", "Количество");
        displayNames.put("revenue_usd", "Выручка USD");
        displayNames.put("revenue_eur", "Выручка EUR");
        displayNames.put("gross_margin", "Валовая маржа");
        displayNames.put("net_margin", "Чистая маржа");
        displayNames.put("ebitda", "EBITDA");
        displayNames.put("operating_cost", "Операционные расходы");
        displayNames.put("marketing_spend", "Маркетинговые расходы");
        displayNames.put("customer_satisfaction_score", "Удовлетворенность клиентов");
        displayNames.put("nps_score", "NPS");
        displayNames.put("delivery_time_hours", "Время доставки (часы)");
        displayNames.put("conversion_rate", "Конверсия");
        displayNames.put("customer_lifetime_value", "LTV клиента");
        displayNames.put("customer_age", "Возраст клиента");
        displayNames.put("customer_tenure_months", "Стаж клиента (мес)");
        displayNames.put("review_rating", "Рейтинг отзывов");
        displayNames.put("return_rate", "Процент возвратов");
        displayNames.put("churn_risk_score", "Риск оттока");
        displayNames.put("loyalty_points", "Баллы лояльности");
        displayNames.put("stock_level", "Уровень запасов");
        displayNames.put("supplier_rating", "Рейтинг поставщика");
        displayNames.put("quality_score", "Оценка качества");
        displayNames.put("defect_rate", "Процент брака");
        displayNames.put("inventory_turnover", "Оборачиваемость запасов");
        displayNames.put("ad_impressions", "Показы рекламы");
        displayNames.put("ad_clicks", "Клики по рекламе");
        displayNames.put("click_through_rate", "CTR");
        displayNames.put("cost_per_acquisition", "CPA");
        displayNames.put("email_open_rate", "Открываемость писем");
        displayNames.put("social_media_shares", "Шеры в соцсетях");
        displayNames.put("employee_count", "Количество сотрудников");
        displayNames.put("productivity_score", "Производительность");
        displayNames.put("error_rate", "Процент ошибок");
        displayNames.put("website_visits", "Посещения сайта");
        displayNames.put("page_views", "Просмотры страниц");
        displayNames.put("session_duration", "Длительность сессии");
        displayNames.put("bounce_rate", "Показатель отказов");
        displayNames.put("app_downloads", "Загрузки приложения");
        displayNames.put("population_density", "Плотность населения");
        displayNames.put("avg_income", "Средний доход");
        displayNames.put("unemployment_rate", "Уровень безработицы");
        displayNames.put("internet_penetration", "Проникновение интернета");
        displayNames.put("smartphone_penetration", "Проникновение смартфонов");
        
        // Если нет в словаре, форматируем автоматически
        return displayNames.getOrDefault(columnName, 
                columnName.replace("_", " ").replace("usd", "USD").replace("eur", "EUR"));
    }
    
    private boolean isMeasureColumn(String columnName, String dbType) {
        // Колонки, которые являются измерениями (категориями)
        Set<String> dimensions = new HashSet<>(Arrays.asList(
            "row_number", "created_at", "region", "product_category", 
            "quarter", "city", "district", "sales_channel", 
            "customer_segment", "payment_method", "order_status"
        ));
        
        if (dimensions.contains(columnName)) {
            return false;
        }
        
        // Числовые колонки - это меры
        return dbType.contains("int") || dbType.contains("numeric") || dbType.contains("decimal") || dbType.contains("double");
    }
    
    private List<Map<String, Object>> getFallbackAttributes() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        String[][] attrs = {
            {"row_number", "ID", "dimension", "number"},
            {"region", "Регион", "dimension", "string"},
            {"product_category", "Категория", "dimension", "string"},
            {"year", "Год", "dimension", "number"},
            {"quarter", "Квартал", "dimension", "string"},
            {"sales_amount", "Сумма продаж", "measure", "number"},
            {"profit", "Прибыль", "measure", "number"},
            {"quantity", "Количество", "measure", "number"},
            {"revenue_usd", "Выручка USD", "measure", "number"},
            {"gross_margin", "Валовая маржа", "measure", "number"},
            {"customer_satisfaction_score", "Удовлетворенность", "measure", "number"},
            {"delivery_time_hours", "Время доставки", "measure", "number"},
            {"conversion_rate", "Конверсия", "measure", "number"},
            {"customer_lifetime_value", "LTV клиента", "measure", "number"}
        };
        
        int id = 1;
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