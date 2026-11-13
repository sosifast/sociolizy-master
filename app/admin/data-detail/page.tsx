"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Settings,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

interface DataDetailItem {
  id: number;
  id_category: number;
  conteks: string;
  create_at: string;
  update_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    platform?: {
      id: number;
      name: string;
    };
  };
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export default function DataDetailPage() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [items, setItems] = useState<DataDetailItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search input with 300ms debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Preview
  const [previewItem, setPreviewItem] = useState<DataDetailItem | null>(null);

  // Modal Delete
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    categoryName?: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    isDeleting: false,
  });

  // Modal Generate Gemini AI
  const [generateModal, setGenerateModal] = useState<{
    isOpen: boolean;
    dataDetailId: number | null;
    categoryId: number | null;
    categoryName: string;
    conteks: string;
    hasTitleTag: boolean;
    hasApiKey: boolean;
    totalServices: number;
    emptyDescServices: number;
    overwrite: boolean;
    limit: number;
    isLoadingStats: boolean;
    isGenerating: boolean;
    previewDesc: string | null;
    previewServiceName: string | null;
    results: Array<{ id: number; service_name: string; desc: string }> | null;
    error: string | null;
  }>({
    isOpen: false,
    dataDetailId: null,
    categoryId: null,
    categoryName: "",
    conteks: "",
    hasTitleTag: false,
    hasApiKey: true,
    totalServices: 0,
    emptyDescServices: 0,
    overwrite: false,
    limit: 10,
    isLoadingStats: false,
    isGenerating: false,
    previewDesc: null,
    previewServiceName: null,
    results: null,
    error: null,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (search.trim()) params.append("search", search.trim());
        if (selectedCategory !== "all") params.append("id_category", selectedCategory);

        const res = await fetch(`/api/admin/data-detail?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          setItems(json.data || []);
          setTotalPages(json.pagination?.totalPages || 1);
          setTotalCount(json.pagination?.total || 0);
        } else {
          toastRef.current.error("Failed to Load", json.message || "Failed to load data details");
        }
      } catch (err) {
        console.error(err);
        toastRef.current.error("Network Error", "Unable to connect to server");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, search, selectedCategory]
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/data-detail/${deleteModal.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Deleted", "Data detail deleted successfully.");
        setDeleteModal({ isOpen: false, id: null, isDeleting: false });
        fetchData(true);
      } else {
        toast.error("Failed to Delete", json.message || "Failed to delete data detail");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", "An error occurred while deleting data");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Open Generate Modal
  const handleOpenGenerate = async (item?: DataDetailItem | null) => {
    const targetItem = item || (items.length > 0 ? items[0] : null);

    if (!targetItem) {
      toast.error("Notice", "No data details found. Please create a data detail first.");
      return;
    }

    const hasTitle =
      targetItem.conteks.includes("{title}") ||
      targetItem.conteks.includes("{judul}") ||
      targetItem.conteks.includes("{TITLE}");

    setGenerateModal({
      isOpen: true,
      dataDetailId: targetItem.id,
      categoryId: targetItem.id_category,
      categoryName: targetItem.category?.name || "Category",
      conteks: targetItem.conteks,
      hasTitleTag: hasTitle,
      hasApiKey: true,
      totalServices: 0,
      emptyDescServices: 0,
      overwrite: false,
      limit: 10,
      isLoadingStats: true,
      isGenerating: false,
      previewDesc: null,
      previewServiceName: null,
      results: null,
      error: null,
    });

    try {
      const res = await fetch(`/api/admin/data-detail/generate?data_detail_id=${targetItem.id}`);
      const json = await res.json();
      if (json.success) {
        setGenerateModal((prev) => ({
          ...prev,
          isLoadingStats: false,
          hasApiKey: json.hasApiKey ?? true,
          totalServices: json.totalServices ?? 0,
          emptyDescServices: json.emptyDescServices ?? 0,
        }));
      } else {
        setGenerateModal((prev) => ({
          ...prev,
          isLoadingStats: false,
          error: json.message,
        }));
      }
    } catch (err) {
      console.error(err);
      setGenerateModal((prev) => ({
        ...prev,
        isLoadingStats: false,
      }));
    }
  };

  // Run Generate with Gemini AI
  const handleRunGenerate = async (previewOnly = false) => {
    if (!generateModal.dataDetailId) return;

    setGenerateModal((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      const res = await fetch("/api/admin/data-detail/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data_detail_id: generateModal.dataDetailId,
          id_category: generateModal.categoryId,
          overwrite: generateModal.overwrite,
          limit: generateModal.limit,
          preview_only: previewOnly,
        }),
      });

      const json = await res.json();

      if (json.success) {
        if (previewOnly) {
          const sample = json.updatedServices?.[0];
          setGenerateModal((prev) => ({
            ...prev,
            isGenerating: false,
            previewDesc: sample?.desc || "Unable to generate preview",
            previewServiceName: sample?.service_name || "Sample Service",
          }));
          toast.success("Preview Ready", "Sample AI description generated in English.");
        } else {
          setGenerateModal((prev) => ({
            ...prev,
            isGenerating: false,
            results: json.updatedServices || [],
            emptyDescServices: Math.max(0, prev.emptyDescServices - (json.count || 0)),
          }));
          toast.success(
            "Generation Complete",
            `Successfully generated descriptions for ${json.count || 0} services.`
          );
        }
      } else {
        setGenerateModal((prev) => ({
          ...prev,
          isGenerating: false,
          error: json.message || "Failed to process description generation",
        }));
        toast.error("Generation Failed", json.message || "An error occurred");
      }
    } catch (err) {
      console.error(err);
      setGenerateModal((prev) => ({
        ...prev,
        isGenerating: false,
        error: "Network error when connecting to Gemini AI",
      }));
      toast.error("Network Error", "Unable to connect to server");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Data Detail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                {totalCount} Records
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => handleOpenGenerate(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Generate SMM service descriptions using Gemini AI"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Generate AI Descriptions</span>
          </button>
          <button
            onClick={() => fetchData(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/data-detail/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Data Detail</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search context or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer w-full"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4 w-52">Category</th>
                <th className="py-3 px-4">Context (conteks)</th>
                <th className="py-3 px-4 w-40">Updated At</th>
                <th className="py-3 px-4 w-36 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <span className="text-xs">Loading data details...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs">
                    No data details found. Click <strong>Add Data Detail</strong> to create one.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const hasTitle =
                    item.conteks.includes("{title}") ||
                    item.conteks.includes("{judul}") ||
                    item.conteks.includes("{TITLE}");

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        #{item.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {item.category?.name || `Category #${item.id_category}`}
                        </div>
                        {item.category?.platform?.name && (
                          <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            {item.category.platform.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="line-clamp-2 text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {item.conteks}
                        </div>
                        {hasTitle && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Supports {"{title}"} Tag</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {new Date(item.update_at).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenGenerate(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Generate Service Descriptions with Gemini AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="View Context Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/data-detail/${item.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit Data Detail"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: item.id,
                                categoryName: item.category?.name,
                                isDeleting: false,
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Data Detail"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Preview Context */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Data Detail Context #{previewItem.id}
                </h3>
                <span className="text-xs font-semibold text-emerald-600">
                  {previewItem.category?.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {previewItem.conteks}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/admin/data-detail/${previewItem.id}/edit`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Edit Context
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generate Gemini AI */}
      {generateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    Generate Service Descriptions (Gemini AI)
                  </h3>
                  <span className="text-xs font-bold text-emerald-700">
                    Category: {generateModal.categoryName}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  setGenerateModal((prev) => ({
                    ...prev,
                    isOpen: false,
                    previewDesc: null,
                    results: null,
                  }))
                }
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning if API Key missing */}
            {!generateModal.hasApiKey && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gemini API Key Required:</span>
                    <p className="mt-0.5 text-amber-700">
                      Please enter your Google Gemini API Key in System Settings before generating descriptions.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/setting"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Open Settings</span>
                </Link>
              </div>
            )}

            {/* Error Message if any */}
            {generateModal.error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generateModal.error}</span>
              </div>
            )}

            {/* Context & Tag Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reference Context Template:
                </span>
                {generateModal.hasTitleTag ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{"{title}"} Tag Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                    Standard Template
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-600 line-clamp-3 bg-white p-2.5 rounded-xl border border-slate-200">
                {generateModal.conteks}
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Total Category Services
                </span>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {generateModal.isLoadingStats ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    `${generateModal.totalServices} Services`
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">
                  Empty Descriptions
                </span>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  {generateModal.isLoadingStats ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    `${generateModal.emptyDescServices} Services`
                  )}
                </div>
              </div>
            </div>

            {/* Generation Options */}
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!generateModal.overwrite}
                  onChange={(e) =>
                    setGenerateModal((prev) => ({
                      ...prev,
                      overwrite: !e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Only populate services with empty descriptions (Recommended)
                </span>
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Batch Processing Limit:
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Number of services processed per batch request
                  </p>
                </div>
                <select
                  value={generateModal.limit}
                  onChange={(e) =>
                    setGenerateModal((prev) => ({
                      ...prev,
                      limit: Number(e.target.value),
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 Services</option>
                  <option value={10}>10 Services</option>
                  <option value={20}>20 Services</option>
                  <option value={50}>50 Services</option>
                </select>
              </div>
            </div>

            {/* Single Service Preview Section */}
            {generateModal.previewDesc && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Gemini AI English Preview: {generateModal.previewServiceName}</span>
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {generateModal.previewDesc}
                </div>
              </div>
            )}

            {/* Finished Results List */}
            {generateModal.results && generateModal.results.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Successfully Generated {generateModal.results.length} Services:
                    </span>
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {generateModal.results.map((res) => (
                    <div
                      key={res.id}
                      className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 font-mono">
                        #{res.id} {res.service_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 line-clamp-2">
                        {res.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={generateModal.isGenerating}
                onClick={() => handleRunGenerate(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {generateModal.isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Preview AI Sample</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setGenerateModal((prev) => ({
                      ...prev,
                      isOpen: false,
                      previewDesc: null,
                      results: null,
                    }))
                  }
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={
                    generateModal.isGenerating ||
                    !generateModal.hasApiKey ||
                    (generateModal.emptyDescServices === 0 && !generateModal.overwrite)
                  }
                  onClick={() => handleRunGenerate(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {generateModal.isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Generating</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Delete Data Detail?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Data detail #{deleteModal.id} ({deleteModal.categoryName || "Category"}) will be permanently removed from the database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={() => setDeleteModal({ isOpen: false, id: null, isDeleting: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
