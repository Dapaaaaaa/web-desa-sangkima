"use client";

import { useCallback } from "react";
import { useToastContext } from "@/components/ToastProvider";

export function useToast() {
  const { showToast } = useToastContext();

  const toast = useCallback(
    (message: string, title?: string, type: "info" | "success" | "error" = "info", duration?: number) => {
      showToast({ message, title, type, duration });
    },
    [showToast],
  );

  return { toast };
}
