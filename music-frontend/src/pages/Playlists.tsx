/**
 * 歌单页面
 * Playlists page - 显示所有歌单列表
 */

import useSWR from "swr";
import { playlistsApi } from "@/api";
import type { Playlist } from "@/types/api";
import "./Playlists.css";

export function Playlists() {
  const { data, error, isLoading } = useSWR("/api/client/playlists", () =>
    playlistsApi.getList({ page: 1, pageSize: 20 })
  );

  if (isLoading) {
    return (
      <div className="playlists-page">
        <div className="loading-state">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlists-page">
        <div className="error-state">加载失败: {error.message}</div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="playlists-page">
        <div className="empty-state">暂无歌单</div>
      </div>
    );
  }

  return (
    <div className="playlists-page">
      <div className="playlists-header">
        <h1>歌单列表</h1>
        <button className="create-playlist-btn" onClick={handleCreatePlaylist}>
          创建歌单
        </button>
      </div>
      <div className="playlist-grid">
        {data.data.map((playlist) => (
          <div key={playlist.id} className="playlist-card">
            {playlist.coverUrl && (
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="playlist-cover"
              />
            )}
            <div className="playlist-info">
              <h3 className="playlist-name">{playlist.name}</h3>
              {playlist.description && (
                <p className="playlist-description">{playlist.description}</p>
              )}
              <div className="playlist-meta">
                <span className="playlist-song-count">{playlist.songCount} 首歌曲</span>
                <span className="playlist-play-count">{playlist.playCount} 次播放</span>
                {playlist.isPublic && (
                  <span className="playlist-public-badge">公开</span>
                )}
              </div>
            </div>
            <div className="playlist-actions">
              <button onClick={() => handleViewPlaylist(playlist)}>查看详情</button>
              <button onClick={() => handlePlayPlaylist(playlist)}>播放全部</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 查看歌单详情
 */
function handleViewPlaylist(playlist: Playlist) {
  console.log("查看歌单:", playlist.name);
  // TODO: 跳转到歌单详情页面
  alert(`查看 "${playlist.name}" 详情功能待实现`);
}

/**
 * 播放歌单
 */
function handlePlayPlaylist(playlist: Playlist) {
  console.log("播放歌单:", playlist.name);
  // TODO: 集成到 useMusicStore，播放歌单中的所有歌曲
  alert(`播放 "${playlist.name}" 功能待实现`);
}

/**
 * 创建歌单
 */
function handleCreatePlaylist() {
  console.log("创建歌单");
  // TODO: 打开创建歌单弹窗
  alert("创建歌单功能待实现");
}
