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
    const t = setTimeout(close, 4000); // 4sec giving time to view the image
    return () => clearTimeout(t);
  }, [close]);

  // Nettoyage: extraire "Prénom Grille N ligne N" de l'ancien message "🎯 QUINE — Prénom..."
  const cleanMessage = message.replace("🎯 QUINE — ", "").replace(" !", "");

  return (
    <div
      className="relative overflow-hidden w-64 h-24 rounded-2xl shadow-[0_8px_30px_rgba(123,47,255,0.4)] animate-pop_in cursor-pointer bg-[url('/quine.png')] bg-cover bg-center"
      onClick={close}
    >
      {/* Léger gradient pour la lisibilité */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent h-2/3 pointer-events-none" />

      <div className="absolute bottom-2 left-3 flex flex-col z-10 text-left">
        <span className="font-anton text-[20px] text-white tracking-wide leading-tight">
          QUINE !
        </span>
        <span className="font-dm text-[9px] text-white/90">
          {cleanMessage}
        </span>
      </div>
    </div>
  );
}
