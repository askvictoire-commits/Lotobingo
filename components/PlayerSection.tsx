"use client";
import { Plus } from "lucide-react";
import { Player, PLAYER_COLORS } from "@/lib/types";
import { useLotoContext } from "@/lib/LotoContext";
import GridEditor from "./GridEditor";

interface PlayerSectionProps {
  player: Player;
}

export default function PlayerSection({ player }: PlayerSectionProps) {
  const { addGrid } = useLotoContext();
  const colors = PLAYER_COLORS[player.name];

  return (
    <section className="mb-8">
      {/* Player header */}
      <div className={`flex items-center gap-3 mb-4 px-1`}>
        <div className={`w-1 h-8 rounded-full ${colors.accent}`} />
        <h2 className={`font-anton text-3xl tracking-wide ${colors.text}`}>
          {player.name}
        </h2>
        <span className="ml-auto font-dm text-xs text-gray-400">
          {player.grids.length} grille{player.grids.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Grids */}
      <div className="space-y-3">
        {player.grids.map((grid, idx) => (
          <GridEditor
            key={grid.id}
            grid={grid}
            gridIndex={idx}
            playerName={player.name}
            canDelete={player.grids.length > 1}
          />
        ))}
      </div>

      {/* Add grid button */}
      <button
        onClick={() => addGrid(player.name)}
        className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed ${colors.text} border-current/30 hover:bg-current/5 transition-all duration-200 font-dm text-sm font-medium`}
        style={{ borderColor: "currentColor", opacity: 0.7 }}
      >
        <Plus size={16} />
        Ajouter une grille
      </button>
    </section>
  );
}
