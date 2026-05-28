"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "rgba(15, 13, 12, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e7e5e4",
          backdropFilter: "blur(12px)",
        },
      }}
    />
  );
}
