package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seo implements Serializable {
    private String title;
    private String description;
    private List<String> keywords;
    private String canonicalUrl;
    private String ogTitle;
    private String ogDescription;
    private String ogImage;

    public Seo(String title, String description, List<String> keywords) {
        this.title = title;
        this.description = description;
        this.keywords = keywords;
    }
}
