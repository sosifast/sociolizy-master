"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export default function CreateServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [idCategory, setIdCategory] = useState("");
  const [idApiProvider, setIdApiProvider] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [slug, setSlug] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [min, setMin] = useState("100");
  const [max, setMax] = useState("10000");
  const [desc, setDesc] = useState("");
  const [rateApi, setRateApi] = useState("0");
  const [rateSale, setRateSale] = useState("0");

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [catRes, provRes] = await Promise.all([
          fetch("/api/admin/category"),
          fetch("/api/admin/provider"),
        ]);
        const catJson = await catRes.json();
        const provJson = await provRes.json();

        if (catJson.success && catJson.data) {
          setCategories(catJson.data);
          if (catJson.data.length > 0) {
            setIdCategory(String(catJson.data[0].id));
          }
        }

        if (provJson.success && provJson.data) {
          setProviders(provJson.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadInitial();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCategory) {
      setError("Silakan pilih kategori terlebih dahulu.");
      return;
    }
    if (!serviceName.trim() || !serviceId.trim()) {
      setError("Nama layanan dan Service ID provider wajib diisi");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_category: Number(idCategory),
          id_api_provider: idApiProvider ? Number(idApiProvider) : null,
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
        const errorMsg = json.message || "Gagal menyimpan layanan";
        setError(errorMsg);
        toast.error("Gagal Menambahkan Layanan", errorMsg);
        setIsSaving(false);
        return;
      }

      toast.setFlash(
        "Layanan Berhasil Dibuat",
        `Layanan "${serviceName.trim()}" telah berhasil ditambahkan ke katalog.`
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tambah Layanan
          </h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Layanan <span className="text-red-600">*</span>
              </label>
              {isLoadingInitial ? (
                <div className="p-2 text-xs text-slate-400">Memuat kategori...</div>
              ) : categories.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  Belum ada kategori di database. Silakan{" "}
                  <Link href="/admin/category/create" className="font-bold underline text-red-600">
                    Tambah Kategori
                  </Link>{" "}
                  terlebih dahulu.
                </div>
              ) : (
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
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                API Provider (Sumber Layanan)
              </label>
              <select
                value={idApiProvider}
                onChange={(e) => setIdApiProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              >
                <option value="">Manual (Tanpa API Provider)</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.slug}){p.uuid ? ` [${p.uuid.slice(0, 8)}...]` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Layanan (service_name) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => {
                setServiceName(e.target.value);
                if (!slug || slug === serviceName.toLowerCase().replace(/[^a-z0-9]/g, "-")) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                }
              }}
              placeholder="Contoh: Instagram Followers Indonesia [Real Aktif]"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Service ID Provider (service_id) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="1042"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Slug Layanan
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="ig-followers-indo-real"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Minimal Pesanan (min)
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
                Maksimal Pesanan (max)
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
                Harga Modal Provider (rate_api) ($)
              </label>
              <input
                type="number"
                step="0.0001"
                value={rateApi}
                onChange={(e) => setRateApi(e.target.value)}
                placeholder="0.0450"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Harga Jual ke Member (rate_sale) ($)
              </label>
              <input
                type="number"
                step="0.0001"
                value={rateSale}
                onChange={(e) => setRateSale(e.target.value)}
                placeholder="0.0540"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi Layanan (desc)
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Catatan garansi, drop rate, kecepatan masuk..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/admin/service"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSaving || categories.length === 0}
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
                  <span>Simpan Layanan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
