package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "site_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteSetting {
    @Id
    private String id;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false, unique = true)
    private String siteId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String url;
    private String email;
    private String phone;
    private String address;

    // ─── Existing JSON fields ───────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Socials socials;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<StatItem> stats;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<TrustBadge> trustBadges;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<TeamMember> teamMembers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<PricingComparisonRow> pricingComparison;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<PricingFaq> pricingFaqs;

    // ─── NEW: Theme & Branding ──────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private ThemeConfig theme;

    // ─── NEW: Navigation ────────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<NavItem> mainNavigation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private FooterConfig footerConfig;

    // ─── NEW: Home Page ─────────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private HeroConfig hero;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<HomeSection> homeSections;

    // ─── NEW: Legal Pages ───────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> legalPages;

    // ─── NEW: About Page ────────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private AboutPageConfig aboutPage;

    // ─── NEW: Coupons & Offers ──────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<CouponConfig> coupons;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private AnnouncementBar announcement;

    // ─── NEW: SEO Defaults ──────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private SeoDefaults seoDefaults;

    // ═══════════════════════════════════════════════════════════════════════════
    // INNER CLASSES
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Existing inner classes ─────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Socials {
        private String twitter;
        private String linkedin;
        private String youtube;
        private String facebook;
        private String github;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatItem {
        private String value;
        private String label;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrustBadge {
        private String emoji;
        private String title;
        private String desc;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMember {
        private String name;
        private String role;
        private String bio;
        private String initials;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingComparisonRow {
        private String feature;
        private String trial;
        private String standard;
        private String enterprise;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingFaq {
        private String question;
        private String answer;
    }

    // ─── NEW inner classes ──────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThemeConfig {
        private String primaryColor;     // e.g. "#2563eb"
        private String accentColor;      // e.g. "#f59e0b"
        private String fontFamily;       // e.g. "Inter"
        private boolean darkMode;
        private String logoUrl;          // Uploaded via file upload endpoint
        private String faviconUrl;
        private String navbarStyle;      // "solid" | "transparent" | "gradient"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NavItem {
        private String label;
        private String href;
        private String icon;
        private boolean enabled;
        private List<NavItem> children;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FooterConfig {
        private List<FooterLink> productLinks;
        private List<FooterLink> companyLinks;
        private List<FooterLink> supportLinks;
        private List<FooterLink> legalLinks;
        private List<TrustBadge> trustBadges;
        private boolean showSocials;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FooterLink {
        private String label;
        private String href;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeroConfig {
        private String headline;
        private String subheadline;
        private String ctaPrimaryText;
        private String ctaPrimaryHref;
        private String ctaSecondaryText;
        private String ctaSecondaryHref;
        private String badgeText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HomeSection {
        private String type;       // "stats" | "trustBadges" | "products" | "categories" | "testimonials" | "cta"
        private boolean enabled;
        private int order;
        private String title;
        private String subtitle;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AboutPageConfig {
        private String heroTitle;
        private String heroDescription;
        private String missionTitle;
        private String missionContent;
        private boolean showTeam;
        private boolean showStats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponConfig {
        private String code;
        private int discountPercent;
        private double discountFixed;
        private String validUntil;
        private List<String> productIds;
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnouncementBar {
        private String text;
        private String link;
        private boolean enabled;
        private String bgColor;
        private String textColor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeoDefaults {
        private String titleTemplate;        // e.g. "{page} — {siteName}"
        private String defaultOgImage;
        private String robotsTxt;
        private String googleVerification;
    }
}
