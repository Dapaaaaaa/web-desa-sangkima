"use client";

import React, { useEffect } from "react";

interface ToastProps {
  id: string;
  message: string;
  title: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose: (id: string) => void;
  isExiting?: boolean;
}

export default function Toast({
  id,
  message,
  title,
  type,
  duration = 4000,
  onClose,
  isExiting = false,
}: ToastProps) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // 🎨 PEMETAAN WARNA EDITORIAL INSTITUSIONAL (STAY ON YOUR THEME)
  const themeStyles = {
    success: {
      bg: "bg-[#F4F6F4]",
      border: "border-[#D2DDD2]",
      accentBar: "bg-pine-900",
      sliderBg: "bg-pine-900/30", // Warna dasar slider
      sliderFill: "bg-pine-900",   // Warna isi progress yang menyusut
      titleColor: "text-pine-900",
      iconColor: "text-pine-900",
      icon: "✓",
    },
    error: {
      bg: "bg-[#FAF4F4]",
      border: "border-[#EFE2E2]",
      accentBar: "bg-[#8B2626]",
      sliderBg: "bg-[#8B2626]/20",
      sliderFill: "bg-[#8B2626]",
      titleColor: "text-[#8B2626]",
      iconColor: "text-[#8B2626]",
      icon: "✕",
    },
    info: {
      bg: "bg-[#FAF7F2]",
      border: "border-[#EFEAE2]",
      accentBar: "bg-brass",
      sliderBg: "bg-brass/20",
      sliderFill: "bg-brass",
      titleColor: "text-pine-900",
      iconColor: "text-brass",
      icon: "§",
    },
  };

  const currentTheme = themeStyles[type] || themeStyles.info;

  return (
    <div
      className={`relative flex flex-col min-w-[340px] max-w-[440px] bg-paper border ${currentTheme.border} rounded-sm shadow-md overflow-hidden transition-all duration-300 font-sans pointer-events-auto
        ${isExiting ? "animate-popup-out" : "animate-popup-in"}`}
    >
      {/* Area Konten Atas */}
      <div className="flex items-stretch flex-1">
        {/* Indicator Bar Samping Kiri (Garis Pinggir Dokumen Resmi) */}
        <div className={`w-1.5 ${currentTheme.accentBar} shrink-0`} />

        {/* Konten Utama Toast */}
        <div className={`flex-1 p-4 flex items-start gap-3 ${currentTheme.bg}`}>
          
          {/* Lingkaran Ikon Minimalis Berbingkai Dokumen */}
          <div className={`w-6 h-6 rounded-full border ${currentTheme.border} grid place-items-center text-[11px] font-bold shrink-0 mt-0.5 ${currentTheme.iconColor} bg-paper`}>
            {currentTheme.icon}
          </div>

          {/* Detail Teks Notifikasi */}
          <div className="flex-1 flex flex-col gap-0.5">
            <h4 className={`font-serif font-medium text-sm tracking-tight min-h-[24px] flex items-center ${currentTheme.titleColor}`}>
              {title}
            </h4>
            <p className="text-xs text-inkmut leading-relaxed mt-0.5">
              {message}
            </p>
          </div>

          {/* Tombol Silang Mikro Posisi Kanan */}
          <button
            onClick={() => onClose(id)}
            aria-label="Tutup notifikasi"
            className={`w-5 h-5 rounded-full border ${currentTheme.border} grid place-items-center text-[9px] text-inkmut/50 hover:text-pine-900 hover:border-inkmut/30 bg-paper transition-all active:scale-90 shrink-0 mt-0.5 ml-2`}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ⏳ SLIDER COUNTDOWN TIMELINE (PEMBERITAHUAN AUTO-CLOSE)
          - Diletakkan di paling bawah boks.
          - Menggunakan animasi inline style `shrink-width` dengan durasi dinamis sesuai `duration` props.
      */}
      <div className={`w-full h-[2px] ${currentTheme.sliderBg} relative`}>
        <div
          className={`h-full ${currentTheme.sliderFill}`}
          style={{
            animation: `shrink-width ${duration}ms linear forwards`,
            transformOrigin: "left",
          }}
        />
      </div>

      {/* 🛠️ Inject CSS Animasi Langsung via Tag Style (Agar tidak perlu mengotori globals.css kamu lagi) */}
      <style jsx global>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}