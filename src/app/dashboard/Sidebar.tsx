"use client";

import React from "react";

type Role = "warga" | "staff" | "admin";

interface SidebarProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ currentRole, setCurrentRole, activeMenu, setActiveMenu }: SidebarProps) {
  
  // 📄 MAPPING SINKRONISASI SIDEBAR MENU BERDASARKAN ROLE (STAY ON YOUR STYLE)
  const menuItems = {
    warga: [
      { name: "Beranda", icon: "📊" },
      { name: "Pengajuan Surat", icon: "✈" },
      { name: "Daftar Pengajuan", icon: "📁" },
      { name: "Data Pribadi", icon: "👤" },
    ],
    staff: [
      { name: "Beranda", icon: "📊" },
      { name: "Verifikasi Surat", icon: "🔎" },
      { name: "Daftar Pengajuan", icon: "📁" },
      { name: "Arsip Surat", icon: "🗄" },
    ],
    admin: [
      { name: "Beranda", icon: "📊" },
      { name: "Kelola Pengguna", icon: "👥" },
      { name: "Kelola Template Surat", icon: "⚙" },
      { name: "Log Aktivitas Sistem", icon: "📜" },
    ],
  };

  return (
    <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col justify-between p-5 shrink-0 hidden md:flex">
      <div className="flex flex-col gap-8">
        {/* Logo Brand Identitas */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[#E1E1E1] shrink-0" />
          <span className="text-black font-extrabold text-base tracking-wide">E-Surat Desa</span>
        </div>

        {/* Navigasi List Menu Berdasarkan Role */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase px-2 mb-2">Menu ({currentRole})</span>
          {menuItems[currentRole].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveMenu(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeMenu === item.name
                  ? "bg-[#70C7FF] text-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* ⚙️ Switcher Role Dev Helper (Memudahkan kamu saat demo di depan dosen/mahasiswa) */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <span className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Switch Role (Dev Mode):</span>
        <div className="flex gap-1">
          {(["warga", "staff", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => { setCurrentRole(r); setActiveMenu("Beranda"); }}
              className={`flex-1 text-[10px] font-bold py-1 rounded capitalize transition-all ${
                currentRole === r ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {r === "warga" ? "User" : r}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}