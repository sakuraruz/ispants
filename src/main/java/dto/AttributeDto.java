package dto;

import java.util.List;

public class AttributeDto {
    private int id;
    private String name;
    private String type;
    private String displayName;
    private List<String> aggregations;

    public AttributeDto(int id, String name, String type, String displayName, List<String> aggregations) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.displayName = displayName;
        this.aggregations = aggregations;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getDisplayName() { return displayName; }
    public List<String> getAggregations() { return aggregations; }
}