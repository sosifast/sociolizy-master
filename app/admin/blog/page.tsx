"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  BookOpen,
  Plus,
  FolderTree,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Clock,
  Star,
  RefreshCw,
  Loader2,
} from "lucide-react";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import TablePagination from "@/app/admin/components/table-pagination";
import { useToast } from "@/app/admin/components/toast-context";
import { formatBlogDate, getCategoryBadgeClass } from "@/lib/blog-utils";

export default function AdminBlogPage() {
  const { toast } = useToast();

  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & 4x4 Pagination (default 16 items per page = 4 rows x 4 columns)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16); // 4x4 Grid Default
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    title: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    title: "",
    isDeleting: false,
  });

  // Load categories for filter dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/blog/category");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        status: statusFilter,
        category_id: categoryFilter,
        search,
      });

      const res = await fetch(`/api/admin/blog/article?${query.toString()}`);
      const json = await res.json();

      if (json.success) {
        setArticles(json.data || []);
        if (json.pagination) {
          setTotalItems(json.pagination.total);
          setTotalPages(json.pagination.totalPages);
        }
        if (json.stats) {
          setStats(json.stats);
        }
      } else {
        toast.error("Failed to load articles", json.message || "An error occurred.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, categoryFilter, search, toast]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Quick Toggle Featured
  const handleToggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/article/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !currentFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_featured: !currentFeatured } : a))
        );
        toast.success(
          "Featured Status Updated",
          !currentFeatured ? "Article pinned as Featured." : "Featured pin removed."
        );
      }
    } catch (err) {
      toast.error("Error", "Failed to update featured status.");
    }
  };

  // Quick Toggle Status (Publish / Draft)
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/blog/article/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
        );
        if (nextStatus === "PUBLISHED") {
          setStats((prev) => ({
            ...prev,
            published: prev.published + 1,
            draft: Math.max(0, prev.draft - 1),
          }));
        } else {
          setStats((prev) => ({
            ...prev,
            published: Math.max(0, prev.published - 1),
            draft: prev.draft + 1,
          }));
        }
        toast.success(
          "Status Updated",
          nextStatus === "PUBLISHED"
            ? "Article has been published."
            : "Article changed to draft."
        );
      }
    } catch (err) {
      toast.error("Error", "Failed to toggle publication status.");
    }
  };

  // Delete Article Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/blog/article/${deleteModal.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          "Article Deleted",
          `Article "${deleteModal.title}" was successfully deleted.`
        );
        setArticles((prev) => prev.filter((a) => a.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, title: "", isDeleting: false });
        fetchArticles();
      } else {
        toast.error("Failed to Delete", json.message || "Failed to delete article.");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      toast.error("Network Error", "An error occurred while deleting.");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
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
        <span className="text-slate-900 font-bold">Blog Articles</span>
      </nav>

      {/* 2. Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Blog Articles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {totalItems} Posts
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/blog/category"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FolderTree className="w-4 h-4 text-slate-500" />
            <span>Categories</span>
          </Link>
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 transition-colors"
            title="Open live public blog in new tab"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>View Public Blog</span>
          </Link>
          <Link
            href="/admin/blog/article/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, slug, or keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Items Per Page (4x4 Grid Selector) */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium"
            title="Grid card limit per page"
          >
            <option value={16}>16 per page (4x4)</option>
            <option value={24}>24 per page</option>
            <option value={32}>32 per page (4x8)</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchArticles}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5. 4x4 Articles Card Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold">Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No articles found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              No articles match your search keywords or filter criteria.
            </p>
          </div>
          <Link
            href="/admin/blog/article/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Article</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Card Top: Cover Image & Badges */}
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      art.cover_image ||
                      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                    {/* Category */}
                    {art.category ? (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs pointer-events-auto ${getCategoryBadgeClass(
                          art.category.color
                        )}`}
                      >
                        {art.category.name}
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Featured Star Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(art.id, art.is_featured)}
                      className={`p-1.5 rounded-lg backdrop-blur-md shadow-xs pointer-events-auto transition-transform active:scale-90 ${
                        art.is_featured
                          ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                          : "bg-slate-900/60 text-white/80 hover:text-amber-300 hover:bg-slate-900/80"
                      }`}
                      title={art.is_featured ? "Featured active (click to unpin)" : "Mark as featured"}
                    >
                      <Star className={`w-3.5 h-3.5 ${art.is_featured ? "fill-slate-900" : ""}`} />
                    </button>
                  </div>

                  {/* Status Pill Toggle (Bottom Right of Image) */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(art.id, art.status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm border transition-all ${
                        art.status === "PUBLISHED"
                          ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700"
                          : "bg-amber-500 text-white border-amber-400 hover:bg-amber-600"
                      }`}
                      title="Click to toggle Published / Draft status"
                    >
                      {art.status === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <Link
                    href={`/admin/blog/article/${art.id}/edit`}
                    className="block font-bold text-slate-900 hover:text-emerald-600 text-sm line-clamp-2 leading-snug transition-colors"
                  >
                    {art.title}
                  </Link>

                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    /{art.slug}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {art.excerpt || "No excerpt summary provided."}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata & Action Icons */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{art.views || 0}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{art.reading_time || 3}m</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {art.status === "PUBLISHED" && (
                    <Link
                      href={`/blog/${art.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="View live post"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/blog/article/${art.id}/edit`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit article"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        id: art.id,
                        title: art.title,
                        isDeleting: false,
                      })
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Pagination Controls */}
      {totalItems > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900">
              {Math.min(totalItems, currentPage * itemsPerPage)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{totalItems}</span> articles
          </p>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* 7. Delete Confirmation Modal (In English) */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Blog Article"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action is permanent and cannot be undone.`}
        confirmText="Delete Article"
        cancelText="Cancel"
        isLoading={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: "", isDeleting: false })}
      />
    </div>
  );
}
