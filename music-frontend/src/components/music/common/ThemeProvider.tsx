/**
 * 主题提供者组件
 * Theme provider component - initializes and manages theme
 */

import { useEffect } from "react";
import { useThemeStore } from "@/stores/useThemeStore";
import type { Theme } from "@/types/theme";

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // 设置 data-theme 属性
  root.setAttribute("data-theme", theme);

  // 设置 color-scheme（影响浏览器原生控件）
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  // 初始化主题
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
