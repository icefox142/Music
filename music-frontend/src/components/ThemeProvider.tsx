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

  // 监听系统主题变化（仅在未手动设置时）
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才响应系统变化
      const storedTheme = localStorage.getItem("theme-storage");
      if (!storedTheme) {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return <>{children}</>;
}
