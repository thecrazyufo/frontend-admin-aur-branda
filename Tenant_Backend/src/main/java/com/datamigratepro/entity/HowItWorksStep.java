package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HowItWorksStep implements Serializable {
    private int step;
    private String title;
    private String description;
    private String icon;
}
