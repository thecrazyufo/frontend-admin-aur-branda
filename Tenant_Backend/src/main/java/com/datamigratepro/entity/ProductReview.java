package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReview implements Serializable {
    private String id;
    private String author;
    private String role;
    private String company;
    private int rating;
    private String date;
    private String content;
}
