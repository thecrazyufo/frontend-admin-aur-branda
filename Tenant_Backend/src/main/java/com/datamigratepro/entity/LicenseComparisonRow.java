package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LicenseComparisonRow {
    private String feature;
    private String trial;
    private String personal;
    private String enterprise;
}
