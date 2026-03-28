"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useLoto } from "./useLoto";

type LotoContextType = ReturnType<typeof useLoto>;

const LotoContext = createContext<LotoContextType | null>(null);

export function LotoProvider({ children }: { children: ReactNode }) {
  const loto = useLoto();
  return <LotoContext.Provider value={loto}>{children}</LotoContext.Provider>;
}

export function useLotoContext(): LotoContextType {
  const ctx = useContext(LotoContext);
  if (!ctx) throw new Error("useLotoContext must be used within LotoProvider");
  return ctx;
}
