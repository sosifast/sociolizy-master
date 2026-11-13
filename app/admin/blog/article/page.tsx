"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Star,
  Loader2,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  FolderTree,
  LayoutGrid,
} from "lucide-react";
import TablePagination from "@/app/admin/components/table-pagination";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import { useToast } from "@/app/admin/components/toast-context";
import { formatBlogDate, getCategoryBadgeClass } from "@/lib/blog-utils";

export default function AdminBlogArticleTablePage() {
  const { toast } = useToast();

  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // Load Categories for filter dropdown
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

  // Fetch Articles
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

  // Handle Quick Toggle Featured
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

  // Handle Quick Toggle Status (Publish / Draft)
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
        toast.success(
          "Status Updated",
          nextStatus === "PUBLISHED" ? "Article has been published." : "Article changed to draft."
        );
      }
    } catch (err) {
      toast.error("Error", "Failed to toggle publication status.");
    }
  };

  // Delete article confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/blog/article/${deleteModal.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Article Deleted", `Article "${deleteModal.title}" was deleted.`);
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
    <div className="space-y-4 pb-12">
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
        <span className="text-slate-900 font-bold">Table View</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Article List (Table View)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {totalItems} Posts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 transition-colors"
            title="Switch to 4x4 Grid View"
          >
            <LayoutGrid className="w-4 h-4 text-emerald-600" />
            <span>4x4 Grid View</span>
          </Link>
          <Link
            href="/admin/blog/category"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FolderTree className="w-4 h-4 text-slate-500" />
            <span>Categories</span>
          </Link>
          <Link
            href="/admin/blog/article/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
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
          {/* Category Filter */}
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

          {/* Status Filter */}
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

          {/* Refresh button */}
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

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading article list...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No articles match your criteria</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Article</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Featured</th>
                  <th className="px-4 py-3.5">Views</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Article title & cover */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {art.cover_image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            <img
                              src={art.cover_image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl shrink-0 bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <Link
                            href={`/admin/blog/article/${art.id}/edit`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                          >
                            {art.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            /{art.slug}
                          </p>
                          {art.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {art.tags
                                .split(",")
                                .slice(0, 3)
                                .map((t: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium"
                                  >
                                    #{t.trim()}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {art.category ? (
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${getCategoryBadgeClass(
                            art.category.color
                          )}`}
                        >
                          {art.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Uncategorized</span>
                      )}
                    </td>

                    {/* Status Pill Toggle */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(art.id, art.status)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          art.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {art.status === "PUBLISHED" ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Featured Star Toggle */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(art.id, art.is_featured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          art.is_featured
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-slate-300 hover:text-amber-400 hover:bg-slate-50"
                        }`}
                        title={art.is_featured ? "Featured active (click to remove)" : "Mark as featured"}
                      >
                        <Star className={`w-4 h-4 ${art.is_featured ? "fill-amber-500" : ""}`} />
                      </button>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{art.views || 0}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {formatBlogDate(art.published_at || art.create_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {art.status === "PUBLISHED" && (
                          <Link
                            href={`/blog/${art.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="View public post"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/article/${art.id}/edit`}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
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
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Blog Article"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
        confirmText="Delete Article"
        cancelText="Cancel"
        isLoading={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: "", isDeleting: false })}
      />
    </div>
  );
}
