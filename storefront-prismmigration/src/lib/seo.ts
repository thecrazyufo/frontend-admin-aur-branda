
/** Strip markdown syntax from a string, returning plain text for use in JSON-LD schema */
function stripMarkdown(md: string | undefined | null): string {
  if (!md) return "";
  return md
    .replace(/```[\s\S]*?```/g, "")            // remove fenced code blocks
    .replace(/`([^`]+)`/g, "$1")               // inline code -> plain
    .replace(/\*\*([^*]+)\*\*/g, "$1")         // bold -> plain
    .replace(/\*([^*]+)\*/g, "$1")             // italic * -> plain
    .replace(/_([^_]+)_/g, "$1")               // italic _ -> plain
    .replace(/~~([^~]+)~~/g, "$1")             // strikethrough -> plain
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")  // images -> alt text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // links -> link text
    .replace(/^#{1,6}\s+/gm, "")               // headings -> plain
    .replace(/^[-*>]\s+/gm, "")                // list/blockquote markers
    .replace(/^\d+\.\s+/gm, "")               // numbered list markers
    .replace(/^---+$/gm, "")                   // horizontal rules
    .replace(/\n{2,}/g, " ")                   // multiple newlines -> space
    .replace(/\n/g, " ")
    .trim();
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
  operatingSystems?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: stripMarkdown(product.description || ""),
    ...(product.image && { image: product.image }),
    url: product.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: product.operatingSystems?.join(", ") || "Windows",
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

export function generateBreadcrumbSchema(
  items: { label: string; href: string }[],
  siteUrl: string = ""
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${siteUrl}${item.href}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdown(faq.answer), // stripped of markdown for clean JSON-LD
      },
    })),
  };
}

export function generateArticleSchema(post: {
  title: string;
  description: string;
  authorName: string;
  publishedAt: string;
  modifiedAt?: string;
  url: string;
  image?: string;
  siteName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: post.siteName || "",
    },
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt || post.publishedAt,
    url: post.url,
    ...(post.image && { image: post.image }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.url,
    },
  };
}

export function generateOrganizationSchema(org: {
  name: string;
  url: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  logo?: string;
  socials?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.url,
    ...(org.email && { email: org.email }),
    ...(org.phone && { telephone: org.phone }),
    ...(org.description && { description: org.description }),
    ...(org.logo && { logo: org.logo }),
    ...(org.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: org.address,
      },
    }),
    ...(org.socials?.length && { sameAs: org.socials }),
  };
}
