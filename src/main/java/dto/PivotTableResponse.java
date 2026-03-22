package dto;

import java.util.List;
import java.util.Map;

public class PivotTableResponse {
    private List<String> columns;           // названия колонок
    private List<PivotRow> rows;             // строки с данными
    private Totals totals;                   // итоги
    
    public static class PivotRow {
        private String label;                // название строки
        private List<Object> values;         // значения в колонках
        private List<Object> subtotal;       // промежуточные итоги (опционально)
        
        // getters, setters, constructor
    }
    
    public static class Totals {
        private List<Object> rowTotals;      // итоги по строкам
        private List<Object> columnTotals;   // итоги по колонкам
        private Object grandTotal;           // общий итог
        
        // getters, setters
    }
    
    // getters, setters
}