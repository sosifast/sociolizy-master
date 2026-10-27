"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Globe,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export default function AdminSettingPage() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("Master SMM");
  const [logo, setLogo] = useState("/logo.png");
  const [favicon, setFavicon] = useState("/favicon.ico");
  const [apiApp, setApiApp] = useState("smm_app_key_master_live_2026");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Ambil data pengaturan dari database PostgreSQL via Prisma API
  useEffect(() => {
    async function loadSetting() {
      try {
        const res = await fetch("/api/admin/setting");
        const json = await res.json();
        if (json.success && json.data) {
          setSiteName(json.data.site_name || "Master SMM");
          setLogo(json.data.logo || "/logo.png");
          setFavicon(json.data.favicon || "/favicon.ico");
          setApiApp(json.data.api_app || "smm_app_key_master_live_2026");
        }
      } catch (err) {
        console.error("Gagal memuat setting:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSetting();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          logo,
          favicon,
          api_app: apiApp,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Pengaturan Disimpan", json.message || "Pengaturan website berhasil diperbarui.");
      } else {
        toast.error("Gagal Menyimpan", json.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Terjadi kesalahan jaringan saat menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
              Database Model: Setting
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Sistem & Situs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tersinkronisasi langsung dengan tabel PostgreSQL <code className="font-mono text-red-600 bg-red-50 px-1 py-0.5 rounded">setting</code> via Prisma.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
          <p className="text-xs">Menghubungkan ke database PostgreSQL...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-600" />
              <span>Identitas Website (Tabel: setting)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Website / Brand (site_name)
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Kolom: site_name (String)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Master API App Key (api_app)
                </label>
                <input
                  type="text"
                  value={apiApp}
                  onChange={(e) => setApiApp(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Kolom: api_app (String?)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Logo Website (logo)
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Kolom: logo (String?)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Favicon (favicon)
                </label>
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="/favicon.ico"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Kolom: favicon (String?)</p>
              </div>
            </div>
          </div>

          {/* Security & Maintenance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span>Opsi Tambahan</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">Registrasi Terbuka</p>
                  <p className="text-xs text-slate-500">Menerima pendaftaran pengguna baru via halaman /auth/register</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan ke Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
