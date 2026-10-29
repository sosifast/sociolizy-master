"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  FolderPlus,
  RefreshCw,
  Loader2,
  Check,
  X,
  AlertCircle,
  FileDown,
} from "lucide-react";

import TablePagination from "@/app/admin/components/table-pagination";
import { useToast } from "@/app/admin/components/toast-context";
import { clientCache } from "@/lib/client-cache";

interface ApiProvider {
  id: number;
  name: string;
  slug: string;
  url: string;
  balance: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  platform?: {
    id: number;
    name: string;
  };
}

interface Platform {
  id: number;
  name: string;
}

interface ProviderService {
  service_id: string;
  service_name: string;
  category: string;
  rate: string;
  min: number;
  max: number;
  type: string;
  desc: string;
  dripfeed?: any;
  refill?: any;
  cancel?: any;
}

export default function AdminImportPage() {
  const { toast } = useToast();

  // Wizard Step: 1 = Provider, 2 = Select Services, 3 = Pricing & Import
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Initial Data
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Services Data
  const [services, setServices] = useState<ProviderService[]>([]);
  const [existingServiceIds, setExistingServiceIds] = useState<Set<string>>(new Set());
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Category & Pricing
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [markupType, setMarkupType] = useState<"percent" | "fixed">("percent");
  const [markupValue, setMarkupValue] = useState<number>(20);
  const [roundingOption, setRoundingOption] = useState<"4" | "3" | "2">("4");

  // Filter & Pagination (Step 2)
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "existing">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Import State
  const [updateExisting, setUpdateExisting] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [importResult, setImportResult] = useState<{
    created_count: number;
    updated_count: number;
    skipped_count: number;
    errors: string[];
  } | null>(null);

  // Quick Category Modal
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatPlatformId, setNewCatPlatformId] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const formatUSD = (val: number | string, decimals = 4) => {
    const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
    return `$${num.toFixed(decimals)}`;
  };

  const calculatePrices = (rawRate: string | number) => {
    const originalRate = typeof rawRate === "number" ? rawRate : parseFloat(String(rawRate)) || 0;

    let salePrice = originalRate;
    if (markupType === "percent") {
      salePrice = originalRate * (1 + (Number(markupValue) || 0) / 100);
    } else {
      salePrice = originalRate + (Number(markupValue) || 0);
    }

    if (roundingOption === "2") {
      salePrice = Math.round(salePrice * 100) / 100;
    } else if (roundingOption === "3") {
      salePrice = Math.round(salePrice * 1000) / 1000;
    } else {
      salePrice = Math.round(salePrice * 10000) / 10000;
    }

    const profit = Math.max(0, salePrice - originalRate);

    return {
      rateApi: originalRate,
      rateSale: salePrice,
      profit: Math.round(profit * 10000) / 10000,
    };
  };

  useEffect(() => {
    async function loadInitial() {
      setIsLoadingInitial(true);
      try {
        const [provRes, catRes, platRes] = await Promise.all([
          fetch("/api/admin/provider"),
          fetch("/api/admin/category"),
          fetch("/api/admin/platform"),
        ]);

        const provJson = await provRes.json();
        const catJson = await catRes.json();
        const platJson = await platRes.json();

        if (provJson.success && provJson.data) {
          setProviders(provJson.data);
          if (provJson.data.length > 0) {
            setSelectedProviderId(String(provJson.data[0].id));
          }
        }

        if (catJson.success && catJson.data) {
          setCategories(catJson.data);
          if (catJson.data.length > 0) {
            setTargetCategoryId(String(catJson.data[0].id));
          }
        }

        if (platJson.success && platJson.data) {
          setPlatforms(platJson.data);
          if (platJson.data.length > 0) {
            setNewCatPlatformId(String(platJson.data[0].id));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal Memuat Data", "Tidak dapat mengambil data provider atau kategori.");
      } finally {
        setIsLoadingInitial(false);
      }
    }

    loadInitial();
  }, []);

  const handleFetchServices = async () => {
    if (!selectedProviderId) return;

    setIsLoadingServices(true);
    setServices([]);
    setSelectedIds(new Set());
    setImportResult(null);

    try {
      const res = await fetch(`/api/admin/provider/${selectedProviderId}/services`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error("Gagal Tarik Layanan", json.message || "Gagal mengambil data dari provider.");
        return;
      }

      const fetchedServices: ProviderService[] = json.data || [];
      const existingIds = new Set<string>(
        (json.existing_service_ids || []).map((id: any) => String(id))
      );

      setServices(fetchedServices);
      setExistingServiceIds(existingIds);
      setHasFetched(true);
      setCurrentPage(1);

      toast.success(
        "Layanan Dimuat",
        `${fetchedServices.length} layanan berhasil dimuat.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Gagal menghubungi server endpoint provider.");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const providerCategories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach((s) => {
      if (s.category) cats.add(s.category.trim());
    });
    return Array.from(cats).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.service_name.toLowerCase().includes(q);
        const matchId = item.service_id.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchCat) return false;
      }

      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      const isExisting = existingServiceIds.has(item.service_id);
      if (statusFilter === "new" && isExisting) return false;
      if (statusFilter === "existing" && !isExisting) return false;

      return true;
    });
  }, [services, searchQuery, categoryFilter, statusFilter, existingServiceIds]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const isAllPageSelected =
    paginatedServices.length > 0 &&
    paginatedServices.every((s) => selectedIds.has(s.service_id));

  const toggleSelectPage = () => {
    const next = new Set(selectedIds);
    if (isAllPageSelected) {
      paginatedServices.forEach((s) => next.delete(s.service_id));
    } else {
      paginatedServices.forEach((s) => next.add(s.service_id));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (serviceId: string) => {
    const next = new Set(selectedIds);
    if (next.has(serviceId)) {
      next.delete(serviceId);
    } else {
      next.add(serviceId);
    }
    setSelectedIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredServices.forEach((s) => next.add(s.service_id));
    setSelectedIds(next);
  };

  const selectAllNew = () => {
    const next = new Set(selectedIds);
    filteredServices.forEach((s) => {
      if (!existingServiceIds.has(s.service_id)) {
        next.add(s.service_id);
      }
    });
    setSelectedIds(next);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatPlatformId) return;

    setIsCreatingCategory(true);
    try {
      const res = await fetch("/api/admin/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          id_platform: Number(newCatPlatformId),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error("Gagal", json.message || "Gagal membuat kategori.");
        return;
      }

      const createdCat = json.data;
      setCategories((prev) => [createdCat, ...prev]);
      setTargetCategoryId(String(createdCat.id));
      setShowNewCategoryModal(false);
      setNewCatName("");
      toast.success("Berhasil", `Kategori "${createdCat.name}" dibuat.`);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal", "Tidak dapat membuat kategori.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleExecuteImport = async () => {
    if (selectedIds.size === 0) return;

    const defaultCatId = targetCategoryId ? Number(targetCategoryId) : categories[0]?.id;
    if (!defaultCatId) {
      toast.error("Peringatan", "Pilih kategori target terlebih dahulu.");
      return;
    }

    const selectedServicesList = services.filter((s) => selectedIds.has(s.service_id));
    const payloadServices = selectedServicesList.map((s) => {
      const prices = calculatePrices(s.rate);
      return {
        service_id: s.service_id,
        service_name: s.service_name,
        id_category: defaultCatId,
        min: s.min,
        max: s.max,
        desc: s.desc || null,
        rate_api: prices.rateApi,
        rate_sale: prices.rateSale,
      };
    });

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/service/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: Number(selectedProviderId),
          update_existing: updateExisting,
          services: payloadServices,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error("Gagal", json.message || "Gagal menyimpan layanan.");
        setIsSaving(false);
        return;
      }

      setImportResult(json.data);

      const nextExisting = new Set(existingServiceIds);
      selectedIds.forEach((id) => nextExisting.add(id));
      setExistingServiceIds(nextExisting);
      setSelectedIds(new Set());

      // Invalidate client cache so services page has fresh list
      clientCache.invalidate("/api/admin/service");
      clientCache.invalidate("/api/admin/stats");
      clientCache.invalidate("/api/admin/category");

      toast.success(
        "Selesai",
        `${json.data.created_count} layanan berhasil disimpan.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal", "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProvider = providers.find((p) => String(p.id) === selectedProviderId);

  return (
    <div className="w-full pb-16">
      {/* Full Width Card with Step Tabs directly on Card Header */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Step Tabs Header */}
        <div className="border-b border-slate-200 bg-slate-50/70">
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {/* Tab 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`p-3.5 sm:p-4 text-center sm:text-left transition-all relative cursor-pointer focus:outline-none ${
                currentStep === 1
                  ? "bg-white text-slate-900 font-bold"
                  : "hover:bg-slate-100/60 text-slate-600"
              }`}
            >
              {currentStep === 1 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600" />
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    currentStep === 1
                      ? "bg-red-600 text-white"
                      : hasFetched
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {hasFetched && currentStep !== 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
                </span>
                <span className="text-xs font-bold truncate">1. Provider</span>
              </div>
            </button>

            {/* Tab 2 */}
            <button
              type="button"
              onClick={() => {
                if (hasFetched) setCurrentStep(2);
              }}
              disabled={!hasFetched}
              className={`p-3.5 sm:p-4 text-center sm:text-left transition-all relative focus:outline-none ${
                !hasFetched
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : currentStep === 2
                  ? "bg-white text-slate-900 font-bold cursor-pointer"
                  : "hover:bg-slate-100/60 text-slate-600 cursor-pointer"
              }`}
            >
              {currentStep === 2 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600" />
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    currentStep === 2
                      ? "bg-red-600 text-white"
                      : selectedIds.size > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {selectedIds.size > 0 && currentStep !== 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
                </span>
                <span className="text-xs font-bold truncate">
                  2. Layanan {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                </span>
              </div>
            </button>

            {/* Tab 3 */}
            <button
              type="button"
              onClick={() => {
                if (selectedIds.size > 0) setCurrentStep(3);
              }}
              disabled={selectedIds.size === 0}
              className={`p-3.5 sm:p-4 text-center sm:text-left transition-all relative focus:outline-none ${
                selectedIds.size === 0
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : currentStep === 3
                  ? "bg-white text-slate-900 font-bold cursor-pointer"
                  : "hover:bg-slate-100/60 text-slate-600 cursor-pointer"
              }`}
            >
              {currentStep === 3 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600" />
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    currentStep === 3
                      ? "bg-red-600 text-white"
                      : importResult
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {importResult ? <Check className="w-3.5 h-3.5" /> : "3"}
                </span>
                <span className="text-xs font-bold truncate">3. Import</span>
              </div>
            </button>
          </div>
        </div>

        {/* ================= STEP 1: PROVIDER ================= */}
        {currentStep === 1 && (
          <div className="w-full">
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Provider
                  </label>
                  {isLoadingInitial ? (
                    <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                  ) : providers.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      Belum ada provider.{" "}
                      <Link href="/admin/provider" className="font-bold underline text-red-600">
                        Tambah Provider &rarr;
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedProviderId}
                      onChange={(e) => {
                        setSelectedProviderId(e.target.value);
                        setHasFetched(false);
                        setServices([]);
                        setSelectedIds(new Set());
                        setImportResult(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:border-red-500 focus:outline-none"
                    >
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.slug})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="button"
                    onClick={handleFetchServices}
                    disabled={isLoadingServices || !selectedProviderId}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingServices ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memuat...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{hasFetched ? "Tarik Ulang" : "Tarik Layanan"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {hasFetched && (
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>{services.length}</strong> layanan ditemukan (
                    {services.filter((s) => !existingServiceIds.has(s.service_id)).length} baru,{" "}
                    {services.filter((s) => existingServiceIds.has(s.service_id)).length} sudah ada).
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!hasFetched || services.length === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT SERVICES ================= */}
        {currentStep === 2 && (
          <div className="w-full">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari ID / nama..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">Semua Kategori ({providerCategories.length})</option>
                    {providerCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="new">Baru</option>
                    <option value="existing">Sudah Ada</option>
                  </select>

                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                    {selectedIds.size} Dipilih
                  </span>
                </div>
              </div>

              {/* Quick Select Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <button
                  type="button"
                  onClick={toggleSelectPage}
                  className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {isAllPageSelected ? "Lepas Halaman" : "Pilih Halaman"}
                </button>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Pilih Semua ({filteredServices.length})
                </button>
                <button
                  type="button"
                  onClick={selectAllNew}
                  className="px-2.5 py-1 rounded-lg font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                >
                  Pilih yang Baru
                </button>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-2.5 py-1 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                  >
                    Batal Pilihan
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllPageSelected}
                        onChange={toggleSelectPage}
                        className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-20">ID</th>
                    <th className="py-3 px-3 min-w-[280px]">Layanan</th>
                    <th className="py-3 px-3 w-28 text-center">Min / Max</th>
                    <th className="py-3 px-3 w-24 text-right">Modal ($)</th>
                    <th className="py-3 px-3 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                        <p className="font-semibold text-slate-600">Tidak ada layanan ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedServices.map((item) => {
                      const isSelected = selectedIds.has(item.service_id);
                      const isExisting = existingServiceIds.has(item.service_id);

                      return (
                        <tr
                          key={item.service_id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? "bg-red-50/30" : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(item.service_id)}
                              className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {item.service_id}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 leading-tight">
                              {item.service_name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.category}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                            {item.min.toLocaleString()} - {item.max.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                            {formatUSD(item.rate, 4)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isExisting ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Sudah Ada
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Baru
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {services.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredServices.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            )}

            {/* Step 2 Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Lanjut ({selectedIds.size})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PRICING & IMPORT ================= */}
        {currentStep === 3 && (
          <div className="w-full">
            <div className="p-6 space-y-5">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Kategori Target</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <FolderPlus className="w-3 h-3" />
                    <span>+ Buat Kategori</span>
                  </button>
                </div>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:border-red-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.platform?.name ? `[${c.platform.name}] ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Markup Margin & Decimals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Markup</label>
                  <div className="grid grid-cols-2 rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMarkupType("percent");
                        setMarkupValue(20);
                      }}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        markupType === "percent"
                          ? "bg-white text-red-600 shadow-xs"
                          : "text-slate-500"
                      }`}
                    >
                      Persen (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMarkupType("fixed");
                        setMarkupValue(0.1);
                      }}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        markupType === "fixed"
                          ? "bg-white text-red-600 shadow-xs"
                          : "text-slate-500"
                      }`}
                    >
                      Fixed ($)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nilai Margin</label>
                  <div className="relative">
                    {markupType === "fixed" && (
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold pointer-events-none">
                        $
                      </span>
                    )}
                    <input
                      type="number"
                      step={markupType === "percent" ? "1" : "0.01"}
                      value={markupValue}
                      onChange={(e) => setMarkupValue(Number(e.target.value) || 0)}
                      className={`w-full py-2 pr-8 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-red-500 focus:outline-none ${
                        markupType === "fixed" ? "pl-7" : "pl-3.5"
                      }`}
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs font-bold pointer-events-none">
                      {markupType === "percent" ? "%" : "$"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Desimal</label>
                  <select
                    value={roundingOption}
                    onChange={(e) => setRoundingOption(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="4">4 Desimal ($0.0001)</option>
                    <option value="3">3 Desimal ($0.001)</option>
                    <option value="2">2 Desimal ($0.01)</option>
                  </select>
                </div>
              </div>

              {/* Price Simulation & Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 accent-red-600"
                  />
                  <span>Perbarui jika sudah ada di database</span>
                </label>

                <div className="text-slate-600 font-mono text-[11px] flex items-center gap-3">
                  <span>Simulasi $1.00 &rarr; <strong className="text-red-600">{formatUSD(calculatePrices(1).rateSale, Number(roundingOption))}</strong></span>
                  <span>(Profit +{formatUSD(calculatePrices(1).profit, Number(roundingOption))})</span>
                </div>
              </div>

              {/* Success Result Display if completed */}
              {importResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{importResult.created_count}</strong> ditambahkan,{" "}
                      <strong>{importResult.updated_count}</strong> diperbarui,{" "}
                      <strong>{importResult.skipped_count}</strong> dilewati.
                    </span>
                  </div>
                  <Link
                    href="/admin/service"
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Katalog Layanan &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Step 3 Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isSaving || selectedIds.size === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Simpan {selectedIds.size} Layanan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Create Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-red-600" />
                <span>Buat Kategori Baru</span>
              </h3>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Platform
                </label>
                <select
                  value={newCatPlatformId}
                  onChange={(e) => setNewCatPlatformId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: Instagram Followers"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-red-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCatName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingCategory ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Buat Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
