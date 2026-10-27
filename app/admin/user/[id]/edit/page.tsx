"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export default function EditUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState("Member");
  const [balance, setBalance] = useState("0");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/user/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setUsername(json.data.username || "");
          setEmail(json.data.email || "");
          setLevel(json.data.level || "Member");
          setBalance(String(json.data.balance ?? 0));
          setApiKey(json.data.api_key || "");
        } else {
          setError(json.message || "Pengguna tidak ditemukan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat pengguna.");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: any = {
        username,
        email,
        level,
        balance: Number(balance) || 0,
      };
      if (password && password.trim().length > 0) {
        if (password.length < 6) {
          setError("Password baru minimal 6 karakter");
          setIsSaving(false);
          return;
        }
        payload.password = password;
      }

      const res = await fetch(`/api/admin/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = json.message || "Gagal memperbarui pengguna";
        setError(errorMsg);
        toast.error("Gagal Memperbarui Pengguna", errorMsg);
        setIsSaving(false);
        return;
      }

      toast.setFlash(
        "Pengguna Berhasil Diperbarui",
        `Perubahan data pengguna "${username.trim()}" berhasil disimpan.`
      );
      router.push("/admin/user");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
      toast.error("Kesalahan Jaringan", "Tidak dapat terhubung ke server.");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/user"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Pengguna #{id}
          </h1>
          <p className="text-xs text-slate-500">
            Perbarui data profil, saldo deposit, atau level hak akses pengguna.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
          <p className="text-xs">Memuat data pengguna...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Level Hak Akses
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Saldo Deposit (IDR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  API Key
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={apiKey || "-"}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-100 border border-slate-200 text-slate-500 font-mono focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/admin/user"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Kembali
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Data</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
