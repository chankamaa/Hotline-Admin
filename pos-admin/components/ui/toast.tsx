"use client";

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: {
    bg: "bg-green-500",
    text: "text-white",
  },
  error: {
    bg: "bg-red-500",
    text: "text-white",
  },
  warning: {
    bg: "bg-orange-500",
    text: "text-white",
  },
  info: {
    bg: "bg-blue-500",
    text: "text-white",
  },
};

export function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div
      className={`
        flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg
        ${colors.bg} ${colors.text}
        transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        min-w-[320px] max-w-md
      `}
    >
      {/* Icon */}
      <Icon className="shrink-0" size={20} />

      {/* Message */}
      <p className="flex-1 text-sm font-medium">{message}</p>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="hover:opacity-80 transition-opacity shrink-0"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </div>
  );
}
