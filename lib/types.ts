// Types for the LotoBingo app

export type PlayerName = "Astrid" | "Marie" | "Victoire";

export type Grid = {
  id: string;
  numbers: number[][];
  // 3 rows × 9 cols = 27 numbers, values 0–100
};

export type Player = {
  name: PlayerName;
  grids: Grid[];
};

export type LineResult = {
  lineIndex: 0 | 1 | 2;
  complete: boolean;
};

export type DrawResult = {
  gridId: string;
  playerName: PlayerName;
  matches: number;
  matchedNumbers: number[];
  lines: LineResult[];
};

export type Draw = {
  id: number;
  drawnNumbers: number[];
  results: DrawResult[];
  completedAt?: string;
};

export type GameSession = {
  players: Player[];
  draws: Draw[];
  currentDrawNumber: number;
};

export const PLAYER_COLORS: Record<PlayerName, { bg: string; text: string; accent: string }> = {
  Astrid: {
    bg: "bg-bingo-blue/10",
    text: "text-bingo-blue",
    accent: "bg-bingo-blue",
  },
  Marie: {
    bg: "bg-bingo-violet/10",
    text: "text-bingo-violet",
    accent: "bg-bingo-violet",
  },
  Victoire: {
    bg: "bg-bingo-pink/10",
    text: "text-bingo-pink",
    accent: "bg-bingo-pink",
  },
};

export const PLAYERS: PlayerName[] = ["Astrid", "Marie", "Victoire"];

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const createEmptyGrid = (): Grid => ({
  id: generateId(),
  numbers: [
    Array(9).fill(0),
    Array(9).fill(0),
    Array(9).fill(0),
  ],
});

export const createInitialSession = (): GameSession => ({
  players: PLAYERS.map((name) => ({
    name,
    grids: [createEmptyGrid()],
  })),
  draws: [],
  currentDrawNumber: 1,
});

export const STORAGE_KEY = "lotobingo_session";
