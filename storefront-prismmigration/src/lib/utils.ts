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


function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function processInline(text: string): string {
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>');
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
  // Strikethrough
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  // Image (before link)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 mx-auto max-w-full" />');
  // Link
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split("\n");
  let html = "";
  let inList = false;
  let listType: "ul" | "ol" | null = null;
  let inCodeBlock = false;
  let codeContent = "";
  let inBlockquote = false;

  const closeListIfOpen = () => {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
      listType = null;
    }
  };

  const closeBlockquoteIfOpen = () => {
    if (inBlockquote) {
      html += "</blockquote>";
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Fenced code block toggle
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        html += `<pre class="bg-gray-900 text-emerald-400 text-sm font-mono rounded-xl p-4 my-4 overflow-x-auto whitespace-pre-wrap"><code>${escapeHtml(codeContent.replace(/\n$/, ""))}</code></pre>`;
        codeContent = "";
        inCodeBlock = false;
      } else {
        closeListIfOpen();
        closeBlockquoteIfOpen();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += rawLine + "\n";
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeListIfOpen();
      closeBlockquoteIfOpen();
      html += '<hr class="my-6 border-0 border-t border-stone-850" />';
      continue;
    }

    // Empty line
    if (!trimmed) {
      closeListIfOpen();
      closeBlockquoteIfOpen();
      continue;
    }

    // Raw HTML passthrough
    if (/^<[a-zA-Z]/.test(trimmed)) {
      closeListIfOpen();
      closeBlockquoteIfOpen();
      html += rawLine;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      closeListIfOpen();
      const content = processInline(trimmed.substring(2));
      if (!inBlockquote) {
        html += '<blockquote class="border-l-4 border-[#EAB308] bg-[#EAB308]/5 px-4 py-2 my-3 rounded-r-lg">';
        inBlockquote = true;
      }
      html += `<p class="text-sm leading-relaxed text-stone-300">${content}</p>`;
      continue;
    } else {
      closeBlockquoteIfOpen();
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      closeListIfOpen();
      html += `<h4 class="text-base font-bold text-white mt-5 mb-2">${processInline(trimmed.substring(5))}</h4>`;
    } else if (trimmed.startsWith("### ")) {
      closeListIfOpen();
      html += `<h3 class="text-lg font-bold text-white mt-6 mb-3">${processInline(trimmed.substring(4))}</h3>`;
    } else if (trimmed.startsWith("## ")) {
      closeListIfOpen();
      html += `<h2 class="text-xl font-bold text-white mt-8 mb-4">${processInline(trimmed.substring(3))}</h2>`;
    } else if (trimmed.startsWith("# ")) {
      closeListIfOpen();
      html += `<h1 class="text-2xl font-bold text-white mt-10 mb-6">${processInline(trimmed.substring(2))}</h1>`;
    }
    // Unordered list
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        closeListIfOpen();
        html += '<ul class="list-disc list-inside space-y-1.5 my-3 pl-4 text-stone-300">';
        inList = true;
        listType = "ul";
      }
      html += `<li>${processInline(trimmed.substring(2))}</li>`;
    }
    // Ordered list
    else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+/);
      const text = trimmed.substring(match![0].length);
      if (!inList || listType !== "ol") {
        closeListIfOpen();
        html += '<ol class="list-decimal list-inside space-y-1.5 my-3 pl-4 text-stone-300">';
        inList = true;
        listType = "ol";
      }
      html += `<li>${processInline(text)}</li>`;
    }
    // Paragraph
    else {
      closeListIfOpen();
      html += `<p class="my-3 text-stone-300 leading-relaxed">${processInline(trimmed)}</p>`;
    }
  }

  closeListIfOpen();
  closeBlockquoteIfOpen();

  if (inCodeBlock && codeContent) {
    html += `<pre class="bg-stone-950 text-emerald-400 text-sm font-mono rounded-xl p-4 my-4 overflow-x-auto whitespace-pre-wrap border border-stone-900"><code>${escapeHtml(codeContent)}</code></pre>`;
  }

  return html;
}
