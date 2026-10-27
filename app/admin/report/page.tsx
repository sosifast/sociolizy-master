import React from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export default function AdminReportPage() {
  const reports = [
    {
      date: "26 Okt 2026",
      totalOrders: 942,
      omset: "Rp 4.820.000",
      modal: "Rp 3.120.000",
      profit: "Rp 1.700.000",
      successRate: "99.2%",
    },
    {
      date: "25 Okt 2026",
      totalOrders: 1120,
      omset: "Rp 5.640.000",
      modal: "Rp 3.680.000",
      profit: "Rp 1.960.000",
      successRate: "99.5%",
    },
    {
      date: "24 Okt 2026",
      totalOrders: 890,
      omset: "Rp 4.210.000",
      modal: "Rp 2.740.000",
      profit: "Rp 1.470.000",
      successRate: "98.8%",
    },
    {
      date: "23 Okt 2026",
      totalOrders: 1050,
      omset: "Rp 5.120.000",
      modal: "Rp 3.330.000",
      profit: "Rp 1.790.000",
      successRate: "99.1%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
              Laporan Finansial & Transaksi
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan & Analitik SMM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Analisis perputaran omset, margin keuntungan bersih (profit), dan tingkat keberhasilan pesanan.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-red-400 hover:text-red-600 transition-colors shadow-xs self-start sm:self-auto cursor-pointer">
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Excel / CSV</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Omset Bulan Ini</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">Rp 128.450.000</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% dibanding bulan lalu</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Estimasi Keuntungan Bersih</span>
          <div className="text-2xl font-extrabold text-red-600 mt-1">Rp 42.180.000</div>
          <div className="text-xs text-slate-500 mt-1">Rata-rata margin: 32.8%</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Pesanan Diproses</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">26,480 Pesanan</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Tingkat sukses: 99.3%</div>
        </div>
      </div>

      {/* Report History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">Rekap Harian Transaksi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Tanggal</th>
                <th className="py-3.5 px-5">Total Pesanan</th>
                <th className="py-3.5 px-5">Total Omset</th>
                <th className="py-3.5 px-5">Biaya Modal API</th>
                <th className="py-3.5 px-5">Laba Bersih (Profit)</th>
                <th className="py-3.5 px-5">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{r.date}</td>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">{r.totalOrders} order</td>
                  <td className="py-3.5 px-5 font-bold font-mono text-slate-900">{r.omset}</td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">{r.modal}</td>
                  <td className="py-3.5 px-5 font-extrabold text-red-600 font-mono">{r.profit}</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
