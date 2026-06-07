"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast, { ToastProps } from "./Toast";

type ShowToastOptions = {
  title?: string;
  message: string;
  type?: "info" | "success" | "error";
  duration?: number;
};

type ToastContextValue = {
  showToast: (opts: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((opts: ShowToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: ToastProps = {
      id,
      title: opts.title,
      message: opts.message,
      type: opts.type || "info",
      duration: opts.duration ?? 4000,
      onClose: remove,
    };
    // Item baru masuk di index 0 (paling depan tumpukan)
    setToasts((s) => [toast, ...s]);
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* 📍 STACK CONTROLLER POJOK KANAN ATAS
        - Di HP maupun PC, wadah utama dikunci mati di pojok kanan atas (`top-4 right-4`).
        - `pointer-events-none`: Menjamin layar sentuh di area kosong tidak macet.
      */}
      <div className="fixed z-[99999] top-4 right-4 w-auto h-auto flex justify-end items-start pointer-events-none">
        <div className="relative w-full h-full flex flex-col items-end">
          {toasts.map((t, index) => (
            <div 
              key={t.id} 
              className="pointer-events-auto absolute top-0 right-0 max-w md:max-w-[360px] transition-all duration-300 ease-out"
              style={{
                // 🎛️ MEKANISME TUMPUKAN MEKANIK:
                // - `zIndex`: Index 0 (terbaru) ditaruh di paling depan layar.
                // - `translateY`: Digeser ke bawah perlahan sebanyak 12px per tumpukan di belakangnya.
                // - `scale`: Mengecil perlahan ke belakang (1, 0.95, 0.90) menciptakan efek 3D Stack.
                zIndex: 100 - index,
                transform: `translateY(${index * 12}px) scale(${1 - index * 0.04})`,
                opacity: index > 2 ? 0 : 1 - index * 0.25,
              }}
            >
              <Toast {...t} />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}