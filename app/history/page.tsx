"use client";
import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useLotoContext } from "@/lib/LotoContext";
import { PLAYER_COLORS, PlayerName } from "@/lib/types";

export default function HistoryPage() {
  const { session, loaded, clearHistory } = useLotoContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedDraw, setExpandedDraw] = useState<number | null>(null);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-bingo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const draws = [...session.draws].reverse();

  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-anton text-4xl tracking-wide">Historique</h1>
          <p className="font-dm text-xs text-gray-400 mt-1">
            {draws.length} tirage{draws.length !== 1 ? "s" : ""}
          </p>
        </div>
        {draws.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-dm text-red-400 hover:bg-red-50 hover:text-red-600 border border-red-200 transition-colors"
          >
            <Trash2 size={14} />
            Effacer
          </button>
        )}
      </div>

      {/* Empty state */}
      {draws.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <p className="font-anton text-xl text-gray-300 tracking-wide">AUCUN TIRAGE</p>
          <p className="font-dm text-sm text-gray-400 mt-1">
            Lancez une partie pour voir l&apos;historique ici
          </p>
        </div>
      )}

      {/* Draws list */}
      <div className="space-y-3">
        {draws.map((draw) => {
          const isExpanded = expandedDraw === draw.id;
          const date = draw.completedAt
            ? new Date(draw.completedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={draw.id}
              className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden"
            >
              {/* Draw header */}
              <button
                onClick={() => setExpandedDraw(isExpanded ? null : draw.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-100/70 transition-colors"
              >
                <div className="text-left">
                  <span className="font-anton text-xl text-gray-800">
                    Tirage{" "}
                    <span className="text-bingo-blue">#{draw.id}</span>
                  </span>
                  <p className="font-dm text-xs text-gray-400 mt-0.5">{date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-dm text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full">
                    {draw.drawnNumbers.length} nb
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  {/* Drawn numbers */}
                  <div className="pt-3">
                    <p className="font-dm text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                      Numéros tirés
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {draw.drawnNumbers.map((n) => (
                        <span
                          key={n}
                          className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-bingo-pink/10 text-bingo-pink font-dm text-xs font-bold"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Results per player */}
                  <div>
                    <p className="font-dm text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                      Résultats
                    </p>
                    <div className="space-y-1.5">
                      {(["Astrid", "Marie", "Victoire"] as PlayerName[]).map((playerName) => {
                        const playerResults = draw.results.filter(
                          (r) => r.playerName === playerName
                        );
                        if (playerResults.length === 0) return null;
                        const colors = PLAYER_COLORS[playerName];

                        return (
                          <div
                            key={playerName}
                            className="flex items-center gap-3 bg-white rounded-xl p-3"
                          >
                            <span className={`font-anton text-base ${colors.text} w-20`}>
                              {playerName}
                            </span>
                            <div className="flex flex-wrap gap-1 flex-1">
                              {playerResults.map((r, i) => {
                                const player = session.players.find(
                                  (p) => p.name === playerName
                                );
                                const grid = player?.grids.find(
                                  (g) => g.id === r.gridId
                                );
                                const total = grid
                                  ? grid.numbers.flat().filter((n) => n > 0).length
                                  : 27;
                                const isBingo = r.matches === total && total > 0;
                                return (
                                  <span
                                    key={i}
                                    className={`px-2 py-0.5 rounded-lg text-xs font-dm font-semibold ${
                                      isBingo
                                        ? "bg-bingo-violet text-white"
                                        : r.matches > 0
                                        ? `${colors.bg} ${colors.text}`
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {isBingo ? "🎉 BINGO" : `${r.matches}/${total}`}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-8"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-pop_in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <p className="font-anton text-xl text-gray-900">Effacer l&apos;historique ?</p>
              <p className="font-dm text-sm text-gray-500 mt-1">
                Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-dm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowConfirm(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-dm font-semibold hover:bg-red-600 transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.35)]"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
