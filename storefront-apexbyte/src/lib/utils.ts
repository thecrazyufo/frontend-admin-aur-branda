import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function generateStars(rating: number): string {
  return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "");
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  const lines = markdown.trim().split("\n");
  let html = "";
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  const closeListIfOpen = () => {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      closeListIfOpen();
      continue;
    }

    // Process inline markdown tags: bold and links
    line = line
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>'); // Link

    // Headings
    if (line.startsWith("### ")) {
      closeListIfOpen();
      html += `<h3 class="text-lg font-bold text-gray-900 mt-6 mb-3">${line.substring(4)}</h3>`;
    } else if (line.startsWith("## ")) {
      closeListIfOpen();
      html += `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">${line.substring(3)}</h2>`;
    } else if (line.startsWith("# ")) {
      closeListIfOpen();
      html += `<h1 class="text-2xl font-bold text-gray-900 mt-10 mb-6">${line.substring(2)}</h1>`;
    } 
    // Unordered List Items
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        closeListIfOpen();
        html += '<ul class="list-disc list-inside space-y-1.5 my-3 pl-4 text-gray-700">';
        inList = true;
        listType = "ul";
      }
      html += `<li>${line.substring(2)}</li>`;
    } 
    // Ordered List Items
    else if (/^\d+\.\s+/.test(line)) {
      const match = line.match(/^(\d+)\.\s+/);
      const text = line.substring(match![0].length);
      if (!inList || listType !== "ol") {
        closeListIfOpen();
        html += '<ol class="list-decimal list-inside space-y-1.5 my-3 pl-4 text-gray-700">';
        inList = true;
        listType = "ol";
      }
      html += `<li>${text}</li>`;
    } 
    // Standard Paragraphs
    else {
      closeListIfOpen();
      html += `<p class="my-3 text-gray-700 leading-relaxed">${line}</p>`;
    }
  }

  closeListIfOpen();
  return html;
}
