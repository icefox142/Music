/**
 * 首页
 * Home page
 */

import "./Home.css";

export function Home() {
  return (
    <div className="home-page">
      <div className="home-content">
        {/* 左侧边栏 */}
        <aside className="sidebar-left">
          <div className="sidebar-section">
            <h3>推荐</h3>
            <div className="placeholder-list">
              <div className="placeholder-item">占位 1</div>
              <div className="placeholder-item">占位 2</div>
              <div className="placeholder-item">占位 3</div>
            </div>
          </div>
          <div className="sidebar-section">
            <h3>我的</h3>
            <div className="placeholder-list">
              <div className="placeholder-item">占位 4</div>
              <div className="placeholder-item">占位 5</div>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <div className="home-main">
          <h2>欢迎来到音乐播放器</h2>
          <p>首页占位</p>
        </div>
      </div>
    </div>
  );
}
