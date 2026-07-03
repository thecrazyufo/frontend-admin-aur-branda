"use client";

import { useState, useRef, useCallback, useEffect } from"react";
import { parseMarkdownToHtml, estimateReadTime } from"@/lib/markdownParser";
import { API_BASE } from"@/services/api";
import { cn } from"@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type EditorMode ="write" |"preview" |"split";

interface MarkdownEditorProps {
 id?: string;
 value: string;
 onChange: (val: string) => void;
 rows?: number;
 placeholder?: string;
 /** Compact mode: smaller toolbar, reduced padding */
 compact?: boolean;
 required?: boolean;
 className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar button definition
// ─────────────────────────────────────────────────────────────────────────────

interface ToolbarAction {
 label: string;
 title: string;
 prefix: string;
 suffix: string;
 block?: boolean; // wraps the entire line
 placeholder?: string;
 shortcut?: string;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
 { label:"H1", title:"Heading 1", prefix:"#", suffix:"", block: true, placeholder:"Heading" },
 { label:"H2", title:"Heading 2", prefix:"##", suffix:"", block: true, placeholder:"Heading" },
 { label:"H3", title:"Heading 3", prefix:"###", suffix:"", block: true, placeholder:"Heading" },
 { label:"B", title:"Bold (Ctrl+B)", prefix:"**", suffix:"**", placeholder:"bold text", shortcut:"b" },
 { label:"I", title:"Italic (Ctrl+I)", prefix:"*", suffix:"*", placeholder:"italic text", shortcut:"i" },
 { label:"S̶", title:"Strikethrough", prefix:"~~", suffix:"~~", placeholder:"strikethrough" },
 { label:"»", title:"Blockquote", prefix:">", suffix:"", block: true, placeholder:"quote" },
 { label:"{ }", title:"Inline Code (Ctrl+`)", prefix:"`", suffix:"`", placeholder:"code", shortcut:"`" },
 { label:"• List", title:"Bullet List", prefix:"-", suffix:"", block: true, placeholder:"item" },
 { label:"1. List", title:"Numbered List", prefix:"1.", suffix:"", block: true, placeholder:"item" },
 { label:"🔗", title:"Link", prefix:"[", suffix:"](url)", placeholder:"link text" },
 { label:"—", title:"Horizontal Rule", prefix:"\n---\n", suffix:"", block: true, placeholder:"" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MarkdownEditor({
 id,
 value,
 onChange,
 rows = 10,
 placeholder ="Write in Markdown… \n\n# Heading\n**bold**, *italic*,`code`\n- bullet list\n1. numbered list\n> blockquote",
 compact = false,
 required = false,
 className,
}: MarkdownEditorProps) {
 const [mode, setMode] = useState<EditorMode>("write");
 const [uploading, setUploading] = useState(false);
 const textareaRef = useRef<HTMLTextAreaElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
 const charCount = value.length;
 const readTime = estimateReadTime(value);

 // ── Insert formatting around selection ────────────────────────────────────
 const insertFormatting = useCallback((action: ToolbarAction) => {
 const ta = textareaRef.current;
 if (!ta) return;
 const start = ta.selectionStart;
 const end = ta.selectionEnd;
 const before = value.substring(0, start);
 const selected = value.substring(start, end);
 const after = value.substring(end);

 let newText: string;
 let cursorStart: number;
 let cursorEnd: number;

 if (action.block) {
 // For block-level items, prefix each line
 if (selected) {
 const lines = selected.split("\n");
 const prefixed = lines.map(l => action.prefix + l).join("\n");
 newText = before + prefixed + after;
 cursorStart = start;
 cursorEnd = start + prefixed.length;
 } else {
 const insert = action.prefix + (action.placeholder ||"");
 newText = before + insert + after;
 cursorStart = start + action.prefix.length;
 cursorEnd = start + insert.length;
 }
 } else {
 const content = selected || action.placeholder ||"";
 const insert = action.prefix + content + action.suffix;
 newText = before + insert + after;
 cursorStart = start + action.prefix.length;
 cursorEnd = cursorStart + content.length;
 }

 onChange(newText);
 setTimeout(() => {
 ta.focus();
 ta.setSelectionRange(cursorStart, cursorEnd);
 }, 10);
 }, [value, onChange]);

 // ── Keyboard shortcuts ────────────────────────────────────────────────────
 const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
 const ctrl = e.ctrlKey || e.metaKey;
 if (ctrl) {
 const action = TOOLBAR_ACTIONS.find(a => a.shortcut === e.key);
 if (action) {
 e.preventDefault();
 insertFormatting(action);
 return;
 }
 }
 // Tab → insert 2 spaces
 if (e.key ==="Tab") {
 e.preventDefault();
 const ta = textareaRef.current!;
 const start = ta.selectionStart;
 const end = ta.selectionEnd;
 const newVal = value.substring(0, start) +"" + value.substring(end);
 onChange(newVal);
 setTimeout(() => {
 ta.setSelectionRange(start + 2, start + 2);
 }, 10);
 }
 }, [insertFormatting, onChange, value]);

