package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemRequirements implements Serializable {
    private String os;
    private String processor;
    private String ram;
    private String disk;
    private List<String> other;
}
