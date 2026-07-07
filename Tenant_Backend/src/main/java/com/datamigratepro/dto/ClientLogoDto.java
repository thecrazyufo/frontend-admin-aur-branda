package com.datamigratepro.dto;

import lombok.Data;

@Data
public class ClientLogoDto {
    private String companyName;
    private String logoUrl;
    private Integer displayOrder;
    private String description;
    private String caseStudy;
}
