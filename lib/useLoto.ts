"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GameSession,
  Player,
  PlayerName,
  Draw,
  DrawResult,
  Grid,
  createInitialSession,
  createEmptyGrid,
  STORAGE_KEY,
  PLAYERS,
} from "./types";

export function useLoto() {
  const [session, setSession] = useState<GameSession>(createInitialSession());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: GameSession = JSON.parse(raw);
        setSession(parsed);
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage whenever session changes
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session, loaded]);

  // ── Setup ────────────────────────────────────────────────────────────────

  const updateGridNumber = useCallback(
    (playerName: PlayerName, gridId: string, row: number, col: number, value: number) => {
      setSession((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.name !== playerName
            ? p
            : {
                ...p,
                grids: p.grids.map((g) =>
                  g.id !== gridId
                    ? g
                    : {
                        ...g,
                        numbers: g.numbers.map((r, ri) =>
                          ri !== row ? r : r.map((c, ci) => (ci !== col ? c : value))
                        ),
                      }
                ),
              }
        ),
      }));
    },
    []
  );

  const addGrid = useCallback((playerName: PlayerName) => {
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.name !== playerName ? p : { ...p, grids: [...p.grids, createEmptyGrid()] }
      ),
    }));
  }, []);

  const deleteGrid = useCallback((playerName: PlayerName, gridId: string) => {
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.name !== playerName
          ? p
          : { ...p, grids: p.grids.filter((g) => g.id !== gridId) }
      ),
    }));
  }, []);

  // ── Game ─────────────────────────────────────────────────────────────────

  const [currentDrawnNumbers, setCurrentDrawnNumbers] = useState<number[]>([]);

  const drawNumber = useCallback(
    (num: number): boolean => {
      if (currentDrawnNumbers.includes(num)) return false; // duplicate
      setCurrentDrawnNumbers((prev) => [...prev, num]);
      return true;
    },
    [currentDrawnNumbers]
  );

  const getMatchesForGrid = useCallback(
    (grid: Grid, drawn: number[]): number => {
      const flat = grid.numbers.flat().filter((n) => n > 0);
      return flat.filter((n) => drawn.includes(n)).length;
    },
    []
  );

  const getMatchedNumbersForGrid = useCallback(
    (grid: Grid, drawn: number[]): number[] => {
      const flat = grid.numbers.flat().filter((n) => n > 0);
      return flat.filter((n) => drawn.includes(n));
    },
    []
  );

  const getTotalNumbersInGrid = useCallback((grid: Grid): number => {
    return grid.numbers.flat().filter((n) => n > 0).length;
  }, []);

  const finalizeDraw = useCallback(() => {
    const results: DrawResult[] = [];
    session.players.forEach((player) => {
      player.grids.forEach((grid) => {
        results.push({
          gridId: grid.id,
          playerName: player.name,
          matches: getMatchesForGrid(grid, currentDrawnNumbers),
          matchedNumbers: getMatchedNumbersForGrid(grid, currentDrawnNumbers),
        });
      });
    });

    const newDraw: Draw = {
      id: session.currentDrawNumber,
      drawnNumbers: [...currentDrawnNumbers],
      results,
      completedAt: new Date().toISOString(),
    };

    setSession((prev) => ({
      ...prev,
      draws: [...prev.draws, newDraw],
      currentDrawNumber: prev.currentDrawNumber + 1,
    }));
    setCurrentDrawnNumbers([]);
  }, [session, currentDrawnNumbers, getMatchesForGrid, getMatchedNumbersForGrid]);

  // ── History ──────────────────────────────────────────────────────────────

  const clearHistory = useCallback(() => {
    setSession((prev) => ({ ...prev, draws: [], currentDrawNumber: 1 }));
    setCurrentDrawnNumbers([]);
  }, []);

  return {
    session,
    loaded,
    // setup
    updateGridNumber,
    addGrid,
    deleteGrid,
    // game
    currentDrawnNumbers,
    drawNumber,
    getMatchesForGrid,
    getMatchedNumbersForGrid,
    getTotalNumbersInGrid,
    finalizeDraw,
    // history
    clearHistory,
  };
}
