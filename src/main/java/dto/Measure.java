package dto;

public class Measure {
    private String field;
    private String aggregation;
    private String alias;

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }
    public String getAggregation() { return aggregation; }
    public void setAggregation(String aggregation) { this.aggregation = aggregation; }
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
}
