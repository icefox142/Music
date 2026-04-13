/**
 * 应用入口
 * App entry
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link } from "react-router-dom";

import { AppRoutes } from "./routes";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import "./App.css";
import "./components/sidebar.css";

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="app">
          {/* 顶部导航栏 */}
          <header className="app-header">
            {/* 左侧：Logo + 主导航 */}
            <div className="header-left">
              <h1 className="logo">🎵</h1>
              <nav className="main-nav">
                <Link to="/" className="nav-item">首页</Link>
                <Link to="/memes" className="nav-item">表情包</Link>
                <Link to="/music" className="nav-item">音乐</Link>
              </nav>
            </div>

            {/* 中间：搜索栏 */}
            <div className="header-center">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="搜索..." 
                  className="search-input"
                />
                <button className="search-btn">🔍</button>
              </div>
            </div>

            {/* 右侧：个人空间 + 主题切换 */}
            <div className="header-right">
              <ThemeToggle />
              <Link to="/profile" className="profile-link">
                <div className="avatar-placeholder">
                  {/* 圆形头像占位 */}
                </div>
                <span className="profile-text">个人空间</span>
              </Link>
            </div>
          </header>

          {/* 主体内容区 */}
          <main className="app-main">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;