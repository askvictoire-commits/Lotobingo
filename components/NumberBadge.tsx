"use client";

interface NumberBadgeProps {
  number: number;
  isMatched: boolean;
  isNew?: boolean;
}

export default function NumberBadge({ number, isMatched, isNew }: NumberBadgeProps) {
  if (number === 0) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-xs text-gray-300 font-dm">
        —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold font-dm tabular-nums transition-all duration-150 ease-out
        ${
          isMatched
            ? `bg-bingo-pink text-white shadow-[0_2px_8px_rgba(255,45,120,0.4)] ${isNew ? "animate-number_hit" : ""}`
            : "bg-bingo-inactive text-gray-500"
        }
      `}
    >
      {number}
    </span>
  );
}
