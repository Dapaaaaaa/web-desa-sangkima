"use client";

import React from "react";

export default function ActivityTable() {
  
  // 📄 DATA SIMULASI REKAPITULASI SURAT (SESUAI GAMBAR TABEL FIGMA KAMU)
  const tableData = [
    { no: 1, nomor: "-", judul: "Penertiban SK Aslab", pengaju: "Wahyu Aditya", tanggal: "12-12-2012", status: "Surat Masuk" },
    { no: 2, nomor: "1/APD/2026", judul: "Penertiban SK Aslab", pengaju: "Nabil", tanggal: "12-12-2012", status: "Disetujui" },
    { no: 3, nomor: "-", judul: "Penertiban SK Aslab", pengaju: "Ikhwan Hariyanto", tanggal: "12-12-2012", status: "Ditolak" },
    { no: 4, nomor: "-", judul: "Penertiban SK Aslab", pengaju: "Muhammad Naufal Adi B.P.S.P", tanggal: "12-12-2012", status: "Ditolak" },
    { no: 5, nomor: "-", judul: "Penertiban SK Aslab", pengaju: "Ridwan Nur Rahman", tanggal: "12-12-2012", status: "Diproses" },
    { no: 6, nomor: "2/APD/2026", judul: "Penertiban SK Aslab", pengaju: "Sifwah Fatin Sofwani", tanggal: "12-12-2012", status: "Disetujui" },
    { no: 7, nomor: "1/APL/2026", judul: "Penertiban SK Aslab", pengaju: "Riva", tanggal: "12-12-2012", status: "Disetujui" },
  ];

  return (
    <section className="w-full bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-black font-extrabold text-base">Aktivitas Surat Terbaru</h2>
        <span className="text-xs text-[#797979] font-medium">Status Surat Terakhir</span>
      </div>

      {/* Baris Kontrol: Input Cari Surat & Filter Dropdown */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center mt-2">
        <div className="relative w-full md:max-w-[400px]">
          <input
            type="text"
            placeholder="Cari Surat..."
            className="w-full bg-[#E1E1E1] border-none rounded-lg py-2.5 px-4 text-xs text-black outline-none placeholder-[#797979] transition-all focus:ring-2 focus:ring-[#70C7FF]/40"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["Judul", "Status", "Tanggal"].map((filter) => (
            <button key={filter} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 shrink-0">
              {filter} <span className="text-[10px] text-gray-400">▼</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pembungkus Tabel dengan Fitur Responsive Scroll Over */}
      <div className="w-full overflow-x-auto mt-2 rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
              <th className="py-3 px-4 w-12">No</th>
              <th className="py-3 px-4">Nomor Surat</th>
              <th className="py-3 px-4">Judul</th>
              <th className="py-3 px-4">Nama Pengaju</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs text-black font-medium divide-y divide-gray-50">
            {tableData.map((row) => (
              <tr key={row.no} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-gray-400">{row.no}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.nomor}</td>
                <td className="py-3.5 px-4 font-bold">{row.judul}</td>
                <td className="py-3.5 px-4 text-gray-700">{row.pengaju}</td>
                <td className="py-3.5 px-4 text-gray-500">{row.tanggal}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                    row.status === "Surat Masuk" ? "bg-[#00A3FF] text-white" :
                    row.status === "Disetujui" ? "bg-[#00CC66] text-white" :
                    row.status === "Ditolak" ? "bg-[#FF3B30] text-white" :
                    "bg-[#FFA800] text-white"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button className="bg-[#00A3FF] hover:bg-[#0082cc] text-white px-3 py-1 rounded-md text-[10px] font-bold transition-all shadow-sm active:scale-95">
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Baris Footer Pagination Tabel */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-2 pt-2 border-t border-t-gray-50">
        <span className="text-[11px] text-gray-500 font-medium">Tampilan 1 sampai 7 dari 7 entri</span>
        <div className="flex gap-1">
          {["Awal", "Balik", "1", "Lanjut", "Akhir"].map((page, i) => (
            <button
              key={i}
              disabled={page !== "1"}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all ${
                page === "1"
                  ? "bg-[#00A3FF] text-white border-[#00A3FF] shadow-sm"
                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </footer>
    </section>
  );
}