 // ── Image upload ──────────────────────────────────────────────────────────
 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 try {
 setUploading(true);
 const token = localStorage.getItem("admin_jwt");
 const formData = new FormData();
 formData.append("file", file);
 const res = await fetch(`${API_BASE}/upload`, {
 method:"POST",
 headers: token ? { Authorization:`Bearer ${token}` } : {},
 body: formData,
 });
 if (!res.ok) throw new Error("Upload failed");
 const data = await res.json();
 const ta = textareaRef.current;
 const imgMd =`![${file.name}](${data.url})`;
 if (ta) {
 const pos = ta.selectionStart;
 const newVal = value.substring(0, pos) + imgMd + value.substring(pos);
 onChange(newVal);
 setTimeout(() => ta.focus(), 10);
 }
 } catch {
 alert("Image upload failed");
 } finally {
 setUploading(false);
 if (fileInputRef.current) fileInputRef.current.value ="";
 }
 };

 const previewHtml = parseMarkdownToHtml(value);

 const textareaClasses = cn(
"w-full resize-none bg-transparent outline-none text-sm font-mono leading-relaxed",
"text-zinc-800 placeholder-zinc-400",
 compact ?"px-3 py-2" :"px-4 py-3"
 );

 const btnBase = cn(
"px-2 py-0.5 rounded text-xs font-semibold transition-colors border-0 bg-transparent cursor-pointer",
"text-zinc-500 hover:text-foreground hover:bg-zinc-200"
 );

 const modeBtn = (m: EditorMode, label: string) => (
 <button
 type="button"
 onClick={() => setMode(m)}
 className={cn(
"px-2.5 py-1 text-[11px] font-semibold rounded-md border-0 cursor-pointer transition-colors",
 mode === m
 ?"bg-white shadow-sm text-foreground"
 :"bg-transparent text-zinc-500 hover:text-zinc-700"
 )}
 >
 {label}
 </button>
 );

 return (
 <div className={cn("flex flex-col rounded-xl border border-border overflow-hidden bg-card shadow-sm", className)}>

 {/* ── Top bar: Toolbar + Mode switcher ─────────────────────────────── */}
 <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-card shrink-0">

 {/* Formatting buttons */}
 <div className="flex flex-wrap items-center gap-0.5 flex-1 min-w-0">
 {/* Heading group */}
 <div className="flex items-center gap-0 border-r border-border pr-1.5 mr-1">
 {TOOLBAR_ACTIONS.slice(0, 3).map(a => (
 <button key={a.label} type="button" title={a.title} className={btnBase} onClick={() => insertFormatting(a)}>
 {a.label}
 </button>
 ))}
 </div>
 {/* Inline format group */}
 <div className="flex items-center gap-0 border-r border-border pr-1.5 mr-1">
 {TOOLBAR_ACTIONS.slice(3, 8).map(a => (
 <button key={a.label} type="button" title={a.title} className={cn(btnBase, a.label ==="B" &&"font-black", a.label ==="I" &&"italic")} onClick={() => insertFormatting(a)}>
 {a.label}
 </button>
 ))}
 </div>
 {/* List + link group */}
 <div className="flex items-center gap-0 border-r border-border pr-1.5 mr-1">
 {TOOLBAR_ACTIONS.slice(8, 12).map(a => (
 <button key={a.label} type="button" title={a.title} className={btnBase} onClick={() => insertFormatting(a)}>
 {a.label}
 </button>
 ))}
 </div>
 {/* Image upload */}
 <label
 className={cn(btnBase,"cursor-pointer")}
 title="Insert image"
 >
 {uploading ?"⏳" :"🖼️"}
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={handleImageUpload}
 disabled={uploading}
 />
 </label>
 </div>

 {/* Mode switcher */}
 <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-lg shrink-0">
 {modeBtn("write","✍️ Write")}
 {modeBtn("split","⚡ Split")}
 {modeBtn("preview","👁️ Preview")}
 </div>
 </div>

 {/* ── Editor + Preview panes ────────────────────────────────────────── */}
 <div className={cn("flex overflow-hidden", mode ==="split" ?"divide-x divide-zinc-200" :"")}>

 {/* Write pane */}
 {(mode ==="write" || mode ==="split") && (
 <textarea
 ref={textareaRef}
 id={id}
 value={value}
 onChange={e => onChange(e.target.value)}
 onKeyDown={handleKeyDown}
 rows={rows}
 required={required}
 placeholder={placeholder}
 spellCheck
 className={cn(textareaClasses, mode ==="split" ?"w-1/2" :"w-full")}
 style={{ minHeight: compact ?`${rows * 24}px` :`${rows * 26}px` }}
 />
 )}

 {/* Preview pane */}
 {(mode ==="preview" || mode ==="split") && (
 <div
 className={cn(
"overflow-y-auto prose-sm max-w-none",
 compact ?"px-3 py-2" :"px-5 py-4",
 mode ==="split" ?"w-1/2" :"w-full"
 )}
 style={{ minHeight: compact ?`${rows * 24}px` :`${rows * 26}px` }}
 >
 {previewHtml ? (
 <div
 className="text-sm leading-relaxed"
 dangerouslySetInnerHTML={{ __html: previewHtml }}
 />
 ) : (
 <p className="text-zinc-400 text-xs italic mt-2">
 Preview will appear here as you type…
 </p>
 )}
 </div>
 )}
 </div>

 {/* ── Footer: Stats + Hint ─────────────────────────────────────────── */}
 <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card shrink-0">
 <span className="text-[10px] text-zinc-400 font-mono">
 {charCount} chars · {wordCount} words{wordCount > 20 ?` · ~${readTime} min read` :""}
 </span>
 <span className="text-[10px] text-zinc-400">
 Markdown supported · <span className="text-blue-500">**bold**</span> · <span className="italic">*italic*</span> · ## Heading
 </span>
 </div>
 </div>
 );
}
