"use client";

import React, { useEffect, useState } from "react";

export type ToastType = "info" | "success" | "error";

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms
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

  useEffect(() => {
    const start = Date.now();
    const tick = 100;
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setRemaining(Math.max(0, duration - elapsed));
    }, tick);

    const to = setTimeout(() => onClose(id), duration);

    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, [id, duration, onClose]);

  const percent = Math.round((remaining / duration) * 100);

  const color =
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="w-96 max-w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="p-3 flex items-start gap-3">
        <div className="flex-1">
          {title && <div className="font-semibold text-sm mb-1">{title}</div>}
          <div className="text-sm text-slate-700 dark:text-slate-200">{message}</div>
        </div>
        <button
          aria-label="close"
          onClick={() => onClose(id)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          ✕
        </button>
      </div>

      <div className="h-1 bg-slate-100 dark:bg-slate-700">
        <div
          className={`${color} h-1 transition-[width] duration-100 linear`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400 text-right">{Math.ceil(remaining / 1000)}s</div>
    </div>
  );
}
