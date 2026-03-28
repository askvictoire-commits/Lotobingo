"use client";
import { useState, useRef, useCallback } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useLotoContext } from "@/lib/LotoContext";
import { PLAYER_COLORS, PlayerName } from "@/lib/types";
import NumberBadge from "@/components/NumberBadge";
import BingoAlert from "@/components/BingoAlert";

const FILTER_OPTIONS: (PlayerName | "Toutes")[] = ["Toutes", "Astrid", "Marie", "Victoire"];

export default function GamePage() {
  const {
    session,
    loaded,
    currentDrawnNumbers,
    drawNumber,
    getMatchesForGrid,
    getMatchedNumbersForGrid,
    getTotalNumbersInGrid,
    finalizeDraw,
  } = useLotoContext();

  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<PlayerName | "Toutes">("Toutes");
  const [error, setError] = useState("");
  const [lastDrawn, setLastDrawn] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDraw = useCallback(() => {
    const num = parseInt(inputValue.trim(), 10);
    if (isNaN(num) || num < 0 || num > 100) {
      setError("Entrez un numéro entre 0 et 100");
      return;
    }
    if (currentDrawnNumbers.includes(num)) {
      setError(`${num} a déjà été tiré`);
      return;
    }
    setError("");
    drawNumber(num);
    setLastDrawn(num);
    setInputValue("");
    inputRef.current?.focus();
    setTimeout(() => setLastDrawn(null), 2000);
  }, [inputValue, currentDrawnNumbers, drawNumber]);

  const filteredPlayers = session.players.filter(
    (p) => activeFilter === "Toutes" || p.name === activeFilter
  );

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-anton text-4xl tracking-wide">
          Tirage{" "}
          <span className="text-bingo-blue">#{session.currentDrawNumber}</span>
        </h1>
        <span className="font-dm text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {currentDrawnNumbers.length} numéros tirés
        </span>
      </div>

      {/* Draw input */}
      <div className="mb-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleDraw()}
            placeholder="Numéro tiré..."
            className="flex-1 text-center text-2xl font-anton tracking-widest rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-bingo-blue focus:ring-2 focus:ring-bingo-blue/20 py-3 px-4 transition-all"
          />
          <button
            onClick={handleDraw}
            className="flex items-center justify-center gap-2 px-6 rounded-2xl bg-bingo-blue text-white font-dm font-semibold shadow-[0_4px_15px_rgba(0,102,255,0.35)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <Send size={20} />
          </button>
        </div>
        {error && <p className="text-red-500 text-xs font-dm mt-1 pl-1">{error}</p>}
      </div>

      {/* Last drawn feedback */}
      {lastDrawn !== null && (
        <div className="flex items-center gap-2 mb-3 animate-pop_in">
          <CheckCircle2 size={16} className="text-bingo-pink" />
          <span className="font-dm text-sm text-bingo-pink font-semibold">
            {lastDrawn} ajouté !
          </span>
        </div>
      )}

      {/* Drawn numbers badges */}
      {currentDrawnNumbers.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {[...currentDrawnNumbers].reverse().map((n) => (
            <span
              key={n}
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-bingo-pink/15 text-bingo-pink font-dm text-xs font-bold"
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Player filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {FILTER_OPTIONS.map((f) => {
          const isActive = activeFilter === f;
          const color = f !== "Toutes" ? PLAYER_COLORS[f as PlayerName] : null;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-dm font-medium border-2 transition-all duration-150
                ${
                  isActive
                    ? "bg-bingo-blue text-white border-bingo-blue shadow-[0_2px_10px_rgba(0,102,255,0.3)]"
                    : "text-bingo-violet border-bingo-violet hover:bg-bingo-violet/5"
                }
              `}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Grids */}
      <div className="space-y-4 mb-6">
        {filteredPlayers.map((player) =>
          player.grids.map((grid, gridIdx) => {
            const total = getTotalNumbersInGrid(grid);
            const matched = getMatchesForGrid(grid, currentDrawnNumbers);
            const matchedNumbers = getMatchedNumbersForGrid(grid, currentDrawnNumbers);
            const isBingo = total > 0 && matched === total;
            const colors = PLAYER_COLORS[player.name];

            return (
              <div
                key={grid.id}
                className={`rounded-2xl p-4 transition-all duration-300 ${
                  isBingo ? "bg-bingo-violet" : "bg-gray-50 border border-gray-100"
                }`}
              >
                {isBingo ? (
                  <BingoAlert
                    gridLabel={`Grille ${gridIdx + 1}`}
                    playerName={player.name}
                  />
                ) : (
                  <>
                    {/* Grid header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-anton text-lg ${colors.text}`}>
                        Grille {gridIdx + 1}
                      </span>
                      <span className="font-dm text-xs text-gray-500 font-semibold">
                        <span className={matched > 0 ? "text-bingo-pink font-bold" : ""}>{matched}</span>
                        /{total}
                      </span>
                    </div>

                    {/* Player name */}
                    <p className="font-dm text-[11px] text-gray-400 mb-2 uppercase tracking-widest">
                      {player.name}
                    </p>

                    {/* Numbers — flat 2 rows of 9 displayed as flex-wrap */}
                    <div className="flex flex-wrap gap-1">
                      {grid.numbers.flat().map((n, i) => (
                        <NumberBadge
                          key={i}
                          number={n}
                          isMatched={matchedNumbers.includes(n)}
                          isNew={n === lastDrawn}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Finalize draw */}
      {currentDrawnNumbers.length > 0 && (
        <div className="sticky bottom-20 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={finalizeDraw}
            className="w-full py-4 rounded-2xl bg-bingo-violet text-white font-anton text-xl tracking-wider shadow-[0_4px_20px_rgba(123,47,255,0.35)] hover:shadow-[0_6px_25px_rgba(123,47,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Terminer ce tirage →
          </button>
        </div>
      )}
    </div>
  );
}
