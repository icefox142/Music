/**
 * 主题管理 Store
 * Theme management with Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types/theme";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light", // 默认浅色模式

      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);
