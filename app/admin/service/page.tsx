"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Plus,
  Search,
  FileDown,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  FileText,
} from "lucide-react";

import TablePagination from "@/app/admin/components/table-pagination";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import { useToast } from "@/app/admin/components/toast-context";
import { useCachedFetch } from "@/lib/client-cache";

export default function AdminServicePage() {
  const { toast } = useToast();
  const {
    data: servicesData,
    isLoading,
    isRefreshing,
    refresh: fetchServices,
    mutate,
  } = useCachedFetch<any[]>("/api/admin/service", { ttlMs: 60_000 });

  const services = useMemo(() => servicesData || [], [servicesData]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    name: "",
    isDeleting: false,
  });

  // Multi-delete Selection State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false,
  });

  // AI Description Generation States
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    serviceName: string;
    desc: string;
  }>({
    isOpen: false,
    serviceName: "",
    desc: "",
  });

  const handleGenerateSingle = async (service: any) => {
    setGeneratingId(service.id);
    try {
      const res = await fetch("/api/admin/service/generate-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          service_name: service.service_name,
          id_category: service.id_category,
          min: service.min,
          max: service.max,
          save_to_db: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.description) {
        toast.success(
          "Deskripsi AI Berhasil",
          `Deskripsi untuk "${service.service_name}" berhasil dibuat dan disimpan.`
        );
        mutate((prev) =>
          prev
            ? prev.map((item: any) =>
                item.id === service.id ? { ...item, desc: json.description } : item
              )
            : []
        );
      } else {
        toast.error("Gagal Generate AI", json.message || "Gagal menghasilkan deskripsi.");
      }
    } catch (err: any) {
      toast.error("Kesalahan Jaringan", err?.message || "Terjadi kesalahan saat memanggil AI.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkGenerating(true);
    try {
      const res = await fetch("/api/admin/service/generate-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          "Generate AI Berhasil",
          json.message || `Berhasil menghasilkan deskripsi untuk ${json.count} layanan.`
        );
        if (Array.isArray(json.updated)) {
          const updatedMap = new Map<number, string>();
          json.updated.forEach((u: any) => updatedMap.set(u.id, u.desc));
          mutate((prev) =>
            prev
              ? prev.map((item: any) =>
                  updatedMap.has(item.id)
                    ? { ...item, desc: updatedMap.get(item.id) }
                    : item
                )
              : []
          );
        }
        setSelectedIds(new Set());
      } else {
        toast.error("Gagal Bulk Generate", json.message || "Gagal menghasilkan deskripsi.");
      }
    } catch (err: any) {
      toast.error("Kesalahan Jaringan", err?.message || "Terjadi kesalahan.");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const openDeleteModal = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/service/${deleteModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Berhasil Dihapus", json.message || `Layanan "${deleteModal.name}" berhasil dihapus.`);
        mutate((prev) => (prev ? prev.filter((s: any) => s.id !== deleteModal.id) : []));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (deleteModal.id) next.delete(deleteModal.id);
          return next;
        });
        setDeleteModal({ isOpen: false, id: null, name: "", isDeleting: false });
      } else {
        toast.error("Gagal Menghapus", json.message || "Gagal menghapus layanan.");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Terjadi kesalahan saat menghapus data layanan.");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = services.filter(
    (s) =>
      s.service_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category?.name && s.category.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.api_provider?.name && s.api_provider.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.api_provider?.uuid && s.api_provider.uuid.toLowerCase().includes(search.toLowerCase())) ||
      (s.service_id && String(s.service_id).toLowerCase().includes(search.toLowerCase())) ||
      (s.uuid && s.uuid.toLowerCase().includes(search.toLowerCase())) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllPageSelected = useMemo(() => {
    if (paginated.length === 0) return false;
    return paginated.every((s) => selectedIds.has(s.id));
  }, [paginated, selectedIds]);

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        paginated.forEach((s) => next.delete(s.id));
      } else {
        paginated.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const idsArray = Array.from(selectedIds);
      const res = await fetch("/api/admin/service", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Berhasil Dihapus", json.message || `${idsArray.length} layanan berhasil dihapus.`);
        mutate((prev) => (prev ? prev.filter((s: any) => !selectedIds.has(s.id)) : []));
        setSelectedIds(new Set());
        setBulkDeleteModal({ isOpen: false, isDeleting: false });
      } else {
        toast.error("Gagal Menghapus", json.message || "Gagal menghapus layanan.");
        setBulkDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Terjadi kesalahan saat menghapus layanan terpilih.");
      setBulkDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Daftar Layanan SMM
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {services.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari ID / layanan..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => fetchServices()}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-colors shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            <Link
              href="/admin/import"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
            </Link>

            <Link
              href="/admin/service/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-xs shadow-emerald-600/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Layanan</span>
            </Link>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="mx-5 my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-emerald-900">
                {selectedIds.size} layanan dipilih
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={isBulkGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/70 border border-emerald-300 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                title="Generate deskripsi untuk semua layanan yang dipilih menggunakan AI berdasarkan judul"
              >
                {isBulkGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Generating AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Generate Deskripsi AI ({selectedIds.size})</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              >
                Batal Pilih
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteModal({ isOpen: true, isDeleting: false })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs">Memuat data layanan...</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={toggleSelectAllPage}
                      title="Pilih semua di halaman ini"
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    />
                  </th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-5">Nama Layanan</th>
                  <th className="py-3.5 px-5">Kategori & Platform</th>
                  <th className="py-3.5 px-5">Provider</th>
                  <th className="py-3.5 px-5">Min / Max</th>
                  <th className="py-3.5 px-5">Harga Modal ($)</th>
                  <th className="py-3.5 px-5">Harga Jual ($)</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <PackageCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Belum ada layanan</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tambahkan layanan manual atau gunakan fitur <strong>Import Otomatis</strong> untuk menyinkronkan ribuan layanan provider.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((s) => {
                    const isSelected = selectedIds.has(s.id);
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          isSelected ? "bg-emerald-50/40" : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(s.id)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                          #{s.id}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 max-w-xs">
                          <div className="truncate font-semibold text-slate-900" title={s.service_name}>
                            {s.service_name}
                          </div>
                          {s.desc ? (
                            <button
                              type="button"
                              onClick={() => setPreviewModal({ isOpen: true, serviceName: s.service_name, desc: s.desc })}
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 cursor-pointer transition-colors"
                              title="Lihat deskripsi layanan"
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span>Lihat Deskripsi</span>
                            </button>
                          ) : (
                            <span className="inline-block text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                              Belum ada deskripsi
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {s.category?.name || `Kategori #${s.id_category}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          {s.api_provider ? (
                            <div>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title={s.api_provider.uuid ? `Provider UUID: ${s.api_provider.uuid}` : undefined}
                              >
                                {s.api_provider.name}
                              </span>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                ID: {s.service_id}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Manual
                              </span>
                              {s.service_id && (
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                  ID: {s.service_id}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">
                          {s.min} / {s.max}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">
                          ${Number(s.rate_api || 0).toFixed(4)}
                        </td>
                        <td className="py-3.5 px-5 font-extrabold text-slate-900 font-mono">
                          ${Number(s.rate_sale || 0).toFixed(4)}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleGenerateSingle(s)}
                              disabled={generatingId === s.id}
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Generate Deskripsi dengan AI (Berdasarkan Judul)"
                            >
                              {generatingId === s.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Link
                              href={`/admin/service/${s.id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => openDeleteModal(s.id, s.service_name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "", isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Hapus Layanan SMM?"
        message={
          <>
            Apakah Anda yakin ingin menghapus layanan{" "}
            <span className="font-bold text-slate-800">"{deleteModal.name}"</span>?
            Layanan ini tidak akan tersedia lagi untuk pemesanan member.
          </>
        }
        confirmText="Ya, Hapus Layanan"
        cancelText="Batal"
        type="danger"
        isLoading={deleteModal.isDeleting}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteModal.isOpen}
        onClose={() => setBulkDeleteModal({ isOpen: false, isDeleting: false })}
        onConfirm={handleConfirmBulkDelete}
        title={`Hapus ${selectedIds.size} Layanan Terpilih?`}
        message={
          <>
            Apakah Anda yakin ingin menghapus{" "}
            <span className="font-bold text-slate-800">{selectedIds.size} layanan</span> terpilih?
            Layanan-layanan ini akan dihapus secara permanen dan tidak dapat dipulihkan.
          </>
        }
        confirmText={`Ya, Hapus (${selectedIds.size}) Layanan`}
        cancelText="Batal"
        type="danger"
        isLoading={bulkDeleteModal.isDeleting}
      />
      {/* Description Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Deskripsi Layanan</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1">{previewModal.serviceName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal({ isOpen: false, serviceName: "", desc: "" })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {previewModal.desc || "Tidak ada deskripsi."}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Format: Clean English Text
              </span>
              <button
                type="button"
                onClick={() => setPreviewModal({ isOpen: false, serviceName: "", desc: "" })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
