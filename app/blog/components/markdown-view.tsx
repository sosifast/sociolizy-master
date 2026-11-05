"use client";

import React from "react";
import Image from "next/image";
import { Check, Copy, Info, AlertTriangle, Lightbulb } from "lucide-react";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

/**
 * A robust, safe, dependency-free Markdown renderer tailored for Next.js App Router & Tailwind CSS.
 */
export default function MarkdownView({ content, className = "" }: MarkdownViewProps) {
  const [copiedCodeIndex, setCopiedCodeIndex] = React.useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper to parse inline markdown (bold, italic, code, link)
  const renderInline = (text: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Pattern for inline code, links, images, bold, italic, strikethrough
    const inlineRegex =
      /(`[^`]+`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(__([^_]+)__)|(_([^_]+)_)|(~~([^~]+)~~)|(\[([^\]]+)\]\(([^)]+)\))/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(text.substring(lastIndex, match.index));
      }

      const fullMatch = match[0];

      if (fullMatch.startsWith("`") && fullMatch.endsWith("`")) {
        // Inline code
        nodes.push(
          <code
            key={`code-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded-md bg-slate-100 text-emerald-800 text-xs sm:text-sm font-mono font-medium border border-slate-200"
          >
            {fullMatch.slice(1, -1)}
          </code>
        );
      } else if (fullMatch.startsWith("**") || fullMatch.startsWith("__")) {
        // Bold
        nodes.push(
          <strong key={`b-${keyIdx++}`} className="font-bold text-slate-900">
            {fullMatch.slice(2, -2)}
          </strong>
        );
      } else if (fullMatch.startsWith("*") || fullMatch.startsWith("_")) {
        // Italic
        nodes.push(
          <em key={`i-${keyIdx++}`} className="italic">
            {fullMatch.slice(1, -1)}
          </em>
        );
      } else if (fullMatch.startsWith("~~")) {
        // Strikethrough
        nodes.push(
          <del key={`del-${keyIdx++}`} className="line-through text-slate-400">
            {fullMatch.slice(2, -2)}
          </del>
        );
      } else if (fullMatch.startsWith("[")) {
        // Link [text](url)
        const linkText = match[12];
        const linkUrl = match[13];
        const isExternal = linkUrl.startsWith("http://") || linkUrl.startsWith("https://");
        nodes.push(
          <a
            key={`a-${keyIdx++}`}
            href={linkUrl}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-medium text-emerald-600 hover:text-emerald-700 underline decoration-emerald-300 underline-offset-2 transition-colors"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      nodes.push(text.substring(lastIndex));
    }

    return nodes.length > 0 ? nodes : [text];
  };

  // Block parser
  const renderBlocks = () => {
    if (!content) return null;

    const lines = content.split("\n");
    const blocks: React.ReactNode[] = [];
    let i = 0;
    let blockKey = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Fenced Code Block: ```lang ... ```
      if (line.trim().startsWith("```")) {
        const lang = line.trim().slice(3).trim() || "text";
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        const rawCode = codeLines.join("\n");
        const codeIdx = blockKey;

        blocks.push(
          <div
            key={`block-${blockKey++}`}
            className="relative my-6 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 shadow-md group"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider text-[11px]">{lang}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(rawCode, codeIdx)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors text-[11px]"
              >
                {copiedCodeIndex === codeIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
              <code>{rawCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith("#")) {
        const match = line.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const id = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

          if (level === 1) {
            blocks.push(
              <h1
                id={id}
                key={`block-${blockKey++}`}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4 tracking-tight scroll-mt-20"
              >
                {renderInline(text)}
              </h1>
            );
          } else if (level === 2) {
            blocks.push(
              <h2
                id={id}
                key={`block-${blockKey++}`}
                className="text-xl sm:text-2xl font-bold text-slate-900 mt-7 mb-3 tracking-tight pb-2 border-b border-slate-100 scroll-mt-20"
              >
                {renderInline(text)}
              </h2>
            );
          } else if (level === 3) {
            blocks.push(
              <h3
                id={id}
                key={`block-${blockKey++}`}
                className="text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-2.5 tracking-tight scroll-mt-20"
              >
                {renderInline(text)}
              </h3>
            );
          } else {
            blocks.push(
              <h4
                id={id}
                key={`block-${blockKey++}`}
                className="text-base sm:text-lg font-semibold text-slate-800 mt-5 mb-2 scroll-mt-20"
              >
                {renderInline(text)}
              </h4>
            );
          }
          i++;
          continue;
        }
      }

      // Blockquotes / Callout Box
      if (line.startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith(">")) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        const fullQuote = quoteLines.join("\n").trim();

        // Check if callout like [!TIP], [!NOTE], [!WARNING]
        const isTip = fullQuote.startsWith("[!TIP]");
        const isWarning = fullQuote.startsWith("[!WARNING]") || fullQuote.startsWith("[!CAUTION]");
        const isNote = fullQuote.startsWith("[!NOTE]") || fullQuote.startsWith("[!IMPORTANT]");

        if (isTip || isWarning || isNote) {
          const cleanQuote = fullQuote.replace(/^\[!(TIP|WARNING|CAUTION|NOTE|IMPORTANT)\]\s*/i, "");
          const bgClass = isTip
            ? "bg-emerald-50/90 border-emerald-500 text-emerald-900"
            : isWarning
            ? "bg-amber-50/90 border-amber-500 text-amber-900"
            : "bg-blue-50/90 border-blue-500 text-blue-900";

          const Icon = isTip ? Lightbulb : isWarning ? AlertTriangle : Info;

          blocks.push(
            <div
              key={`block-${blockKey++}`}
              className={`my-5 p-4 rounded-2xl border-l-4 shadow-2xs ${bgClass} flex items-start gap-3`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
              <div className="text-sm leading-relaxed flex-1">
                {renderInline(cleanQuote)}
              </div>
            </div>
          );
        } else {
          blocks.push(
            <blockquote
              key={`block-${blockKey++}`}
              className="my-5 pl-4 border-l-4 border-emerald-500 italic text-slate-700 bg-slate-50/70 py-2.5 pr-4 rounded-r-xl"
            >
              {renderInline(fullQuote)}
            </blockquote>
          );
        }
        continue;
      }

      // Unordered list: - or *
      if (/^\s*[-*+]\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
          i++;
        }
        blocks.push(
          <ul
            key={`block-${blockKey++}`}
            className="my-4 space-y-2 list-disc list-outside pl-6 text-slate-700 leading-relaxed text-sm sm:text-base marker:text-emerald-500"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list: 1. 2. 3.
      if (/^\s*\d+\.\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
          i++;
        }
        blocks.push(
          <ol
            key={`block-${blockKey++}`}
            className="my-4 space-y-2 list-decimal list-outside pl-6 text-slate-700 leading-relaxed text-sm sm:text-base marker:font-semibold marker:text-slate-800"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Image: ![alt](url)
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        blocks.push(
          <figure key={`block-${blockKey++}`} className="my-6">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-xs">
              <img
                src={src}
                alt={alt || "Blog image"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {alt && (
              <figcaption className="text-center text-xs text-slate-500 mt-2 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }

      // Table: lines with pipes | col1 | col2 |
      if (line.includes("|") && lines[i + 1]?.includes("---")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].includes("|")) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (rowStr: string) =>
            rowStr
              .split("|")
              .map((c) => c.trim())
              .filter((c, idx, arr) => (idx === 0 && c === "" ? false : idx === arr.length - 1 && c === "" ? false : true));

          const headers = parseRow(tableLines[0]);
          const rows = tableLines.slice(2).map(parseRow);

          blocks.push(
            <div key={`block-${blockKey++}`} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-4 py-3">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.map((r, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Default: Paragraph
      const paragraphLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].startsWith("#") &&
        !lines[i].startsWith(">") &&
        !lines[i].trim().startsWith("```") &&
        !/^\s*[-*+]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !lines[i].match(/^!\[(.*?)\]\((.*?)\)$/)
      ) {
        paragraphLines.push(lines[i]);
        i++;
      }

      blocks.push(
        <p
          key={`block-${blockKey++}`}
          className="text-slate-700 leading-relaxed text-sm sm:text-base my-3.5"
        >
          {renderInline(paragraphLines.join(" "))}
        </p>
      );
    }

    return blocks;
  };

  return <div className={`blog-content ${className}`}>{renderBlocks()}</div>;
}

