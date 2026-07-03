package com.datamigratepro.service;

import com.datamigratepro.entity.BrandConfig;
import com.datamigratepro.repository.BrandConfigRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BrandConfigService {

    @Autowired
    private BrandConfigRepository brandConfigRepository;

    private final Map<String, BrandConfig> brandCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        refreshCache();
    }

    public void refreshCache() {
        List<BrandConfig> configs = brandConfigRepository.findAll();
        brandCache.clear();
        for (BrandConfig config : configs) {
            if (config.isActive()) {
                brandCache.put(config.getId(), config);
            }
        }
    }

    public BrandConfig getBrandConfig(String brandId) {
        return brandCache.get(brandId);
    }

    public boolean isValidBrand(String brandId) {
        return brandCache.containsKey(brandId);
    }
    
    public List<BrandConfig> getAllActiveBrands() {
        List<BrandConfig> sortedList = new java.util.ArrayList<>(brandCache.values());
        sortedList.sort(java.util.Comparator.comparing(BrandConfig::getId));
        return sortedList;
    }
}
