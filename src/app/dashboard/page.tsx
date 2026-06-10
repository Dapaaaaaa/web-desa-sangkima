"use client";

import React, { useState } from "react";
import Sidebar from "@/app/dashboard/Sidebar";
import StatCards from "@/app/dashboard/Statcards";
import ActivityTable from "@/app/dashboard/ActivityTable";

// Definisikan tipe Role untuk memastikan type-safety lintas platform
type Role = "warga" | "staff" | "admin";

export default function DashboardPage() {
  // 💡 Simulasi State Role: Silakan ganti nilai string ini ("warga", "staff", atau "admin") untuk menguji tampilan tiap role
  const [currentRole, setCurrentRole] = useState<Role>("warga");
  const [activeMenu, setActiveMenu] = useState("Beranda");

  return (
    // Pembungkus Paling Luar: Menggunakan min-h-screen untuk memastikan latar belakang #EEEEEE memenuhi layar di semua OS
    <div className="min-h-screen bg-[#EEEEEE] flex font-sans select-none overflow-x-hidden">
      
      {/* 🧭 KANAN/KIRI LAYERING: SIDEBAR MENU UTAMA */}
      <Sidebar 
        currentRole={currentRole} 
        setCurrentRole={setCurrentRole} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />

      {/* 🖥️ KONTEN UTAMA DASHBOARD */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* 1. LAYER ATAS: CARD KARTU SELAMAT DATANG USER */}
        <header className="w-full bg-white rounded-[16px] p-5 shadow-sm flex justify-between items-center border border-gray-100">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-black font-extrabold text-base md:text-lg">
              Selamat datang, {currentRole === "warga" ? "Username" : currentRole === "staff" ? "Staff Administrasi" : "Super Admin"}
            </h1>
            <span className="text-xs text-[#797979] font-medium">Kicaumaniaa@gmail.com</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E1E1E1]" />
        </header>

        {/* 2. LAYER TENGAH: GRID STATISTIK DINAMIS MENGIKUTI ROLE */}
        <StatCards currentRole={currentRole} />

        {/* 3. LAYER BAWAH: WIDGET TABEL AKTIVITAS SURAT TERBARU */}
        <ActivityTable />

      </main>
    </div>
  );
}