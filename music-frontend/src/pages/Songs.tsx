/**
 * 歌曲页面
 * Songs page - 显示所有歌曲列表
 */

import useSWR from "swr";
import { songsApi } from "@/api";
import type { Song } from "@/types/api";
import "./Songs.css";

export function Songs() {
  const { data, error, isLoading } = useSWR("/api/client/songs", () =>
    songsApi.getList({ page: 1, pageSize: 20 })
  );

  if (isLoading) {
    return (
      <div className="songs-page">
        <div className="loading-state">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="songs-page">
        <div className="error-state">加载失败: {error.message}</div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="songs-page">
        <div className="empty-state">暂无歌曲</div>
      </div>
    );
  }

  return (
    <div className="songs-page">
      <h1>歌曲列表</h1>
      <div className="song-grid">
        {data.data.map((song) => (
          <div key={song.id} className="song-card">
            {song.coverUrl && (
              <img
                src={song.coverUrl}
                alt={song.title}
                className="song-cover"
              />
            )}
            <div className="song-info">
              <h3 className="song-title">{song.title}</h3>
              <p className="song-artist">{song.artist}</p>
              <div className="song-meta">
                <span className="song-genre">{song.genre}</span>
                <span className="song-duration">{formatDuration(song.duration)}</span>
              </div>
            </div>
            <div className="song-actions">
              <button onClick={() => handlePlaySong(song)}>播放</button>
              <button onClick={() => handleAddToPlaylist(song)}>添加到歌单</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 格式化时长
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * 播放歌曲
 */
function handlePlaySong(song: Song) {
  console.log("播放歌曲:", song.title);
  // TODO: 集成到 useMusicStore
}

/**
 * 添加到歌单
 */
function handleAddToPlaylist(song: Song) {
  console.log("添加到歌单:", song.title);
  // TODO: 打开歌单选择弹窗
  alert(`添加 "${song.title}" 到歌单功能待实现`);
}
