/**
 * 歌曲列表组件
 * Song list component
 */

import type { Song } from "@/types/api";
import { useMusicStore } from "@/stores/useMusicStore";
import "./SongList.css";

interface SongListProps {
  songs: Song[];
  onSongSelect?: (song: Song) => void;
  selectedSongId?: string;
}

export function SongList({ songs, onSongSelect, selectedSongId }: SongListProps) {
  // 从 store 获取播放状态
  const { isPlaying } = useMusicStore();
  const handleSongClick = (song: Song) => {
    if (onSongSelect) {
      onSongSelect(song);
    }
  };

  if (songs.length === 0) {
    return (
      <div className="song-list-state empty-state">
        <p>🎵</p>
        <p>暂无歌曲</p>
        <small>请先添加歌曲到库</small>
      </div>
    );
  }

  return (
    <div className="song-list-container">
      <div className="list-header">
        <span className="col-title">歌曲</span>
        <span className="col-artist">作者</span>
        <span className="col-duration">时长</span>
      </div>
      <div className="song-list">
        {/* 歌曲列表 */}
        {songs.map((song: Song, index: number) => {
          const isActive = selectedSongId === song.id;

          return (
            <div
              key={song.id}
              className={`song-item ${isActive ? "active" : ""}`}
              onClick={() => handleSongClick(song)}
            >
              {/* 第1列：歌曲名称 + 序号/播放图标 */}
              <div className="song-index">
                {isActive ? (
                  // 根据播放状态显示不同图标
                  isPlaying ? (
                    // 正在播放：CSS 动画播放指示器（三个跳动的小条）
                    <div className="playing-icon">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    // 已暂停：显示暂停图标
                    <span className="track-number">{index + 1}</span>
                  )
                ) : (
                  // 未激活：显示序号
                  <span className="track-number">{index + 1}</span>
                )}
              </div>

              <div className="song-cover">
                {song.coverUrl ? (
                  <img src={song.coverUrl} alt={song.title} />
                ) : (
                  <div className="cover-placeholder">🎵</div>
                )}
                {isActive && <div className="playing-indicator"></div>}
              </div>

              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">
                  <span className="artist-name">{song.artist}</span>

                </div>
              </div>

              <div className="song-actions">
                <div className="song-duration">{formatDuration(song.duration)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 格式化时长（秒 -> MM:SS）
 */
function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
