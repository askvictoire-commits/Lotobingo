"use client";
import { useRef, useState } from "react";
import { Trash2, Camera, Loader2, X, CheckCircle2 } from "lucide-react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");

  const allNumbers = grid.numbers.flat().filter((n) => n > 0);
  const hasDuplicates = allNumbers.length !== new Set(allNumbers).size;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus("idle");

    // Show preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);

      // Split base64
      const [header, base64] = dataUrl.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";

      setScanning(true);
      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType }),
        });

        const json = await res.json();

        if (!res.ok || !json.lines) {
          setScanStatus("error");
          return;
        }

        // Pre-fill grid numbers
        (json.lines as number[][]).forEach((row, rowIdx) => {
          row.forEach((n, colIdx) => {
            if (rowIdx < 3 && colIdx < 9) {
              updateGridNumber(playerName, grid.id, rowIdx, colIdx, n ?? 0);
            }
          });
        });

        setScanStatus("success");
      } catch {
        setScanStatus("error");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);

    // Allow re-scanning same file
    e.target.value = "";
  };

  const resetScan = () => {
    setPreview(null);
    setScanStatus("idle");
  };

  return (
    <div
      className={`rounded-2xl border-2 ${
        hasDuplicates ? "border-red-400" : "border-transparent"
      } bg-gray-50 p-4 shadow-sm`}
    >
      {/* Grid header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`font-anton text-lg tracking-wide ${colors.text}`}>
          Grille {gridIndex + 1}
        </span>
        <div className="flex items-center gap-2">
          {/* Scanner button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-dm font-medium transition-all disabled:opacity-50
              ${
                scanStatus === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-bingo-violet/10 text-bingo-violet hover:bg-bingo-violet/20"
              }`}
          >
            {scanning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : scanStatus === "success" ? (
              <CheckCircle2 size={13} />
            ) : (
              <Camera size={13} />
            )}
            {scanning ? "Analyse…" : "📷 Scanner"}
          </button>

          {/* Hidden file input — camera on mobile, file picker on desktop */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

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
      </div>

      {/* Scan feedback */}
      {scanning && (
        <div className="mb-3 flex items-center gap-2 text-xs text-bingo-violet font-dm bg-bingo-violet/5 rounded-xl px-3 py-2.5">
          <Loader2 size={13} className="animate-spin flex-shrink-0" />
          Analyse de la grille par IA en cours…
        </div>
      )}

      {preview && !scanning && (
        <div className="mb-3 flex items-start gap-3">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Aperçu scan"
              className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm"
            />
            <button
              onClick={resetScan}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center shadow hover:bg-gray-700 transition-colors"
            >
              <X size={10} />
            </button>
          </div>

          {/* Status message */}
          {scanStatus === "success" && (
            <div className="flex-1 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2.5 font-dm">
              <CheckCircle2 size={14} className="flex-shrink-0 text-green-500" />
              Grille importée ✓ Tu peux corriger manuellement
            </div>
          )}
          {scanStatus === "error" && (
            <div className="flex-1 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5 font-dm leading-relaxed">
              ⚠️ Scan impossible, remplis les numéros manuellement
            </div>
          )}
        </div>
      )}

      {hasDuplicates && (
        <p className="text-xs text-red-500 font-dm mb-2">⚠️ Doublons détectés dans cette grille</p>
      )}

      {/* 3 rows × 9 cols */}
      <div className="space-y-2">
        {grid.numbers.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-1.5">
            <span className="font-dm text-[10px] text-gray-300 w-3 text-center flex-shrink-0">
              {rowIdx + 1}
            </span>
            <div className="grid grid-cols-9 gap-1 flex-1">
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
          </div>
        ))}
      </div>
    </div>
  );
}
