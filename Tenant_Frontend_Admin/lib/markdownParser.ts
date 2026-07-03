/**
 * markdownParser.ts
 *
 * Client-side Markdown → HTML parser for admin live preview.
 * Mirrors and extends the storefront's parseMarkdownToHtml() in src/lib/utils.ts.
 *
 * Supported syntax:
 *   # / ## / ###   — Headings
 *   **bold**        — Bold
 *   *italic*        — Italic
 *   ~~strike~~      — Strikethrough
 *   [text](url)     — Link
 *   ![alt](url)     — Image
 *   - / * item      — Unordered list
 *   1. item         — Ordered list
 *   > text          — Blockquote
 *   `code`          — Inline code
 *   ```lang         — Fenced code block
 *   ---             — Horizontal rule
 *   Raw HTML is passed through unchanged.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function processInline(text: string): string {
  // Inline code (before bold/italic to avoid conflicts)
  text = text.replace(/`([^`]+)`/g, '<code class="bg-zinc-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>');
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic (both * and _)
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
  // Strikethrough
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  // Image (before link so it doesn't match)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 mx-auto max-w-full" />');
  // Link
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) return "";

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

    // === Fenced code block toggle ===
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        html += `<pre class="bg-zinc-900 dark:bg-zinc-950 text-emerald-400 text-sm font-mono rounded-xl p-4 my-4 overflow-x-auto whitespace-pre-wrap"><code>${escapeHtml(codeContent.replace(/\n$/, ""))}</code></pre>`;
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

    // === Horizontal rule ===
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeListIfOpen();
      closeBlockquoteIfOpen();
      html += '<hr class="my-6 border-0 border-t border-zinc-200 dark:border-zinc-700" />';
      continue;
    }

    // === Empty line ===
    if (!trimmed) {
      closeListIfOpen();
      closeBlockquoteIfOpen();
      continue;
    }

    // === Raw HTML pass-through ===
    if (/^<[a-zA-Z]/.test(trimmed)) {
      closeListIfOpen();
      closeBlockquoteIfOpen();
      html += rawLine;
      continue;
    }

    // === Blockquote ===
    if (trimmed.startsWith("> ")) {
      closeListIfOpen();
      const content = processInline(trimmed.substring(2));
      if (!inBlockquote) {
        html += '<blockquote class="border-l-4 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 my-3 rounded-r-lg">';
        inBlockquote = true;
      }
      html += `<p class="text-sm leading-relaxed">${content}</p>`;
      continue;
    } else {
      closeBlockquoteIfOpen();
    }

    // === Headings ===
    if (trimmed.startsWith("#### ")) {
      closeListIfOpen();
      html += `<h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-5 mb-2">${processInline(trimmed.substring(5))}</h4>`;
    } else if (trimmed.startsWith("### ")) {
      closeListIfOpen();
      html += `<h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">${processInline(trimmed.substring(4))}</h3>`;
    } else if (trimmed.startsWith("## ")) {
      closeListIfOpen();
      html += `<h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">${processInline(trimmed.substring(3))}</h2>`;
    } else if (trimmed.startsWith("# ")) {
      closeListIfOpen();
      html += `<h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-10 mb-6">${processInline(trimmed.substring(2))}</h1>`;
    }
    // === Unordered list ===
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        closeListIfOpen();
        html += '<ul class="list-disc list-inside space-y-1.5 my-3 pl-4 text-zinc-700 dark:text-zinc-300">';
        inList = true;
        listType = "ul";
      }
      html += `<li>${processInline(trimmed.substring(2))}</li>`;
    }
    // === Ordered list ===
    else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+/);
      const text = trimmed.substring(match![0].length);
      if (!inList || listType !== "ol") {
        closeListIfOpen();
        html += '<ol class="list-decimal list-inside space-y-1.5 my-3 pl-4 text-zinc-700 dark:text-zinc-300">';
        inList = true;
        listType = "ol";
      }
      html += `<li>${processInline(text)}</li>`;
    }
    // === Paragraph ===
    else {
      closeListIfOpen();
      html += `<p class="my-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">${processInline(trimmed)}</p>`;
    }
  }

  closeListIfOpen();
  closeBlockquoteIfOpen();

  if (inCodeBlock && codeContent) {
    html += `<pre class="bg-zinc-900 dark:bg-zinc-950 text-emerald-400 text-sm font-mono rounded-xl p-4 my-4 overflow-x-auto whitespace-pre-wrap"><code>${escapeHtml(codeContent)}</code></pre>`;
  }

  return html;
}

/** Estimate reading time in minutes */
export function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
