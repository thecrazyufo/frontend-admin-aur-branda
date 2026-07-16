package com.datamigratepro.service;

import com.datamigratepro.entity.BrandConfig;
import com.datamigratepro.repository.BrandConfigRepository;
import com.datamigratepro.config.TenantContext;
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
        System.out.println("🔄 [BrandConfigService] Refreshing cache. Tenant: " + TenantContext.getCurrentTenant());
        try {
            List<BrandConfig> configs = brandConfigRepository.findAll();
            System.out.println("🔄 [BrandConfigService] DB returned " + configs.size() + " brands.");
            brandCache.clear();
            for (BrandConfig config : configs) {
                System.out.println("  - Brand: " + config.getId() + " (active=" + config.isActive() + ")");
                if (config.isActive()) {
                    brandCache.put(config.getId(), config);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ [BrandConfigService] Error loading brands: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public BrandConfig getBrandConfig(String brandId) {
        if (brandCache.isEmpty()) {
            refreshCache();
        }
        return brandCache.get(brandId);
    }

    public BrandConfig getBrandConfigFromDb(String brandId) {
        return brandConfigRepository.findById(brandId).orElse(null);
    }

    public BrandConfig saveBrandConfig(BrandConfig config) {
        BrandConfig saved = brandConfigRepository.save(config);
        refreshCache();
        return saved;
    }

    public boolean isValidBrand(String brandId) {
        if (brandCache.isEmpty()) {
            refreshCache();
        }
        return brandCache.containsKey(brandId);
    }
    
    public List<BrandConfig> getAllActiveBrands() {
        if (brandCache.isEmpty()) {
            refreshCache();
        }
        List<BrandConfig> sortedList = new java.util.ArrayList<>(brandCache.values());
        sortedList.sort(java.util.Comparator.comparing(BrandConfig::getId));
        return sortedList;
    }
}
