/**
 * 主题类型定义
 * Theme type definitions
 */

export type Theme = "light" | "dark";

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
