"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "info";
  action?: { label: string; href: string };
}

interface ToastContextValue {
  notify: (message: string, opts?: { tone?: "success" | "info"; action?: Toast["action"] }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const notify = useCallback<ToastContextValue["notify"]>((message, opts) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, tone: opts?.tone ?? "success", action: opts?.action }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card-hover"
            >
              <span className={t.tone === "success" ? "text-success" : "text-info"}>
                {t.tone === "success" ? (
                  <CheckCircle2 className="size-5" aria-hidden />
                ) : (
                  <Info className="size-5" aria-hidden />
                )}
              </span>
              <div className="flex-1 text-sm text-ink">
                <p>{t.message}</p>
                {t.action && (
                  <a href={t.action.href} className="mt-1 inline-block font-semibold text-primary-700 hover:underline">
                    {t.action.label}
                  </a>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
