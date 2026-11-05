"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Server,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Coins,
} from "lucide-react";

import { Search } from "lucide-react";
import TablePagination from "@/app/admin/components/table-pagination";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import { useToast } from "@/app/admin/components/toast-context";
import { useCachedFetch } from "@/lib/client-cache";

export default function AdminProviderPage() {
  const { toast } = useToast();
  const {
    data: providersData,
    isLoading,
    isRefreshing,
    refresh: fetchProviders,
    mutate,
  } = useCachedFetch<any[]>("/api/admin/provider", { ttlMs: 60_000 });

  const providers = useMemo(() => providersData || [], [providersData]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Direct balance update loading states
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

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

  // Direct update balance from API without modal/form
  const handleDirectSync = async (provider: any) => {
    if (syncingId !== null) return;
    setSyncingId(provider.id);

    try {
      const res = await fetch(`/api/admin/provider/${provider.id}/sync-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_save: true }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(
          "Gagal Update Saldo",
          json.message || `Tidak dapat mengambil saldo dari provider "${provider.name}".`
        );
        return;
      }

      const updatedBalance =
        json.data?.numeric_balance ?? parseFloat(String(json.data?.balance || "0"));

      mutate((prev) =>
        prev
          ? prev.map((p: any) =>
              p.id === provider.id ? { ...p, balance: updatedBalance } : p
            )
          : []
      );

      toast.success(
        "Saldo Berhasil Diupdate",
        `Saldo "${provider.name}" langsung diupdate menjadi $${Number(updatedBalance).toFixed(2)}`
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Gagal menghubungi server API provider.");
    } finally {
      setSyncingId(null);
    }
  };

  // Direct update all providers balance
  const handleSyncAll = async () => {
    if (providers.length === 0 || isSyncingAll) return;
    setIsSyncingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const prov of providers) {
      try {
        const res = await fetch(`/api/admin/provider/${prov.id}/sync-balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auto_save: true }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          const updatedBalance =
            json.data?.numeric_balance ?? parseFloat(String(json.data?.balance || "0"));
          mutate((prev) =>
            prev
              ? prev.map((p: any) =>
                  p.id === prov.id ? { ...p, balance: updatedBalance } : p
                )
              : []
          );
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsSyncingAll(false);
    if (successCount > 0) {
      toast.success(
        "Sinkronisasi Selesai",
        `${successCount} provider berhasil diperbarui saldo riilnya.`
      );
    }
    if (failCount > 0) {
      toast.error("Sebagian Gagal", `${failCount} provider gagal diupdate.`);
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
      const res = await fetch(`/api/admin/provider/${deleteModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Berhasil Dihapus", json.message || `Provider "${deleteModal.name}" berhasil dihapus.`);
        mutate((prev) => (prev ? prev.filter((p: any) => p.id !== deleteModal.id) : []));
        setDeleteModal({ isOpen: false, id: null, name: "", isDeleting: false });
      } else {
        toast.error("Gagal Menghapus", json.message || "Gagal menghapus data provider.");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Terjadi kesalahan saat menghapus data provider.");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const filtered = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.uuid && p.uuid.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Providers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Penyedia API (Provider SMM)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {providers.length}
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
                placeholder="Cari provider..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => fetchProviders()}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-colors shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncingAll || isLoading || providers.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-2xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
              title="Update saldo semua provider langsung dari API ($)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin text-amber-600" : "text-amber-600"}`} />
              <span>{isSyncingAll ? "Mengupdate..." : "Sync Semua Saldo"}</span>
            </button>

            <Link
              href="/admin/provider/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-600/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Provider</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs">Memuat data provider dari database...</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Nama Provider</th>
                  <th className="py-3.5 px-5">Slug</th>
                  <th className="py-3.5 px-5">URL Endpoint</th>
                  <th className="py-3.5 px-5">API Key</th>
                  <th className="py-3.5 px-5">Saldo ($)</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Server className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Belum ada provider di database</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tambahkan server provider API SMM pertama Anda dengan tombol <strong>+ Tambah Provider</strong>.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                        #{p.id}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.uuid && (
                          <div className="text-[10px] font-mono text-slate-400 select-all" title="UUID Provider">
                            {p.uuid}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">
                        {p.slug}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 max-w-[160px] truncate" title={p.url}>
                        {p.url || "-"}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-400">
                        ••••••••••••••••
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 font-mono">
                            ${Number(p.balance || 0).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDirectSync(p)}
                            disabled={syncingId === p.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                            title="Langsung update saldo riil dari API provider ($)"
                          >
                            {syncingId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                            ) : (
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{syncingId === p.id ? "Updating..." : "Update Saldo"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDirectSync(p)}
                            disabled={syncingId === p.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Langsung update saldo riil dari API provider ($)"
                          >
                            {syncingId === p.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            ) : (
                              <Coins className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <Link
                            href={`/admin/provider/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
        title="Hapus API Provider?"
        message={
          <>
            Apakah Anda yakin ingin menghapus provider{" "}
            <span className="font-bold text-slate-800">"{deleteModal.name}"</span>?
            Semua konfigurasi sinkronisasi API untuk provider ini tidak akan dapat digunakan lagi.
          </>
        }
        confirmText="Ya, Hapus Provider"
        cancelText="Batal"
        type="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}
