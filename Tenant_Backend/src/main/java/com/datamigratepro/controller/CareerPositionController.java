package com.datamigratepro.controller;

import com.datamigratepro.entity.CareerPosition;
import com.datamigratepro.repository.CareerPositionRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class CareerPositionController {

    @Autowired
    private CareerPositionRepository careerPositionRepository;

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<CareerPosition>> getPositions(
            @RequestParam(required = true) String siteId,
            @RequestParam(required = false) String status) {
        
        SecurityUtils.checkAccess(siteId);

        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(careerPositionRepository.findBySiteIdAndStatus(siteId, status));
        }
        return ResponseEntity.ok(careerPositionRepository.findBySiteId(siteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CareerPosition> getPositionById(@PathVariable String id) {
        Optional<CareerPosition> pos = careerPositionRepository.findById(id);
        if (pos.isPresent()) {
            SecurityUtils.checkAccess(pos.get().getSiteId());
            return ResponseEntity.ok(pos.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 🔐 ADMIN-ONLY WRITE ENDPOINTS
    @PostMapping
    public ResponseEntity<CareerPosition> createPosition(@RequestBody CareerPosition pos) {
        if (pos.getSiteId() == null || pos.getSiteId().isBlank()) {
            throw new IllegalArgumentException("Career siteId is required");
        }
        SecurityUtils.checkAccess(pos.getSiteId());

        if (pos.getId() == null || pos.getId().isBlank()) {
            pos.setId(UUID.randomUUID().toString());
        }
        if (pos.getStatus() == null || pos.getStatus().isBlank()) {
            pos.setStatus("OPEN");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(careerPositionRepository.save(pos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CareerPosition> updatePosition(@PathVariable String id, @RequestBody CareerPosition pos) {
        Optional<CareerPosition> existing = careerPositionRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (pos.getSiteId() != null && !pos.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(pos.getSiteId());
        } else {
            pos.setSiteId(existing.get().getSiteId());
        }

        pos.setId(id);
        return ResponseEntity.ok(careerPositionRepository.save(pos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosition(@PathVariable String id) {
        Optional<CareerPosition> posOpt = careerPositionRepository.findById(id);
        if (posOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(posOpt.get().getSiteId());

        careerPositionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
