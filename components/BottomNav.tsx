"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Zap, History } from "lucide-react";

const navItems = [
  { href: "/setup", label: "Grilles", icon: Grid2X2 },
  { href: "/game", label: "Jouer", icon: Zap },
  { href: "/history", label: "Historique", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-bingo-blue"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  active ? "bg-bingo-blue/10" : ""
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-bingo-blue/10 animate-pulse_bingo opacity-50" />
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium font-dm tracking-wide ${active ? "text-bingo-blue" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
