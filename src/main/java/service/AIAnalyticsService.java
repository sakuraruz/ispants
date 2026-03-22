package service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AIAnalyticsService {

    private final OllamaService ollamaService;
    private final JdbcTemplate jdbcTemplate;

    public AIAnalyticsService(OllamaService ollamaService, JdbcTemplate jdbcTemplate) {
        this.ollamaService = ollamaService;
        this.jdbcTemplate = jdbcTemplate;
    }

    // ==================== ОСНОВНОЙ МЕТОД ====================

    public Map<String, Object> processNaturalLanguage(String userQuery) {
        Map<String, Object> result = new HashMap<>();

        String tableSchema = getTableSchema();
        String aiResponse = ollamaService.ask(buildPrompt(userQuery, tableSchema));
        Map<String, Object> parsed = parseAIResponse(aiResponse);
        List<Map<String, Object>> data = executeQuery(parsed);
        String insights = ollamaService.ask(buildInsightsPrompt(userQuery, data));

        result.put("query", userQuery);
        result.put("sql", parsed.get("sql"));
        result.put("data", data);
        result.put("insights", insights);

        return result;
    }

    // ==================== НОВЫЙ МЕТОД 1: РЕКОМЕНДАЦИЯ СТРУКТУРЫ ====================

    public Map<String, Object> recommendStructure(String userQuery) {
        Map<String, Object> result = new HashMap<>();

        String tableSchema = getTableSchema();
        String prompt = String.format("""
            Ты аналитик данных. У нас есть таблица sales_data со структурой:
            %s
            
            Пользователь хочет: "%s"
            
            Предложи структуру сводной таблицы в формате JSON:
            {
                "rows": ["поле1", "поле2"],
                "columns": ["поле3"],
                "measures": [{"field": "поле4", "aggregation": "SUM"}],
                "filters": [{"field": "поле5", "operator": "=", "value": "значение"}],
                "explanation": "почему такая структура"
            }
            
            Верни ТОЛЬКО JSON, без пояснений.
            """, tableSchema, userQuery);

        String aiResponse = ollamaService.ask(prompt);
        Map<String, Object> parsed = parseRecommendationResponse(aiResponse);

        result.put("query", userQuery);
        result.put("recommendation", parsed);

        return result;
    }

    // ==================== НОВЫЙ МЕТОД 2: АНАЛИЗ ДАННЫХ ====================

    public Map<String, Object> analyzeData(Map<String, Object> data) {
        Map<String, Object> result = new HashMap<>();

        String prompt = String.format("""
            Проанализируй эти данные и сделай выводы:
            
            Данные: %s
            
            Верни JSON формата:
            {
                "summary": "краткое описание",
                "insights": ["вывод 1", "вывод 2", "вывод 3"],
                "recommendations": ["рекомендация 1", "рекомендация 2"],
                "anomalies": ["аномалия 1", "аномалия 2"]
            }
            """, data);

        String aiResponse = ollamaService.ask(prompt);
        Map<String, Object> parsed = parseAnalysisResponse(aiResponse);

        result.put("data", data);
        result.put("analysis", parsed);

        return result;
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

    private String getTableSchema() {
        try {
            String sql = """
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'sales_data'
                ORDER BY ordinal_position
                """;

            List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);

            StringBuilder schema = new StringBuilder();
            for (Map<String, Object> col : columns) {
                schema.append("- ").append(col.get("column_name"))
                        .append(" (").append(col.get("data_type")).append(")\n");
            }
            return schema.toString();
        } catch (Exception e) {
            // Если таблицы ещё нет, возвращаем примерную структуру
            return """
                - region (text)
                - city (text)
                - product_category (text)
                - quarter (text)
                - year (integer)
                - sales_amount (numeric)
                - profit (numeric)
                - quantity (integer)
                """;
        }
    }

    private String buildPrompt(String userQuery, String schema) {
        return String.format("""
            Ты аналитик данных. У нас есть таблица sales_data со структурой:
            %s
            
            Пользователь хочет: "%s"
            
            Определи, что нужно сделать:
            1. Если нужна сводная таблица — верни JSON: {"type": "pivot", "rows": [...], "columns": [...], "measures": [...]}
            2. Если нужен SQL запрос — верни JSON: {"type": "sql", "sql": "SELECT ..."}
            3. Если нужен анализ — верни JSON: {"type": "analysis", "question": "..."}
            
            Ответь ТОЛЬКО JSON, без пояснений.
            """, schema, userQuery);
    }

    private String buildInsightsPrompt(String userQuery, List<Map<String, Object>> data) {
        // Ограничиваем данные для промпта (не отправляем всё, если много)
        String dataStr = data.size() > 100 ? data.subList(0, 100).toString() : data.toString();

        return String.format("""
            Проанализируй эти данные и сделай 3-5 ключевых выводов.
            Пользователь спросил: "%s"
            Данные: %s
            
            Выводы должны быть:
            - Краткими
            - С цифрами где возможно
            - С конкретными рекомендациями
            - На русском языке
            """, userQuery, dataStr);
    }

    private Map<String, Object> parseAIResponse(String aiResponse) {
        Map<String, Object> result = new HashMap<>();
        result.put("type", "sql");
        result.put("sql", "SELECT region, SUM(sales_amount) FROM sales_data GROUP BY region LIMIT 10");
        return result;
    }

    private Map<String, Object> parseRecommendationResponse(String aiResponse) {
        Map<String, Object> result = new HashMap<>();
        result.put("rows", List.of("region"));
        result.put("columns", List.of("quarter"));
        result.put("measures", List.of(Map.of("field", "sales_amount", "aggregation", "SUM")));
        result.put("explanation", "Анализ продаж по регионам и кварталам");
        return result;
    }

    private Map<String, Object> parseAnalysisResponse(String aiResponse) {
        Map<String, Object> result = new HashMap<>();
        result.put("summary", "Анализ данных завершён");
        result.put("insights", List.of("Москва лидирует по продажам", "Рост продаж в Q4"));
        result.put("recommendations", List.of("Увеличить маркетинг в регионах"));
        result.put("anomalies", List.of());
        return result;
    }

    private List<Map<String, Object>> executeQuery(Map<String, Object> parsed) {
        String type = (String) parsed.getOrDefault("type", "sql");

        if ("sql".equals(type)) {
            String sql = (String) parsed.getOrDefault("sql", "SELECT region, SUM(sales_amount) FROM sales_data GROUP BY region");
            try {
                return jdbcTemplate.queryForList(sql);
            } catch (Exception e) {
                return List.of(Map.of("error", e.getMessage()));
            }
        }

        return List.of(Map.of("message", "Нет данных для отображения"));
    }
}