"use client";
import { useEffect, useCallback } from "react";

interface QuineToastProps {
  id: string;
  message: string;
  onClose: (id: string) => void;
}

export default function QuineToast({ id, message, onClose }: QuineToastProps) {
  const close = useCallback(() => onClose(id), [id, onClose]);

  useEffect(() => {
    const t = setTimeout(close, 3000);
    return () => clearTimeout(t);
  }, [close]);

  return (
    <div
      className="flex items-center gap-3 bg-bingo-violet text-white rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(123,47,255,0.55)] animate-pop_in cursor-pointer"
      onClick={close}
    >
      <span className="text-2xl leading-none">🎯</span>
      <span className="font-anton text-base tracking-wide leading-tight">{message}</span>
    </div>
  );
}
