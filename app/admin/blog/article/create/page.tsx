"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  PenTool,
  Image as ImageIcon,
  Sparkles,
  Heading,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Table,
  Lightbulb,
  Globe,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { generateSlug, calculateReadingTime, stripMarkdown } from "@/lib/blog-utils";
import MarkdownView from "@/app/blog/components/markdown-view";

export default function CreateBlogArticlePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [readingTime, setReadingTime] = useState(3);
  const [authorName, setAuthorName] = useState("Sociolizy Editorial Team");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Editor View Mode
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/admin/blog/category");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setCategoryId(String(json.data[0].id));
          }
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCats();
  }, []);

  // Auto-slug when title changes (unless manually modified)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  // Content change auto-calculates reading time
  const handleContentChange = (val: string) => {
    setContent(val);
    const estTime = calculateReadingTime(val);
    setReadingTime(estTime);
  };

  // Markdown Toolbar helper
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 50);
  };

  const handleSubmit = async (submitStatus: string) => {
    if (!title.trim()) {
      toast.error("Validation Error", "Article title is required.");
      return;
    }

    if (!content.trim()) {
      toast.error("Validation Error", "Article content cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        category_id: categoryId ? Number(categoryId) : null,
        cover_image: coverImage.trim() || null,
        excerpt: excerpt.trim() || stripMarkdown(content, 180),
        content: content.trim(),
        reading_time: readingTime,
        author_name: authorName.trim(),
        tags: tags.trim() || null,
        status: submitStatus,
        is_featured: isFeatured,
        meta_title: metaTitle.trim() || title.trim(),
        meta_description: metaDescription.trim() || excerpt.trim() || stripMarkdown(content, 160),
      };

      const res = await fetch("/api/admin/blog/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.setFlash(
          "Article Created",
          `Article "${title}" has been saved successfully.`
        );
        router.push("/admin/blog");
      } else {
        toast.error("Failed to Save", json.message || "An error occurred.");
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", "Unable to connect to the server.");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          href="/admin/blog"
          className="hover:text-emerald-600 transition-colors"
        >
          Blog Articles
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">New Article</span>
      </nav>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create New Article
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit("DRAFT")}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit("PUBLISHED")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Publish Now</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. How to Skyrocket Instagram Engagement Organically in 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 text-sm sm:text-base font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setIsSlugManual(!isSlugManual)}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  {isSlugManual ? "Auto from title" : "Customize manually"}
                </button>
              </div>
              <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs">
                <span className="text-slate-400 font-mono">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  readOnly={!isSlugManual}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setSlug(generateSlug(e.target.value));
                  }}
                  className={`w-full bg-transparent font-mono text-slate-800 focus:outline-hidden ${
                    !isSlugManual ? "cursor-default text-slate-600" : ""
                  }`}
                  placeholder="article-slug"
                />
              </div>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Editor Nav Header */}
            <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
              {/* Tab Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-200/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "write"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Editor (Markdown)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "preview"
                      ? "bg-white text-emerald-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>

              {/* Formatting Toolbar */}
              {activeTab === "write" && (
                <div className="flex items-center flex-wrap gap-1 text-slate-600">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("## ", "\n", "Section Heading H2")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Heading 2"
                  >
                    <Heading className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("**", "**", "bold text")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("*", "*", "italic text")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertMarkdown("- ", "\n", "List item")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("1. ", "\n", "Step item")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("> ", "\n", "Important takeaway or quote")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("> [!TIP]\n> ", "\n", "Helpful tip for readers")}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                    title="Callout Tip Box"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertMarkdown("[", "](https://sociolizy.com)", "Link Text")}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Insert Link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("```json\n", "\n```", '{\n  "service": "Instagram Followers"\n}')}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Code Block"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertMarkdown(
                        "| Column 1 | Column 2 |\n| :--- | :--- |\n| Item A | Item B |\n"
                      )
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                    title="Table"
                  >
                    <Table className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Editor Body */}
            {activeTab === "write" ? (
              <div className="p-4 sm:p-5">
                <textarea
                  ref={textareaRef}
                  rows={20}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing your article here using Markdown...
Example:
## Introduction
Social media is essential for growth in 2026...

> [!TIP]
> Use high-quality services for best retention.
"
                  className="w-full p-4 text-xs sm:text-sm font-mono leading-relaxed bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                  <span>Supports GitHub Flavored Markdown &amp; Alerts</span>
                  <span>
                    {content.trim() ? content.trim().split(/\s+/).length : 0} words | Est. reading time: {readingTime} min
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 min-h-[400px] bg-white">
                {content.trim() ? (
                  <MarkdownView content={content} />
                ) : (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    No content has been written yet for preview.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEO Search Simulator & Meta Settings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Search Engine Optimization (Google SEO)
              </h2>
            </div>

            {/* Google SERP Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Google Search Result Simulator
              </span>
              <p className="text-xs text-emerald-800 font-mono">
                https://sociolizy.com/blog/{slug || "article-slug"}
              </p>
              <h3 className="text-base font-semibold text-blue-700 hover:underline cursor-pointer line-clamp-1">
                {metaTitle || title || "Article Title - Sociolizy"}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                {metaDescription ||
                  excerpt ||
                  stripMarkdown(content, 155) ||
                  "A concise summary of your article will appear here in Google search engine results."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Meta Title (Recommended 50 - 60 chars)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  placeholder={title || "SEO optimized title"}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Meta Description (Recommended 140 - 160 chars)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder={excerpt || "Concise meta description..."}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls Column (1 col) */}
        <div className="space-y-6">
          {/* Publication Settings Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Status &amp; Publishing
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value="PUBLISHED">Published (Publicly accessible)</option>
                <option value="DRAFT">Draft (Saved privately)</option>
              </select>
            </div>

            {/* Is Featured Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
              <div className="flex items-center gap-2.5">
                <Star className={`w-4 h-4 ${isFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                <div>
                  <p className="text-xs font-bold text-slate-800">Featured Article</p>
                  <p className="text-[11px] text-slate-500">Pin to top hero banner</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Category
                </label>
                <Link
                  href="/admin/blog/category"
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  + Add Category
                </Link>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Author / Team Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Reading Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Estimated Reading Time (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Cover Image
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {coverImage ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    toast.error("Image Load Failed", "Please check the image URL.");
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                <ImageIcon className="w-6 h-6 text-slate-300" />
                <span className="text-[11px]">Image preview will appear here</span>
              </div>
            )}
          </div>

          {/* Summary / Excerpt Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Summary / Excerpt
            </h2>
            <textarea
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence introduction to entice readers..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          {/* Tags Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tags / Keywords
            </h2>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="instagram, followers, reseller, smm"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
            <p className="text-[11px] text-slate-400">
              Separate multiple keywords with commas (,).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
