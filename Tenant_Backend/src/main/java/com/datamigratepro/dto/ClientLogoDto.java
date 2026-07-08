package com.datamigratepro.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClientLogoDto {
    private String companyName;
    private String logoUrl;
    private Integer displayOrder;
    private String description;
    private String caseStudy;
    private List<String> productIds;
}
