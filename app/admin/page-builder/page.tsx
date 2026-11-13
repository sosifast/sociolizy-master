"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Layers,
  Sparkles,
  LayoutTemplate,
  RefreshCw,
  Loader2,
  Copy,
} from "lucide-react";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import TablePagination from "@/app/admin/components/table-pagination";
import { useToast } from "@/app/admin/components/toast-context";
import { formatBlogDate } from "@/lib/blog-utils";

export default function AdminPageBuilderIndex() {
  const router = useRouter();
  const { toast } = useToast();

  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Delete Modal
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

  const fetchPages = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        status: statusFilter,
        search,
      });

      const res = await fetch(`/api/admin/page-builder?${query.toString()}`);
      const json = await res.json();

      if (json.success) {
        setPages(json.data || []);
        if (json.pagination) {
          setTotalItems(json.pagination.total);
          setTotalPages(json.pagination.totalPages);
        }
      } else {
        toast.error("Failed to load pages", json.message || "An error occurred.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error", "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, search, toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Toggle Publish Status
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/page-builder/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setPages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
        );
        toast.success(
          "Status Updated",
          nextStatus === "PUBLISHED"
            ? "Page is now live publicly!"
            : "Page changed to draft."
        );
      }
    } catch (err) {
      toast.error("Error", "Failed to update page status.");
    }
  };

  // Handle Delete Page
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/page-builder/${deleteModal.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Deleted", `Page "${deleteModal.title}" was deleted.`);
        setPages((prev) => prev.filter((p) => p.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, title: "", isDeleting: false });
        fetchPages();
      } else {
        toast.error("Delete Failed", json.message || "Could not delete page.");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      toast.error("Network Error", "An error occurred.");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Copy live URL helper
  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link Copied", `Copied: /${slug}`);
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
        <span className="text-slate-900 font-bold">Page Builder</span>
      </nav>

      {/* 2. Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Page Builder
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {totalItems} Pages
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/page/show"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 transition-colors"
            title="Open public pages index"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Public Pages</span>
          </Link>

          <Link
            href="/admin/page-builder/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
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
            placeholder="Search pages by title, slug, or keywords..."
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
          </select>

          <button
            type="button"
            onClick={fetchPages}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4. Pages Cards List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold">Loading custom pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <LayoutTemplate className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Custom Pages Created</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Start building custom landing pages, promotional campaigns, or partner directories with drag &amp; drop blocks.
            </p>
          </div>
          <Link
            href="/admin/page-builder/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Page</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pages.map((p) => {
            const blockCount = Array.isArray(p.blocks) ? p.blocks.length : 0;
            const isPublished = p.status === "PUBLISHED";

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-all ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                      }`}
                      title="Click to toggle status"
                    >
                      {isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{blockCount} blocks</span>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <div>
                    <Link
                      href={`/admin/page-builder/${p.id}/edit`}
                      className="block font-bold text-slate-900 hover:text-emerald-600 text-base line-clamp-1 transition-colors"
                    >
                      {p.title}
                    </Link>

                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <span className="font-mono text-emerald-600 font-semibold truncate max-w-[200px]">
                        /{p.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(p.slug)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        title="Copy page URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description || "Custom landing page with drag and drop builder blocks."}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.views || 0} views</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPublished && (
                      <Link
                        href={`/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="View live public page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}

                    <Link
                      href={`/admin/page-builder/${p.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs"
                      title="Open visual drag-and-drop editor"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Builder</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          id: p.id,
                          title: p.title,
                          isDeleting: false,
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination */}
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
            of <span className="font-bold text-slate-900">{totalItems}</span> pages
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

      {/* 6. Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Custom Page"
        message={`Are you sure you want to permanently delete "${deleteModal.title}"? This page will no longer be accessible at /${deleteModal.title.toLowerCase().replace(/\\s+/g, "-")}.`}
        confirmText="Delete Page"
        cancelText="Cancel"
        isLoading={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: "", isDeleting: false })}
      />
    </div>
  );
}

