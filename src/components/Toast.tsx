"use client";

import React, { useEffect, useState } from "react";

export type ToastType = "info" | "success" | "error";

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  id,
  title,
  message,
  type = "info",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isExiting, setIsExiting] = useState(false); // State pemicu animasi Pop-Close

  // Fungsi pengadang agar menjalankan animasi keluar dulu sebelum unmount penuh
  const triggerClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // 300ms sesuai durasi keyframe popupOut
  };

  useEffect(() => {
    const start = Date.now();
    const tick = 100;
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setRemaining(Math.max(0, duration - elapsed));
    }, tick);

    const to = setTimeout(() => triggerClose(), duration);

    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, [id, duration]);

  const percent = Math.round((remaining / duration) * 100);

  const color =
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-[#70C7FF]";

  return (
    /* Di sini kelas dari globals.css dipanggil secara dinamis bergantian */
    <div className={`w-[380px] max-w-full bg-white shadow-[0_15px_35px_rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden border border-gray-100 font-sans transition-all will-change-transform
      ${isExiting ? "animate-popup-out" : "animate-popup-in"}`}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="mt-0.5 font-bold text-sm">
          {type === "success" && <span className="text-green-500">✓</span>}
          {type === "error" && <span className="text-red-500">✕</span>}
          {type === "info" && <span className="text-[#00A3FF]">i</span>}
        </div>

        <div className="flex-1">
          {title && <div className="font-extrabold text-sm text-black mb-0.5">{title}</div>}
          <div className="text-xs text-[#797979] font-medium leading-relaxed">{message}</div>
        </div>

        <button
          aria-label="close"
          onClick={triggerClose}
          className="text-gray-300 hover:text-black transition-colors text-xs p-0.5"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <div className="w-32 h-[3px] bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`${color} h-full transition-[width] duration-100 linear`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-[10px] font-bold text-[#797979] tracking-wider">
          {Math.ceil(remaining / 1000)}s
        </div>
      </div>
    </div>
  );
}