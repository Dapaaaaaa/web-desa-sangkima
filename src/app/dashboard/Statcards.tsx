"use client";

import React from "react";

type Role = "warga" | "staff" | "admin";

interface StatCardsProps {
  currentRole: Role;
}

export default function StatCards({ currentRole }: StatCardsProps) {
  
  // 📄 DATA SIMULASI AKTIVITAS SURAT (SESUAI GAMBAR KARTU GRID FIGMA KAMU)
  const statsData = {
    warga: [
      { title: "Surat Masuk", count: 10, color: "bg-[#00A3FF]", icon: "📩" },
      { title: "Surat Diproses", count: 10, color: "bg-[#FFA800]", icon: "⚙" },
      { title: "Surat Selesai", count: 10, color: "bg-[#00CC66]", icon: "✓" },
      { title: "Surat Ditolak", count: 10, color: "bg-[#FF3B30]", icon: "✕" },
    ],
    staff: [
      { title: "Perlu Verifikasi", count: 24, color: "bg-[#FFA800]", icon: "⏳" },
      { title: "Total Diarsip", count: 142, color: "bg-[#00A3FF]", icon: "🗄" },
      { title: "Disetujui Hari Ini", count: 15, color: "bg-[#00CC66]", icon: "✓" },
    ],
    admin: [
      { title: "Total Pengguna Aktif", count: 1250, color: "bg-[#00A3FF]", icon: "👥" },
      { title: "Surat Terproses Sistem", count: 3401, color: "bg-[#00CC66]", icon: "🖥" },
      { title: "Sistem Error Log", count: 0, color: "bg-[#FF3B30]", icon: "🚨" },
    ],
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData[currentRole].map((card, i) => (
        <div key={i} className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex items-center justify-between transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#797979] font-semibold">{card.title}</span>
            <span className="text-2xl font-extrabold text-black leading-none">{card.count}</span>
          </div>
          <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center text-lg shadow-sm font-bold select-none`}>
            {card.icon}
          </div>
        </div>
      ))}
    </section>
  );
}