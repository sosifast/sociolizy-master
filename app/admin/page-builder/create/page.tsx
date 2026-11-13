"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  LayoutTemplate,
  Globe,
  Plus,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { generateSlug } from "@/lib/blog-utils";
import { STARTER_TEMPLATES } from "@/lib/page-builder-types";

export default function CreateCustomPageBuilder() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("landing_promo");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Auto-generate slug when title changes unless manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Required", "Please provide a title for the page.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/page-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          template_id: selectedTemplate,
          status,
          meta_title: metaTitle.trim() || title.trim(),
          meta_description: metaDescription.trim() || description.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success("Page Created", "Redirecting to visual Drag & Drop editor...");
        router.push(`/admin/page-builder/${json.data.id}/edit`);
      } else {
        toast.error("Failed to Create", json.message || "An error occurred.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", "Unable to connect to server.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
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
          href="/admin/page-builder"
          className="hover:text-emerald-600 transition-colors"
        >
          Page Builder
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">Create Page</span>
      </nav>

      {/* 2. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create New Custom Page
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              New
            </span>
          </div>
        </div>

        <Link
          href="/admin/page-builder"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pages</span>
        </Link>
      </div>

      {/* 3. Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Page Details</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Page Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIP Reseller Promotion 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custom Route URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono">
                  https://domain.com/
                </span>
                <input
                  type="text"
                  required
                  placeholder="vip-reseller-promo"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setSlug(generateSlug(e.target.value));
                  }}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-r-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-emerald-700 font-semibold"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This page will be accessible directly at root URL: <code className="text-slate-600 font-bold">/{slug || "slug"}</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Description / Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary displayed on social shares and preview cards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="DRAFT">Draft (Only accessible by admin)</option>
                <option value="PUBLISHED">Published (Immediately live for public)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Template Selector Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <LayoutTemplate className="w-4 h-4" />
            <span>Select Starter Layout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Blank Canvas */}
            <div
              onClick={() => setSelectedTemplate("blank")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTemplate === "blank"
                  ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm text-slate-900">Blank Canvas</span>
                {selectedTemplate === "blank" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start with a clean, empty canvas and add custom blocks one by one.
              </p>
            </div>

            {/* Starter Presets */}
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedTemplate === tmpl.id
                    ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-slate-900">{tmpl.name}</span>
                  {selectedTemplate === tmpl.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{tmpl.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Meta Fields (Collapsible / Optional) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Search Engine Optimization (SEO) &amp; Social Meta</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
              <input
                type="text"
                placeholder={title ? `${title} | Sociolizy` : "Custom title tag for Google..."}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
              <textarea
                rows={2}
                placeholder="Description snippet displayed in Google search results..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/page-builder"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Page...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create &amp; Open Drag-and-Drop Builder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

