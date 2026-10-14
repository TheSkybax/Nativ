"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { NameColor } from "@/lib/personalization";

type ProfileAppearanceContextValue = {
  nameColor: NameColor;
  setNameColor: (nameColor: NameColor) => void;
};

const ProfileAppearanceContext = createContext<ProfileAppearanceContextValue | null>(null);

export function ProfileAppearanceProvider({ children }: { children: ReactNode }) {
  const [nameColor, setNameColor] = useState<NameColor>("nativ");

  return (
    <ProfileAppearanceContext.Provider value={{ nameColor, setNameColor }}>
      {children}
    </ProfileAppearanceContext.Provider>
  );
}

export function useProfileAppearance() {
  const context = useContext(ProfileAppearanceContext);
  if (!context) {
    throw new Error("useProfileAppearance must be used within ProfileAppearanceProvider");
  }
  return context;
}
