package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
public class SystemRequirements implements Serializable {
    private String os;
    private String processor;
    private String ram;
    private String disk;
    
    // macOS requirements
    private String macOs;
    private String macProcessor;
    private String macRam;
    private String macDisk;
    
    // Linux requirements
    private String linuxOs;
    private String linuxProcessor;
    private String linuxRam;
    private String linuxDisk;

    private List<String> other;

    // Backward compatible constructor for DevDatabaseSeeder
    public SystemRequirements(String os, String processor, String ram, String disk, List<String> other) {
        this.os = os;
        this.processor = processor;
        this.ram = ram;
        this.disk = disk;
        this.other = other;
    }

    // Full constructor
    public SystemRequirements(String os, String processor, String ram, String disk,
                              String macOs, String macProcessor, String macRam, String macDisk,
                              String linuxOs, String linuxProcessor, String linuxRam, String linuxDisk,
                              List<String> other) {
        this.os = os;
        this.processor = processor;
        this.ram = ram;
        this.disk = disk;
        this.macOs = macOs;
        this.macProcessor = macProcessor;
        this.macRam = macRam;
        this.macDisk = macDisk;
        this.linuxOs = linuxOs;
        this.linuxProcessor = linuxProcessor;
        this.linuxRam = linuxRam;
        this.linuxDisk = linuxDisk;
        this.other = other;
    }
}
