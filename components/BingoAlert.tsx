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
    <div className="relative overflow-hidden rounded-2xl bg-bingo-violet p-4 animate-pop_in">
      {/* Glow rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full border-4 border-white/20 animate-ping" />
      </div>
      <div className="relative z-10 text-center">
        <p className="font-anton text-5xl text-white animate-pulse_bingo tracking-wider">
          🎉 BINGO !
        </p>
        <p className="mt-1 font-dm text-white/80 text-sm">
          {playerName} · {gridLabel}
        </p>
      </div>
    </div>
  );
}
