/**
 * 路由配置
 * Routes configuration
 */

import { Routes, Route, Outlet } from "react-router-dom";
import { Home } from "@/pages/Home";
import { SongList } from "@/components/SongList";
import { Playlists } from "@/pages/Playlists";
import { Memes } from "@/pages/Memes";
import { Music } from "@/pages/Music";
import { Profile } from "@/pages/Profile";

// 简单的 404 组件（后续可移到独立文件）
function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>404 - 页面未找到</h2>
      <p>请检查 URL 是否正确</p>
      <a href="/" style={{ color: "#1890ff" }}>返回首页</a>
    </div>
  );
}

// 歌曲布局（预留嵌套用）
function SongsLayout() {
  return <Outlet />; // 子路由渲染出口
}

// 歌单布局（预留嵌套用）
function PlaylistsLayout() {
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* 首页 */}
      <Route path="/" element={<Home />} />

      {/* 歌曲路由组 */}
      <Route path="/songs" element={<SongsLayout />}>
        <Route index element={<SongList />} />
        {/* <Route path=":id" element={<SongDetail />} /> */}
      </Route>

      {/* 歌单路由组 */}
      <Route path="/playlists" element={<PlaylistsLayout />}>
        <Route index element={<Playlists />} />
        {/* <Route path=":id" element={<PlaylistDetail />} /> */}
      </Route>
      {/* 表情包路由 */}
      <Route path="/memes" element={<Memes />} />

      {/* 音乐路由 */}
      <Route path="/music" element={<Music />} />

      {/* 个人空间路由 */}
      <Route path="/profile" element={<Profile />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}