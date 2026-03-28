"use client";
import { useEffect } from "react";

interface BingoAlertProps {
  gridLabel: string;
  playerName: string;
}

function playBingoSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = "triangle";

      const start = ctx.currentTime + i * 0.12;
      const end = start + 0.25;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.start(start);
      osc.stop(end);
    });
  } catch {
    // Audio not available
  }
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
