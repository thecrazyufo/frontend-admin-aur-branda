import { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  path?: string;
  noIndex?: boolean;
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  ogImage,
  path = "",
  noIndex = false,
}: SEOProps): Metadata {
  const url = `${siteConfig.url}${path}`;
  const image = ogImage || siteConfig.ogImage;

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: siteConfig.name }],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@datamigratepro",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Windows",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "USD",
      availability: "https://schema.org/InStock",
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export function generateBreadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${siteConfig.url}${item.href}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
