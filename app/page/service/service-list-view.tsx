"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  ShoppingCart,
  RefreshCw,
  Globe,
  SlidersHorizontal,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export interface PublicServiceItem {
  id: number;
  uuid: string;
  service_id: string;
  service_name: string;
  slug: string;
  min: number;
  max: number;
  desc: string | null;
  rate_sale: number;
  category?: {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
    platform?: {
      id: number;
      name: string;
      slug: string;
      icon?: string | null;
    } | null;
  } | null;
}

interface ServiceListViewProps {
  initialServices: PublicServiceItem[];
}

export default function ServiceListView({ initialServices }: ServiceListViewProps) {
  const [services, setServices] = useState<PublicServiceItem[]>(initialServices || []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search State
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("id_asc");

  // Pagination State - Default 10 per page
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Service Detail Modal State
  const [selectedService, setSelectedService] = useState<PublicServiceItem | null>(null);

  // Extract unique platforms
  const platformList = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    services.forEach((s) => {
      const pName = s.category?.platform?.name || "Other";
      const existing = map.get(pName);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(pName, { name: pName, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [services]);

  // Extract available categories based on selected platform
  const categoryList = useMemo(() => {
    const map = new Map<string, { id: number; name: string; platformName?: string }>();
    services.forEach((s) => {
      if (s.category) {
        const platName = s.category.platform?.name || "Other";
        if (selectedPlatform === "all" || platName.toLowerCase() === selectedPlatform.toLowerCase()) {
          const key = String(s.category.id);
          if (!map.has(key)) {
            map.set(key, {
              id: s.category.id,
              name: s.category.name,
              platformName: platName,
            });
          }
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [services, selectedPlatform]);

  // Reset category filter if not in current platform
  useEffect(() => {
    if (selectedCategory !== "all") {
      const exists = categoryList.some((c) => String(c.id) === selectedCategory);
      if (!exists) {
        setSelectedCategory("all");
      }
    }
  }, [selectedPlatform, categoryList, selectedCategory]);

  // Reset to first page when search/filter inputs change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedPlatform, selectedCategory, itemsPerPage, sortBy]);

  // Filter & Sort services
  const filteredServices = useMemo(() => {
    return services
      .filter((svc) => {
        // Platform filter
        if (selectedPlatform !== "all") {
          const platName = svc.category?.platform?.name || "Other";
          if (platName.toLowerCase() !== selectedPlatform.toLowerCase()) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "all") {
          if (String(svc.category?.id) !== selectedCategory) {
            return false;
          }
        }

        // Text search
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = svc.service_name.toLowerCase().includes(q);
          const matchId =
            String(svc.service_id).toLowerCase().includes(q) ||
            String(svc.id).includes(q);
          const matchCat = svc.category?.name?.toLowerCase().includes(q);
          const matchPlat = svc.category?.platform?.name?.toLowerCase().includes(q);
          const matchDesc = svc.desc?.toLowerCase().includes(q);

          if (!matchName && !matchId && !matchCat && !matchPlat && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "id_desc":
            return b.id - a.id;
          case "price_asc":
            return a.rate_sale - b.rate_sale;
          case "price_desc":
            return b.rate_sale - a.rate_sale;
          case "name_asc":
            return a.service_name.localeCompare(b.service_name);
          case "name_desc":
            return b.service_name.localeCompare(a.service_name);
          case "min_asc":
            return a.min - b.min;
          case "max_desc":
            return b.max - a.max;
          case "id_asc":
          default:
            return a.id - b.id;
        }
      });
  }, [services, selectedPlatform, selectedCategory, search, sortBy]);

  // Pagination calculations
  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  // Refresh data handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setServices(json.data);
      }
    } catch (err) {
      console.error("Failed to refresh services:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Platform Badge Helper
  const getPlatformBadge = (platformName?: string) => {
    const name = platformName?.toLowerCase() || "";
    if (name.includes("instagram")) {
      return "bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-purple-500/15 text-rose-300 border-rose-500/30";
    }
    if (name.includes("tiktok")) {
      return "bg-gradient-to-r from-cyan-500/15 to-pink-500/15 text-cyan-300 border-cyan-500/30";
    }
    if (name.includes("youtube")) {
      return "bg-red-500/15 text-red-300 border-red-500/30";
    }
    if (name.includes("facebook")) {
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
    if (name.includes("twitter") || name.includes(" x")) {
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    }
    if (name.includes("telegram")) {
      return "bg-sky-500/15 text-sky-200 border-sky-400/30";
    }
    if (name.includes("spotify")) {
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
    return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Filter Header Card */}
      <div className="rounded-2xl bg-[#0c1222]/90 backdrop-blur-xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Top Control Bar: Search input & Refresh */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services by name, ID, category, platform..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Refresh & Reset Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {(search || selectedPlatform !== "all" || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedPlatform("all");
                  setSelectedCategory("all");
                  setSortBy("id_asc");
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh services list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              <span>{isRefreshing ? "Loading..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Platform, Category, Sorting, Per Page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Platform Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>Platform</span>
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Platforms ({services.length})</option>
              {platformList.map((plat) => (
                <option key={plat.name} value={plat.name}>
                  {plat.name} ({plat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-indigo-400" />
              <span>Category</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Categories ({categoryList.length})</option>
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.platformName ? `[${cat.platformName}] ` : ""}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-indigo-400" />
              <span>Sort By</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="id_asc">Service ID (Low to High)</option>
              <option value="id_desc">Service ID (High to Low)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="name_asc">Service Name (A - Z)</option>
              <option value="name_desc">Service Name (Z - A)</option>
              <option value="min_asc">Min Order (Low to High)</option>
              <option value="max_desc">Max Order (High to Low)</option>
            </select>
          </div>

          {/* Per Page Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
              <span>Per Page</span>
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value={10}>10 per page (Default)</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table Card */}
      <div className="rounded-2xl bg-[#0c1222]/90 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Table Header Summary */}
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Available Services</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-mono">
              {totalItems} Services
            </span>
          </div>
          {totalItems > 0 && (
            <div>
              Showing <strong className="text-white">{startItem}</strong> -{" "}
              <strong className="text-white">{endItem}</strong> of{" "}
              <strong className="text-white">{totalItems}</strong> services
            </div>
          )}
        </div>

        {/* DataTable Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-20 text-center">ID</th>
                <th className="py-3 px-4 min-w-[280px]">Service</th>
                <th className="py-3 px-4 min-w-[140px]">Platform / Category</th>
                <th className="py-3 px-4 w-32 text-right">Rate / 1K</th>
                <th className="py-3 px-4 w-32 text-center">Min / Max</th>
                <th className="py-3 px-4 w-28 text-center">Details</th>
                <th className="py-3 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-white text-sm">No services found</p>
                        <p className="text-xs text-slate-500">
                          {search
                            ? `No results matching "${search}". Try another keyword.`
                            : "No services match the selected filter criteria."}
                        </p>
                      </div>
                      {(search || selectedPlatform !== "all" || selectedCategory !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setSelectedPlatform("all");
                            setSelectedCategory("all");
                          }}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((svc) => {
                  const platName = svc.category?.platform?.name || "Other";
                  const badgeClass = getPlatformBadge(platName);

                  return (
                    <tr
                      key={svc.id}
                      className="hover:bg-indigo-500/[0.03] transition-colors group"
                    >
                      {/* 1. ID */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-xs font-semibold">
                        <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800/80 group-hover:border-slate-700 transition-colors">
                          #{svc.service_id || svc.id}
                        </span>
                      </td>

                      {/* 2. Service Name */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-medium text-slate-100 group-hover:text-indigo-300 transition-colors leading-relaxed block">
                            {svc.service_name}
                          </span>
                          {svc.category?.name && (
                            <span className="inline-block text-[11px] text-slate-400 font-normal">
                              {svc.category.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Platform & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}
                          >
                            {platName}
                          </span>
                        </div>
                      </td>

                      {/* 4. Price / 1K */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          ${Number(svc.rate_sale).toFixed(4)}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">per 1,000</span>
                      </td>

                      {/* 5. Min / Max */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <div className="text-slate-200">
                          {svc.min.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          up to {svc.max.toLocaleString()}
                        </div>
                      </td>

                      {/* 6. Details Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedService(svc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
                          title="View service details"
                        >
                          <Info className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Details</span>
                        </button>
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/member/order?service=${svc.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Order</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Left: Summary */}
            <div className="text-slate-400 text-center sm:text-left">
              Showing <span className="font-semibold text-white">{startItem}</span> -{" "}
              <span className="font-semibold text-white">{endItem}</span> of{" "}
              <span className="font-semibold text-white">{totalItems}</span> services
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons */}
              {pageNumbers.map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-600 select-none">
                      ...
                    </span>
                  );
                }

                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(Number(pageNum))}
                    className={`min-w-[32px] h-8 px-2.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0c1222] border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                    ID: #{selectedService.service_id || selectedService.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPlatformBadge(
                      selectedService.category?.platform?.name
                    )}`}
                  >
                    {selectedService.category?.platform?.name || "Platform"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedService.service_name}
                </h3>
                {selectedService.category?.name && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: {selectedService.category.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Rate / 1K</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  ${Number(selectedService.rate_sale).toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Min Order</span>
                <span className="text-white font-bold font-mono">
                  {selectedService.min.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Max Order</span>
                <span className="text-white font-bold font-mono">
                  {selectedService.max.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Service Description & Terms</span>
              </h4>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                {selectedService.desc ? (
                  selectedService.desc
                ) : (
                  <p className="text-slate-500 italic">
                    No specific description provided. Orders are processed automatically according to SMM server standards.
                  </p>
                )}
              </div>
            </div>

            {/* Quality & Safety Notes */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                24/7 automated server. Ensure the destination account/post is public while the order is in progress.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/member/order?service=${selectedService.id}`}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Order Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
