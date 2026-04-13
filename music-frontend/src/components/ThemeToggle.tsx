/**
 * 主题切换按钮组件
 * Theme toggle button component
 */

import { useThemeStore } from "@/stores/useThemeStore";
import "./ThemeToggle.css";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    // 在日间和夜间之间切换
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getThemeIcon = () => {
    return theme === "light" ? "☀️" : "🌙";
  };

  const getThemeLabel = () => {
    return theme === "light" ? "浅色模式" : "深色模式";
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
    >
      <span className="theme-icon">{getThemeIcon()}</span>
    </button>
  );
}
