"use client";
import { useEffect } from "react";
import { playBingoSound } from "@/lib/sounds";
import { X } from "lucide-react";

interface BingoAlertProps {
  gridLabel: string;
  playerName: string;
  onClose?: () => void;
}

export default function BingoAlert({ gridLabel, playerName, onClose }: BingoAlertProps) {
  useEffect(() => {
    playBingoSound();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl h-[180px] animate-pop_in shadow-md bg-[url('/bingo.png')] bg-cover bg-center">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-30 bg-black/40 p-1.5 rounded-full text-white hover:bg-black/70 pointer-events-auto transition-colors shadow-sm"
        >
          <X size={16} />
        </button>
      )}
      {/* Léger dégradé pour que le texte reste lisible */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent h-1/2 pointer-events-none" />
      
      <div className="absolute bottom-3 left-4 flex flex-col z-10 text-left">
        <p className="font-anton text-[20px] text-white tracking-wider animate-pulse_bingo">
          BINGO !
        </p>
        <p className="font-dm text-white/90 text-[11px]">
          {playerName} · {gridLabel}
        </p>
      </div>
    </div>
  );
}
