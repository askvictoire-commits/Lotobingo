"use client";
import { Trash2 } from "lucide-react";
import { Grid, PlayerName, PLAYER_COLORS } from "@/lib/types";
import { useLotoContext } from "@/lib/LotoContext";

interface GridEditorProps {
  grid: Grid;
  gridIndex: number;
  playerName: PlayerName;
  canDelete: boolean;
}

function validateValue(val: string): number {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 0 || n > 100) return 0;
  return n;
}

export default function GridEditor({ grid, gridIndex, playerName, canDelete }: GridEditorProps) {
  const { updateGridNumber, deleteGrid } = useLotoContext();
  const colors = PLAYER_COLORS[playerName];

  const allNumbers = grid.numbers.flat().filter((n) => n > 0);
  const hasDuplicates = allNumbers.length !== new Set(allNumbers).size;

  return (
    <div className={`rounded-2xl border-2 ${hasDuplicates ? "border-red-400" : "border-transparent"} bg-gray-50 p-4 shadow-sm`}>
      {/* Grid header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`font-anton text-lg tracking-wide ${colors.text}`}>
          Grille {gridIndex + 1}
        </span>
        {canDelete && (
          <button
            onClick={() => deleteGrid(playerName, grid.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} />
            Supprimer
          </button>
        )}
      </div>

      {hasDuplicates && (
        <p className="text-xs text-red-500 font-dm mb-2">⚠️ Doublons détectés dans cette grille</p>
      )}

      {/* 3 rows × 9 cols */}
      <div className="space-y-2">
        {grid.numbers.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-9 gap-1">
            {row.map((cell, colIdx) => (
              <input
                key={colIdx}
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={cell === 0 ? "" : cell}
                placeholder="—"
                onChange={(e) => {
                  const val = validateValue(e.target.value);
                  updateGridNumber(playerName, grid.id, rowIdx, colIdx, val);
                }}
                className="w-full aspect-square text-center text-xs font-dm font-semibold rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-bingo-blue focus:ring-1 focus:ring-bingo-blue/40 text-gray-700 placeholder:text-gray-300 transition-all"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
