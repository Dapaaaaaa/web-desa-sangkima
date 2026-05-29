"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
    setToasts((s) => [toast, ...s]);
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  // Expose a dev helper on window to trigger toasts from console
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.showToast = ({ message, title, type }: { message: string; title?: string; type?: "info" | "success" | "error" }) => {
        showToast({ message, title, type });
      };
      return () => {
        try {
          delete window.showToast;
        } catch (e) {
          // ignore
        }
      };
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Container top-right */}
      <div className="fixed z-50 top-4 right-4 flex flex-col gap-3 items-end">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Expose types for manual usage
declare global {
  interface Window {
    showToast?: (opts: { message: string; title?: string; type?: "info" | "success" | "error" }) => void;
  }
}

