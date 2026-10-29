import React from "react";
import { Download, ArrowUpRight } from "lucide-react";

export default function AdminReportPage() {
  const reports = [
    {
      date: "26 Okt 2026",
      totalOrders: 942,
      omset: "$4,820.00",
      modal: "$3,120.00",
      profit: "$1,700.00",
      successRate: "99.2%",
    },
    {
      date: "25 Okt 2026",
      totalOrders: 1120,
      omset: "$5,640.00",
      modal: "$3,680.00",
      profit: "$1,960.00",
      successRate: "99.5%",
    },
    {
      date: "24 Okt 2026",
      totalOrders: 890,
      omset: "$4,210.00",
      modal: "$2,740.00",
      profit: "$1,470.00",
      successRate: "98.8%",
    },
    {
      date: "23 Okt 2026",
      totalOrders: 1050,
      omset: "$5,120.00",
      modal: "$3,330.00",
      profit: "$1,790.00",
      successRate: "99.1%",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan &amp; Analitik
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan omset, laba bersih, dan riwayat pesanan.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-red-400 hover:text-red-600 transition-colors shadow-xs self-start sm:self-auto cursor-pointer">
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Omset Bulan Ini</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">$128,450.00</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% dari bulan lalu</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Estimasi Laba Bersih</span>
          <div className="text-2xl font-extrabold text-red-600 mt-1">$42,180.00</div>
          <div className="text-xs text-slate-500 mt-1">Rata-rata margin: 32.8%</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Pesanan</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">26,480 Pesanan</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Tingkat sukses: 99.3%</div>
        </div>
      </div>

      {/* Report History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Rekap Harian</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pesanan</th>
                <th className="py-3 px-4">Omset ($)</th>
                <th className="py-3 px-4">Biaya Modal ($)</th>
                <th className="py-3 px-4">Laba Bersih ($)</th>
                <th className="py-3 px-4">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{r.totalOrders} order</td>
                  <td className="py-3 px-4 font-bold font-mono text-slate-900">{r.omset}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{r.modal}</td>
                  <td className="py-3 px-4 font-extrabold text-red-600 font-mono">{r.profit}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {r.successRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
