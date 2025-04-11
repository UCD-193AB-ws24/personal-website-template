"use client";

import { Page } from "@customTypes/componentTypes";
import { createContext, ReactNode, useContext } from "react";

interface PagesContextData {
  pages: Page[];
}

export const PagesContext = createContext<PagesContextData>({ pages: [] });

export function usePagesContext(): PagesContextData {
  const pagesContext = useContext(PagesContext);
  return pagesContext;
}

interface PagesContextProviderProps {
  pages: Page[];
  children: ReactNode;
}

export default function PageContextProvider({
  pages,
  children,
}: PagesContextProviderProps) {
  return (
    <PagesContext.Provider value={{ pages }}>{children}</PagesContext.Provider>
  );
}
