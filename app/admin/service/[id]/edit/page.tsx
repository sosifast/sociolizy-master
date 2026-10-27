"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export default function EditServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [idCategory, setIdCategory] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [slug, setSlug] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [min, setMin] = useState("100");
  const [max, setMax] = useState("10000");
  const [desc, setDesc] = useState("");
  const [rateApi, setRateApi] = useState("0");
  const [rateSale, setRateSale] = useState("0");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [srvRes, catRes] = await Promise.all([
          fetch(`/api/admin/service/${id}`),
          fetch(`/api/admin/category`),
        ]);

        const srvJson = await srvRes.json();
        const catJson = await catRes.json();

        if (catJson.success && catJson.data) {
          setCategories(catJson.data);
        }

        if (srvJson.success && srvJson.data) {
          const s = srvJson.data;
          setIdCategory(String(s.id_category || ""));
          setServiceName(s.service_name || "");
          setSlug(s.slug || "");
          setServiceId(s.service_id || "");
          setMin(String(s.min || 100));
          setMax(String(s.max || 10000));
          setDesc(s.desc || "");
          setRateApi(String(s.rate_api || 0));
          setRateSale(String(s.rate_sale || 0));
        } else {
          setError(srvJson.message || "Layanan tidak ditemukan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat layanan.");
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
      const res = await fetch(`/api/admin/service/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_category: Number(idCategory),
          service_name: serviceName,
          slug,
          service_id: serviceId,
          min: Number(min),
          max: Number(max),
          desc,
          rate_api: Number(rateApi),
          rate_sale: Number(rateSale),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = json.message || "Gagal memperbarui layanan";
        setError(errorMsg);
        toast.error("Gagal Memperbarui Layanan", errorMsg);
        setIsSaving(false);
        return;
      }

      toast.setFlash(
        "Layanan Berhasil Diperbarui",
        `Perubahan data layanan "${serviceName.trim()}" berhasil disimpan.`
      );
      router.push("/admin/service");
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
          href="/admin/service"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Layanan #{id}
          </h1>
          <p className="text-xs text-slate-500">
            Perbarui data harga modal, harga jual, atau kuota order di database PostgreSQL.
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
          <p className="text-xs">Memuat data layanan...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Layanan
              </label>
              <select
                value={idCategory}
                onChange={(e) => setIdCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.platform?.name ? `[${c.platform.name}] ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Layanan
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Service ID Provider
                </label>
                <input
                  type="text"
                  required
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Slug Layanan
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Minimal Order (min)
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Maksimal Order (max)
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Harga Modal Provider (rate_api)
                </label>
                <input
                  type="number"
                  value={rateApi}
                  onChange={(e) => setRateApi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Harga Jual Member (rate_sale)
                </label>
                <input
                  type="number"
                  value={rateSale}
                  onChange={(e) => setRateSale(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/admin/service"
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
                    <span>Update Layanan</span>
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
