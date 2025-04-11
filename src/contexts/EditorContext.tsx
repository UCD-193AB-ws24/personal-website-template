"use client";

import { createContext, ReactNode, useContext } from "react";

interface EditorContextData {
  handleSwitchPage: (pageIndex: number) => void;
}

export const EditorContext = createContext<EditorContextData | null>(null);

export function useEditorContext(): EditorContextData | null {
  const editorContext = useContext(EditorContext);
  return editorContext;
}

interface EditorContextProviderProps {
  handleSwitchPage: (pageIndex: number) => void;
  children: ReactNode;
}

export default function EditorContextProvider({
  handleSwitchPage,
  children,
}: EditorContextProviderProps) {
  return (
    <EditorContext.Provider value={{ handleSwitchPage }}>
      {children}
    </EditorContext.Provider>
  );
}
