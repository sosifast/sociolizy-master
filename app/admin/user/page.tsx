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
  Globe,
  Eye,
  Copy,
  Check,
  X,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";

import TablePagination from "@/app/admin/components/table-pagination";
import ConfirmModal from "@/app/admin/components/confirm-modal";
import { useToast } from "@/app/admin/components/toast-context";

interface UserItem {
  id: number;
  uuid: string;
  username: string;
  email: string;
  level: "Admin" | "Member";
  balance: number | string;
  api_key: string | null;
  server_area: string;
  create_at: string;
  update_at: string;
}

interface RegionItem {
  code: string;
  name: string;
  flag: string;
}

export default function AdminUserPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [filterRegion, setFilterRegion] = useState("Semua");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Detail Modal State
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);

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
        if (json.regions && json.regions.length > 0) {
          setRegions(json.regions);
        }
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

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Berhasil Disalin", `${label} berhasil disalin ke papan klip.`);
  };

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

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.uuid && u.uuid.toLowerCase().includes(s)) ||
      (u.server_area && u.server_area.toLowerCase().includes(s));

    const matchLevel = filterLevel === "Semua" || u.level === filterLevel;
    const matchRegion = filterRegion === "Semua" || u.server_area === filterRegion;

    return matchSearch && matchLevel && matchRegion;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Aggregate Stats
  const totalBalance = users.reduce((acc, u) => acc + Number(u.balance || 0), 0);
  const totalAdmins = users.filter((u) => u.level === "Admin").length;
  const totalMembers = users.filter((u) => u.level === "Member").length;

  const getRegionMeta = (code: string) => {
    const found = regions.find((r) => r.code.toUpperCase() === (code || "SG").toUpperCase());
    return found || { code: code || "SG", name: code || "SG", flag: "🌐" };
  };

  return (
    <div className="space-y-5">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Total Pengguna</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {users.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Akun terdaftar di database</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Member Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalMembers}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Level Member biasa</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Administrator</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalAdmins}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">Akses penuh panel admin</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Total Saldo Pengguna</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            Rp {totalBalance.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Akumulasi seluruh saldo</div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Manajemen Pengguna
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {filteredUsers.length}
              </span>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block mx-1" />

            {/* Level Filter */}
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

            {/* Region Filter */}
            {regions.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={filterRegion}
                  onChange={(e) => {
                    setFilterRegion(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 focus:bg-white focus:border-red-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Semua">Semua Wilayah</option>
                  {regions.map((reg) => (
                    <option key={reg.code} value={reg.code}>
                      {reg.flag} {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                placeholder="Cari user, email, UUID..."
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

        {/* Table Content */}
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
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Pengguna &amp; UUID</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Wilayah (Server)</th>
                  <th className="py-3.5 px-4">Saldo</th>
                  <th className="py-3.5 px-4">API Key</th>
                  <th className="py-3.5 px-4">Terdaftar</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data pengguna yang cocok</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => {
                    const reg = getRegionMeta(u.server_area);
                    return (
                      <tr key={u.id} className="hover:bg-red-50/20 transition-colors">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                          #{u.id}
                        </td>

                        {/* User & UUID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {u.username}
                              </span>
                              {u.uuid && (
                                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                  <span>{u.uuid.substring(0, 8)}...</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(u.uuid, `UUID #${u.id}`)}
                                    className="hover:text-slate-600 cursor-pointer"
                                    title="Salin UUID lengkap"
                                  >
                                    {copiedKey === `UUID #${u.id}` ? (
                                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-600">{u.email}</td>

                        {/* Level */}
                        <td className="py-3.5 px-4">
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

                        {/* Server Area / Region */}
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 font-mono"
                            title={reg.name}
                          >
                            <Globe className="w-3 h-3 text-indigo-500" />
                            <span>{reg.flag} {u.server_area || "SG"}</span>
                          </span>
                        </td>

                        {/* Saldo */}
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                          Rp {Number(u.balance || 0).toLocaleString("id-ID")}
                        </td>

                        {/* API Key */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {u.api_key ? (
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[90px]">{u.api_key.substring(0, 10)}...</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(u.api_key!, `API Key #${u.id}`)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Salin API Key"
                              >
                                {copiedKey === `API Key #${u.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Terdaftar */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <div>
                            {new Date(u.create_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          {u.update_at && (
                            <div className="text-[10px] text-slate-400">
                              Up: {new Date(u.update_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </div>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Detail Modal Button */}
                            <button
                              onClick={() => setDetailUser(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Lihat Detail Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <Link
                              href={`/admin/user/${u.id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Edit Pengguna"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => openDeleteModal(u.id, u.username)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Pengguna"
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
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* User Detail Quick View Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 relative overflow-hidden">
            <button
              onClick={() => setDetailUser(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 font-extrabold flex items-center justify-center text-base shadow-xs">
                {detailUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {detailUser.username}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      detailUser.level === "Admin"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {detailUser.level}
                  </span>
                </div>
                <p className="text-xs text-slate-500">ID Akun: #{detailUser.id}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              {/* UUID */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-slate-500">UUID Pengguna:</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[11px] break-all">
                  <span>{detailUser.uuid}</span>
                  <button
                    onClick={() => copyToClipboard(detailUser.uuid, "UUID")}
                    className="hover:text-red-600 cursor-pointer"
                    title="Salin UUID"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="pt-2 flex items-center justify-between">
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{detailUser.email}</span>
              </div>

              {/* Wilayah Server */}
              <div className="pt-2 flex items-center justify-between">
                <span className="font-semibold text-slate-500">Wilayah Server (server_area):</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Globe className="w-3 h-3" />
                  <span>
                    {getRegionMeta(detailUser.server_area).flag} {detailUser.server_area} ({getRegionMeta(detailUser.server_area).name})
                  </span>
                </span>
              </div>

              {/* Saldo */}
              <div className="pt-2 flex items-center justify-between">
                <span className="font-semibold text-slate-500">Saldo Deposit:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">
                  Rp {Number(detailUser.balance || 0).toLocaleString("id-ID")}
                </span>
              </div>

              {/* API Key */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-slate-500">API Key:</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[11px] break-all">
                  <span>{detailUser.api_key || "-"}</span>
                  {detailUser.api_key && (
                    <button
                      onClick={() => copyToClipboard(detailUser.api_key!, "API Key")}
                      className="hover:text-red-600 cursor-pointer"
                      title="Salin API Key"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Terdaftar Pada</span>
                  <span>{new Date(detailUser.create_at).toLocaleString("id-ID")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Terakhir Diperbarui</span>
                  <span>{new Date(detailUser.update_at || detailUser.create_at).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Link
                href={`/admin/user/${detailUser.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Pengguna</span>
              </Link>
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
