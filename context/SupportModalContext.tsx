"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SupportModalContextValue {
  isOpen: boolean;
  openSupport: () => void;
  closeSupport: () => void;
}

const SupportModalContext = createContext<SupportModalContextValue | undefined>(undefined);

export function SupportModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSupport = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSupport = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SupportModalContext.Provider value={{ isOpen, openSupport, closeSupport }}>
      {children}
    </SupportModalContext.Provider>
  );
}

export function useSupportModal(): SupportModalContextValue {
  const context = useContext(SupportModalContext);
  if (!context) {
    throw new Error("useSupportModal must be used within a SupportModalProvider");
  }
  return context;
}
