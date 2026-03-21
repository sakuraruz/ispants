package org.example.model;

import java.time.LocalDateTime;

public class SavedView {
    private Integer id;
    private String name;
    private String description;
    private String configData;  // пока просто строка, потом будем парсить JSON
    private LocalDateTime createdAt;
    
    public SavedView() {}
    
    public SavedView(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Геттеры и сеттеры
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getConfigData() { return configData; }
    public void setConfigData(String configData) { this.configData = configData; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
