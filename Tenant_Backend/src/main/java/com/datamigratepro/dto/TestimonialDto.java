package com.datamigratepro.dto;

import lombok.Data;

@Data
public class TestimonialDto {
    private String authorName;
    private String authorTitle;
    private String company;
    private String content;
    private Integer rating;
    private String avatarUrl;
    private Boolean isFeatured;
}
