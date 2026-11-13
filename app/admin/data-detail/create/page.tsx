"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  platform?: {
    name: string;
  };
}

export default function CreateDataDetailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [idCategory, setIdCategory] = useState("");
  const [conteks, setConteks] = useState("");

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setIdCategory(String(json.data[0].id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCategory) {
      setError("Please select a category first.");
      return;
    }
    if (!conteks.trim()) {
      setError("Context content (conteks) is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/data-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_category: Number(idCategory),
          conteks: conteks.trim(),
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Success", "Data detail created successfully.");
        router.push("/admin/data-detail");
      } else {
        setError(json.message || "Failed to save data detail.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred while saving data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/data-detail"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Add Data Detail
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Category *
          </label>
          {isLoadingCategories ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Loading categories...</span>
            </div>
          ) : (
            <select
              value={idCategory}
              onChange={(e) => setIdCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.platform?.name ? `[${c.platform.name}] ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Context Content (conteks) *
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              You can include {"{title}"} tag
            </span>
          </div>
          <textarea
            rows={12}
            value={conteks}
            onChange={(e) => setConteks(e.target.value)}
            placeholder="Write your reference context here. Use {title} to dynamically insert the service title..."
            required
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:bg-white focus:border-emerald-500 focus:outline-none resize-y leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            href="/admin/data-detail"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || isLoadingCategories}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Data Detail</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
