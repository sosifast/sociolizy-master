"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  pageSizeOptions?: number[];
}

export default function MemberTablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50],
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (safeTotalPages <= 1) return [1];
    const pages: (number | string)[] = [];
    if (safeTotalPages <= 5) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", safeTotalPages);
      } else if (currentPage >= safeTotalPages - 2) {
        pages.push(1, "...", safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", safeTotalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
      {/* Left: Summary and Page Size */}
      <div className="flex items-center gap-3 flex-wrap">
        <span>
          Showing <strong className="text-slate-800">{startItem}</strong> -{" "}
          <strong className="text-slate-800">{endItem}</strong> of{" "}
          <strong className="text-slate-900">{totalItems}</strong> records
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <label htmlFor="per-page-select" className="text-slate-500 text-[11px]">
              Per page:
            </label>
            <select
              id="per-page-select"
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || totalItems === 0}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || totalItems === 0}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numeric Buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-slate-400 font-bold">
                ...
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={totalItems === 0}
              className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/25"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
          disabled={currentPage >= safeTotalPages || totalItems === 0}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage >= safeTotalPages || totalItems === 0}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
