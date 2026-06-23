package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Screenshot implements Serializable {
    private String url;
    private String alt;
    private String caption;
}
