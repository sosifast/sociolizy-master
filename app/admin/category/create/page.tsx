"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [idPlatform, setIdPlatform] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlatforms() {
      try {
        const res = await fetch("/api/admin/platform");
        const json = await res.json();
        if (json.success && json.data) {
          setPlatforms(json.data);
          if (json.data.length > 0) {
            setIdPlatform(String(json.data[0].id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPlatforms(false);
      }
    }
    loadPlatforms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPlatform) {
      setError("Silakan buat platform terlebih dahulu jika belum ada.");
      return;
    }
    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_platform: Number(idPlatform),
          name,
          slug,
          description,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = json.message || "Gagal menyimpan kategori";
        setError(errorMsg);
        toast.error("Gagal Menambahkan Kategori", errorMsg);
        setIsSaving(false);
        return;
      }

      toast.setFlash(
        "Kategori Berhasil Dibuat",
        `Kategori "${name.trim()}" telah berhasil ditambahkan.`
      );
      router.push("/admin/category");
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
          href="/admin/category"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tambah Kategori Baru
          </h1>
          <p className="text-xs text-slate-500">
            Daftarkan kategori layanan baru langsung ke tabel PostgreSQL <code className="font-mono text-red-600">category</code>.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Platform Induk <span className="text-red-600">*</span>
            </label>
            {isLoadingPlatforms ? (
              <div className="p-2 text-xs text-slate-400">Memuat platform...</div>
            ) : platforms.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Belum ada platform di database. Silakan{" "}
                <Link href="/admin/platform/create" className="font-bold underline text-red-600">
                  Tambah Platform
                </Link>{" "}
                terlebih dahulu.
              </div>
            ) : (
              <select
                value={idPlatform}
                onChange={(e) => setIdPlatform(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              >
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Kategori <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, "-")) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                }
              }}
              placeholder="Contoh: Instagram Followers Indonesia"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Slug Kategori (URL friendly)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="instagram-followers-indonesia"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi layanan kategori ini..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/admin/category"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSaving || platforms.length === 0}
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
                  <span>Simpan Kategori</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
