/**
 * 应用入口
 * App entry
 */

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link } from "react-router-dom";

import { AppRoutes } from "./routes";
import { ThemeProvider, ThemeToggle } from "./components/music";
import { EnhancedMusicPlayer } from "./components/music";
import "./App.css";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="app">
            {/* 顶部导航栏 - 固定在顶部 */}
            <header className="app-header">
              {/* 左侧：折叠按钮 */}
              <div className="header-left">
                <button
                  className="collapse-btn"
                  onClick={toggleSidebar}
                  title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
                  aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
                >
                  ☰
                </button>
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

            {/* 主体内容区域 - 左右结构 */}
            <div className="app-body">
              {/* 左侧：侧边栏导航 */}
              <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <nav className="sidebar-nav">
                  <Link to="/" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span className={`nav-text ${sidebarCollapsed ? 'hidden' : ''}`}>首页</span>
                  </Link>
                  <Link to="/memes" className="nav-item">
                    <span className="nav-icon">😄</span>
                    <span className={`nav-text ${sidebarCollapsed ? 'hidden' : ''}`}>表情包</span>
                  </Link>
                  <Link to="/music" className="nav-item">
                    <span className="nav-icon">🎵</span>
                    <span className={`nav-text ${sidebarCollapsed ? 'hidden' : ''}`}>音乐</span>
                  </Link>
                </nav>
              </aside>

              {/* 右侧：主要内容区 */}
              <main className="app-main">
                <AppRoutes />
              </main>
            </div>

            {/* 全局底部播放器 */}
            <div className="global-player-wrapper">
              <EnhancedMusicPlayer />
            </div>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
