/**
 * 歌曲列表组件
 * Song list component
 */

import useSWR from "swr";

import { songsApi } from "@/api";
import type { Song } from "@/types/api";

export function SongList() {
  const { data, error, isLoading } = useSWR("/api/client/songs", () =>
    songsApi.getList({ page: 1, pageSize: 20 })
  );

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>加载失败: {error.message}</div>;
  }

  if (!data?.data?.length) {
    return <div>暂无歌曲</div>;
  }

  return (
    <div className="song-list">
      <h2>歌曲列表</h2>
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
