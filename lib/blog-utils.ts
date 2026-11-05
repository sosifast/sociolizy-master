/**
 * Utility functions for Blog & Articles
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace non-alphanumeric chars (preserving basic Latin)
    .replace(/[^\w\s-]/g, "")
    // Replace spaces and underscores with hyphens
    .replace(/[\s_-]+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate reading time in minutes based on content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // Remove markdown tags/syntax roughly
  const cleanText = content.replace(/[#*`_~\[\]()>-]/g, " ");
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}

/**
 * Format date for Indonesian / international readers
 */
export function formatBlogDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Strip markdown to plain text for snippets and meta descriptions
 */
export function stripMarkdown(markdown: string, maxLength = 160): string {
  if (!markdown) return "";
  let text = markdown
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // link text only
    .replace(/#{1,6}\s+/g, "") // headings
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // inline code & code blocks
    .replace(/^\s*>+\s+/gm, "") // blockquotes
    .replace(/^\s*[-*+]\s+/gm, "") // unordered lists
    .replace(/^\s*\d+\.\s+/gm, "") // ordered lists
    .replace(/\n+/g, " ") // newlines to space
    .trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength).trim() + "...";
  }
  return text;
}

/**
 * Available category badge colors and their Tailwind classes
 */
export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; ring: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-500/20",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    ring: "ring-purple-500/20",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-500/20",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    ring: "ring-rose-500/20",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    ring: "ring-cyan-500/20",
  },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    ring: "ring-slate-500/20",
  },
};

export function getCategoryBadgeClass(colorKey?: string | null): string {
  const color = CATEGORY_COLORS[colorKey || "emerald"] || CATEGORY_COLORS.emerald;
  return `${color.bg} ${color.text} ${color.border} border`;
}

