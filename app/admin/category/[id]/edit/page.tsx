"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export default function EditCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [platforms, setPlatforms] = useState<any[]>([]);
  const [idPlatform, setIdPlatform] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, platRes] = await Promise.all([
          fetch(`/api/admin/category/${id}`),
          fetch(`/api/admin/platform`),
        ]);

        const catJson = await catRes.json();
        const platJson = await platRes.json();

        if (platJson.success && platJson.data) {
          setPlatforms(platJson.data);
        }

        if (catJson.success && catJson.data) {
          setName(catJson.data.name || "");
          setSlug(catJson.data.slug || "");
          setDescription(catJson.data.description || "");
          setIdPlatform(String(catJson.data.id_platform || ""));
        } else {
          setError(catJson.message || "Kategori tidak ditemukan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat kategori.");
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
      const res = await fetch(`/api/admin/category/${id}`, {
        method: "PUT",
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
        const errorMsg = json.message || "Gagal memperbarui kategori";
        setError(errorMsg);
        toast.error("Gagal Memperbarui Kategori", errorMsg);
        setIsSaving(false);
        return;
      }

      toast.setFlash(
        "Kategori Berhasil Diperbarui",
        `Perubahan data kategori "${name.trim()}" berhasil disimpan.`
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
            Edit Kategori #{id}
          </h1>
          <p className="text-xs text-slate-500">
            Perbarui data kategori layanan di database PostgreSQL.
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
          <p className="text-xs">Memuat data kategori...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Platform Induk
              </label>
              <select
                value={idPlatform}
                onChange={(e) => setIdPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              >
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Kategori
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Slug Kategori
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/admin/category"
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
                    <span>Update Kategori</span>
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
