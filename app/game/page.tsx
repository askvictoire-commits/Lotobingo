"use client";
import { useState, useRef, useCallback } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useLotoContext } from "@/lib/LotoContext";
import { PLAYER_COLORS, PlayerName, Grid } from "@/lib/types";
import { playQuineSound, playBingoSound } from "@/lib/sounds";
import NumberBadge from "@/components/NumberBadge";
import BingoAlert from "@/components/BingoAlert";
import QuineToast from "@/components/QuineToast";

const FILTER_OPTIONS: (PlayerName | "Toutes")[] = ["Toutes", "Astrid", "Marie", "Victoire"];

// Compute line completion for a grid given drawn numbers
function getLineResults(grid: Grid, drawn: number[]) {
  return [0, 1, 2].map((lineIdx) => {
    const row = grid.numbers[lineIdx];
    const nonZero = row.filter((n) => n > 0);
    const complete = nonZero.length > 0 && nonZero.every((n) => drawn.includes(n));
    return { lineIndex: lineIdx as 0 | 1 | 2, complete };
  });
}

interface ToastItem {
  id: string;
  message: string;
}

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
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Track announced quines to avoid repeating them
  const announcedLines = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

    const newDrawn = [...currentDrawnNumbers, num];

    // Detect new quines / bingos BEFORE updating state
    const newToasts: ToastItem[] = [];
    let hasBingo = false;

    session.players.forEach((player) => {
      player.grids.forEach((grid, gridIdx) => {
        let gridJustBingo = false;
        const lineResults = getLineResults(grid, newDrawn);

        lineResults.forEach(({ lineIndex, complete }) => {
          const key = `${grid.id}-${lineIndex}`;
          if (announcedLines.current.has(key)) return;

          if (complete) {
            announcedLines.current.add(key);
            const toastId = `${Date.now()}-${key}`;
            newToasts.push({
              id: toastId,
              message: `QUINE — ${player.name} · Grille ${gridIdx + 1} · Ligne ${lineIndex + 1} !`,
            });
            // Check if all 3 lines are now complete → BINGO
            const allComplete = lineResults.every((lr) =>
              lr.lineIndex === lineIndex ? true : announcedLines.current.has(`${grid.id}-${lr.lineIndex}`)
            );
            if (allComplete) {
              gridJustBingo = true;
              hasBingo = true;
            }
          }
        });

        // If this grid just got BINGO, play bingo sound slightly after quine
        if (gridJustBingo) {
          setTimeout(() => playBingoSound(), 350);
        }
      });
    });

    if (newToasts.length > 0) {
      playQuineSound();
      setToasts((prev) => [...prev, ...newToasts]);
    }

    drawNumber(num);
    setLastDrawn(num);
    setInputValue("");
    inputRef.current?.focus();
    setTimeout(() => setLastDrawn(null), 2000);

    void hasBingo; // used via setTimeout above
  }, [inputValue, currentDrawnNumbers, drawNumber, session]);

  const handleFinalize = useCallback(() => {
    finalizeDraw();
    announcedLines.current = new Set();
    setToasts([]);
  }, [finalizeDraw]);

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
      {/* Quine toasts — fixed top */}
      <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <QuineToast id={t.id} message={t.message} onClose={removeToast} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-anton text-4xl tracking-wide">
          Tirage <span className="text-bingo-blue">#{session.currentDrawNumber}</span>
        </h1>
        <span className="font-dm text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {currentDrawnNumbers.length} numéros
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
            onChange={(e) => { setInputValue(e.target.value); setError(""); }}
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
          <span className="font-dm text-sm text-bingo-pink font-semibold">{lastDrawn} ajouté !</span>
        </div>
      )}

      {/* Drawn numbers */}
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
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-dm font-medium border-2 transition-all duration-150
                ${isActive
                  ? "bg-bingo-blue text-white border-bingo-blue shadow-[0_2px_10px_rgba(0,102,255,0.3)]"
                  : "text-bingo-violet border-bingo-violet hover:bg-bingo-violet/5"
                }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Grids — 3 rows × 9 badges */}
      <div className="space-y-4 mb-6">
        {filteredPlayers.map((player) =>
          player.grids.map((grid, gridIdx) => {
            const total = getTotalNumbersInGrid(grid);
            const matched = getMatchesForGrid(grid, currentDrawnNumbers);
            const matchedNumbers = getMatchedNumbersForGrid(grid, currentDrawnNumbers);
            const isBingo = total > 0 && matched === total;
            const colors = PLAYER_COLORS[player.name];
            const lineResults = getLineResults(grid, currentDrawnNumbers);

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
                    {/* Bannière Quine qui s'affiche au-dessus de la grille */}
                    {lineResults.some((l) => l.complete) && (
                      <div className="relative overflow-hidden rounded-xl h-[120px] mb-4 shadow-[0_4px_15px_rgba(123,47,255,0.2)] bg-[url('/quine.png')] bg-cover bg-center animate-pop_in">
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent h-2/3 pointer-events-none" />
                        <div className="absolute bottom-2 left-3 flex flex-col z-10 text-left">
                          <p className="font-anton text-[20px] text-white tracking-wider">
                            QUINE !
                          </p>
                          <p className="font-dm text-white/90 text-[10px]">
                            {player.name} · Grille {gridIdx + 1}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Grid header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-anton text-lg ${colors.text}`}>
                        Grille {gridIdx + 1}
                      </span>
                      <span className="font-dm text-xs text-gray-500 font-semibold">
                        <span className={matched > 0 ? "text-bingo-pink font-bold" : ""}>{matched}</span>
                        /{total}
                      </span>
                    </div>
                    <p className="font-dm text-[10px] text-gray-400 mb-2 uppercase tracking-widest">
                      {player.name}
                    </p>

                    {/* 3 rows × 9 badges */}
                    <div className="space-y-1">
                      {grid.numbers.map((row, rowIdx) => {
                        const lineComplete = lineResults[rowIdx]?.complete;
                        return (
                          <div
                            key={rowIdx}
                            className={`flex items-center gap-1 rounded-xl px-2 py-1.5 transition-all duration-300 ${
                              lineComplete
                                ? "bg-bingo-violet/20 ring-1 ring-bingo-violet/40"
                                : ""
                            }`}
                          >
                            {/* Row number */}
                            <span className="font-dm text-[9px] text-gray-300 w-3 flex-shrink-0 text-center">
                              {rowIdx + 1}
                            </span>
                            {/* Badges */}
                            <div className="flex gap-1 flex-1">
                              {row.map((n, colIdx) => (
                                <NumberBadge
                                  key={colIdx}
                                  number={n}
                                  isMatched={matchedNumbers.includes(n)}
                                  isNew={n === lastDrawn}
                                />
                              ))}
                            </div>
                            {/* Quine label */}
                            {lineComplete && (
                              <span className="font-anton text-[11px] text-bingo-violet tracking-wider ml-1 flex-shrink-0">
                                QUINE ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
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
            onClick={handleFinalize}
            className="w-full py-4 rounded-2xl bg-bingo-violet text-white font-anton text-xl tracking-wider shadow-[0_4px_20px_rgba(123,47,255,0.35)] hover:shadow-[0_6px_25px_rgba(123,47,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Terminer ce tirage →
          </button>
        </div>
      )}
    </div>
  );
}
