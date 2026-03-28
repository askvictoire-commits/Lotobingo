"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLotoContext } from "@/lib/LotoContext";
import PlayerSection from "@/components/PlayerSection";

export default function SetupPage() {
  const { session, loaded } = useLotoContext();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-bingo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-anton text-4xl text-gray-900 tracking-wide">Mes Grilles</h1>
        <p className="font-dm text-sm text-gray-400 mt-1">
          Saisissez les numéros des grilles de chaque joueuse
        </p>
      </div>

      {/* Player sections */}
      {session.players.map((player) => (
        <PlayerSection key={player.name} player={player} />
      ))}

      {/* CTA */}
      <div className="sticky bottom-20 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
        <Link
          href="/game"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-bingo-blue text-white font-anton text-xl tracking-wider shadow-[0_4px_20px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_25px_rgba(0,102,255,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Commencer à jouer
          <ArrowRight size={22} />
        </Link>
      </div>
    </div>
  );
}
