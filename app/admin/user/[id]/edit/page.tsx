"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Calendar,
  Clock,
  Shield,
  Key,
} from "lucide-react";
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
  const [serverArea, setServerArea] = useState("SG");
  const [uuid, setUuid] = useState("");
  const [createAt, setCreateAt] = useState("");
  const [updateAt, setUpdateAt] = useState("");

  const [regions, setRegions] = useState<Array<{ code: string; name: string; flag: string }>>([
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "DC", name: "Washington DC, USA", flag: "🇺🇸" },
    { code: "BOMB", name: "Mumbai, India", flag: "🇮🇳" },
    { code: "SYD", name: "Sydney, Australia", flag: "🇦🇺" },
    { code: "SF", name: "San Francisco, USA", flag: "🇺🇸" },
    { code: "PDX", name: "Portland, USA", flag: "🇺🇸" },
  ]);

  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);

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
          setServerArea(json.data.server_area || "SG");
          setUuid(json.data.uuid || "");
          setCreateAt(json.data.create_at || "");
          setUpdateAt(json.data.update_at || "");
          if (json.regions && json.regions.length > 0) {
            setRegions(json.regions);
          }
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

  const copyToClipboard = (text: string, type: "uuid" | "api") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "uuid") {
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    } else {
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
    }
    toast.success("Berhasil Disalin", "Teks telah disalin ke papan klip.");
  };

  const handleRegenerateKey = async () => {
    if (!confirm("Apakah Anda yakin ingin memperbarui API Key pengguna ini? API Key lama tidak akan bisa digunakan lagi.")) {
      return;
    }
    setIsRegeneratingKey(true);
    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate_api_key: true }),
      });
      const json = await res.json();
      if (json.success && json.data?.api_key) {
        setApiKey(json.data.api_key);
        toast.success("API Key Diperbarui", "Kunci API baru berhasil dibuat.");
      } else {
        toast.error("Gagal", json.message || "Gagal memperbarui API Key");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error", "Gagal memperbarui API Key.");
    } finally {
      setIsRegeneratingKey(false);
    }
  };

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
        server_area: serverArea,
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Edit Pengguna #{id}
            </h1>
            {uuid && (
              <button
                type="button"
                onClick={() => copyToClipboard(uuid, "uuid")}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Salin UUID"
              >
                <span>UUID: {uuid.substring(0, 8)}...</span>
                {copiedUuid ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Perbarui data profil, saldo deposit, wilayah server, atau level hak akses pengguna.
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
            {/* UUID Full Banner */}
            {uuid && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    UUID Akun
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 break-all">
                    {uuid}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(uuid, "uuid")}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedUuid ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin UUID</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Username & Email */}
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

            {/* Password & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin diubah"
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

            {/* Wilayah Server & Saldo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Wilayah Server (server_area)
                </label>
                <div className="relative">
                  <select
                    value={serverArea}
                    onChange={(e) => setServerArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                  >
                    {regions.map((reg) => (
                      <option key={reg.code} value={reg.code}>
                        {reg.flag} {reg.name} ({reg.code})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Server cluster/database alokasi akun pengguna ini.
                </p>
              </div>

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
            </div>

            {/* API Key Management */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  API Key
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  disabled={isRegeneratingKey}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegeneratingKey ? "animate-spin" : ""}`} />
                  <span>Regenerate API Key</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={apiKey || "-"}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-100 border border-slate-200 text-slate-600 font-mono focus:outline-none cursor-not-allowed"
                />
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(apiKey, "api")}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-white transition-colors cursor-pointer flex-shrink-0"
                    title="Salin API Key"
                  >
                    {copiedApiKey ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Timestamps Info */}
            {(createAt || updateAt) && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                {createAt && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Terdaftar Pada</div>
                      <div className="font-medium text-slate-700">
                        {new Date(createAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {updateAt && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Terakhir Diperbarui</div>
                      <div className="font-medium text-slate-700">
                        {new Date(updateAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
