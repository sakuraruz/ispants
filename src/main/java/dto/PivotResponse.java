package dto;

import java.util.List;
import java.util.Map;

public class PivotResponse {
    private String status;
    private List<String> rows;
    private List<String> columns;
    private List<List<Double>> values;
    private Map<String, Object> metadata;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getRows() { return rows; }
    public void setRows(List<String> rows) { this.rows = rows; }

    public List<String> getColumns() { return columns; }
    public void setColumns(List<String> columns) { this.columns = columns; }

    public List<List<Double>> getValues() { return values; }
    public void setValues(List<List<Double>> values) { this.values = values; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}