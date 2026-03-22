// dto/AttributeDto.java

package dto;

import java.util.List;

public class AttributeDto {
    private int id;
    private String name;
    private String type;      // dimension / measure
    private String dataType;  // string / number / date  (добавить)
    private String displayName;
    private List<String> aggregations;
    
    // конструктор с dataType
    public AttributeDto(int id, String name, String type, String dataType, 
                        String displayName, List<String> aggregations) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.dataType = dataType;
        this.displayName = displayName;
        this.aggregations = aggregations;
    }
}