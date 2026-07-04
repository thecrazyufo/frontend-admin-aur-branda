package com.datamigratepro.repository;

import com.datamigratepro.entity.FormatCompatibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormatCompatibilityRepository extends JpaRepository<FormatCompatibility, String> {

    /**
     * Find all compatibility rules where source_format matches.
     * Used to find what formats can be produced FROM a given source.
     */
    List<FormatCompatibility> findBySourceFormat(String sourceFormat);

    /**
     * Find all compatibility rules where target_format matches.
     * Used to find what formats can produce a given target.
     */
    List<FormatCompatibility> findByTargetFormat(String targetFormat);

    /**
     * Find exact rule for a specific source→target pair.
     */
    List<FormatCompatibility> findBySourceFormatAndTargetFormat(String sourceFormat, String targetFormat);

    /**
     * Find all rules for a given source format with a minimum compatibility score.
     * Used for fuzzy matching — filter out weak matches.
     */
    @Query("SELECT fc FROM FormatCompatibility fc WHERE fc.sourceFormat = :source AND fc.compatibilityScore >= :minScore ORDER BY fc.compatibilityScore DESC")
    List<FormatCompatibility> findBySourceFormatWithMinScore(@Param("source") String source, @Param("minScore") int minScore);

    /**
     * Find all rules where source OR target matches, with minimum score.
     * Used to find related products from either direction.
     */
    @Query("SELECT fc FROM FormatCompatibility fc WHERE (fc.sourceFormat = :format OR fc.targetFormat = :format) AND fc.compatibilityScore >= :minScore ORDER BY fc.compatibilityScore DESC")
    List<FormatCompatibility> findRelatedByFormat(@Param("format") String format, @Param("minScore") int minScore);
}
