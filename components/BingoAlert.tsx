"use client";
import { useEffect } from "react";
import { playBingoSound } from "@/lib/sounds";

interface BingoAlertProps {
  gridLabel: string;
  playerName: string;
}

export default function BingoAlert({ gridLabel, playerName }: BingoAlertProps) {
  useEffect(() => {
    playBingoSound();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl h-[180px] animate-pop_in shadow-md bg-[url('/bingo.png')] bg-cover bg-center">
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
