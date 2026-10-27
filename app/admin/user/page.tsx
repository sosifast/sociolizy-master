"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Wallet,
  Key,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import TablePagination from "@/app/admin/components/table-pagination";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import { useToast } from "@/app/admin/components/toast-context";

export default function AdminUserPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    username: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    username: "",
    isDeleting: false,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/user");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal Memuat Data", "Tidak dapat mengambil data pengguna dari database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDeleteModal = (id: number, username: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      username,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/user/${deleteModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Berhasil Dihapus", json.message || `Pengguna "${deleteModal.username}" berhasil dihapus.`);
        setUsers((prev) => prev.filter((u) => u.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, username: "", isDeleting: false });
      } else {
        toast.error("Gagal Menghapus", json.message || "Gagal menghapus pengguna.");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Terjadi kesalahan saat menghapus pengguna.");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "Semua" || u.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Manajemen Pengguna
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {users.length}
              </span>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block mx-1" />

            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              {["Semua", "Member", "Admin"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setFilterLevel(lvl);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterLevel === lvl
                      ? "bg-white text-red-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
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
                placeholder="Cari user / email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-600 hover:text-red-600 bg-slate-50 border border-slate-200 hover:border-red-200 transition-colors shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-red-600" : ""}`} />
            </button>

            <Link
              href="/admin/user/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
              <p className="text-xs">Memuat daftar pengguna dari database...</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">Email</th>
                  <th className="py-3.5 px-5">Level</th>
                  <th className="py-3.5 px-5">Saldo</th>
                  <th className="py-3.5 px-5">API Key</th>
                  <th className="py-3.5 px-5">Terdaftar</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Belum ada data pengguna di database</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                        #{u.id}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.level === "Admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {u.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                        Rp {Number(u.balance || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                        {u.api_key || "-"}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400">
                        {new Date(u.create_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/user/${u.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(u.id, u.username)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus User"
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
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, username: "", isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna?"
        message={
          <>
            Apakah Anda yakin ingin menghapus akun{" "}
            <span className="font-bold text-slate-800">"{deleteModal.username}"</span>?
            Data saldo, transaksi, dan riwayat pesanan pengguna ini akan terhapus secara permanen.
          </>
        }
        confirmText="Ya, Hapus Pengguna"
        cancelText="Batal"
        type="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}
