/**
 * 歌曲列表组件
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
  const { isPlaying, togglePlay } = useMusicStore();

  const handleSongClick = (song: Song) => {
    console.log('🖱️ SongList: 点击歌曲项:', song.title);
    console.log('🔄 调用 onSongSelect 回调');
    onSongSelect?.(song);
  };

  const handlePlayBtnClick = (e: React.MouseEvent, song: Song, isActive: boolean) => {
    e.stopPropagation();
    console.log('🎯 播放按钮点击');
    console.log('📍 isActive:', isActive);
    console.log('📍 当前 isPlaying:', isPlaying);

    if (isActive) {
      // 点击当前播放歌曲 → 切换播放/暂停
      console.log('🔄 切换播放状态');
      console.log('📍 调用前 isPlaying:', isPlaying);
      togglePlay();

      // 立即检查调用后的状态
      setTimeout(() => {
        const newState = useMusicStore.getState();
        console.log('📍 调用后 isPlaying:', newState.isPlaying);
      }, 0);
    } else {
      // 点击其他歌曲 → 切换到新歌曲
      console.log('🎵 切换到新歌曲');
      handleSongClick(song);
    }
  };

  if (songs.length === 0) {
    return (
      <div className="song-list-state">
        <p>🎵</p>
        <p>暂无歌曲</p>
        <small>请先添加歌曲到库</small>
      </div>
    );
  }

  return (
    <div className="song-list-container">
      {/* 表头：歌曲 | 作者 | 时长 */}
      <div className="list-header">
        <span className="col-title">歌曲</span>
        <span className="col-artist">作者</span>
        <span className="col-duration">时长</span>
      </div>

      <div className="song-list">
        {songs.map((song, index) => {
          const isActive = selectedSongId === song.id;

          return (
            <div
              key={song.id}
              className={`song-item ${isActive ? "active" : ""}`}
              onClick={() => handleSongClick(song)}
            >
              {/* 序号列 */}
              <div className="song-index">
                <span className="track-number">{index + 1}</span>

                {/* 悬停显示播放按钮 */}
                <button
                  className="play-btn"
                  onClick={(e) => handlePlayBtnClick(e, song, isActive)}
                >
                  {isActive && isPlaying ? '⏸' : '▶️'}
                </button>

                {/* 激活且播放中显示动画 */}
                {isActive && isPlaying && (
                  <div className="playing-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    
                  </div>
                )}
              </div>

              {/* 封面 */}
              <div className="song-cover">
                {song.coverUrl ? (
                  <img src={song.coverUrl} alt={song.title} />
                ) : (
                  <div className="cover-placeholder">🎵</div>
                )}
                <div className="cover-overlay">▶</div>
              </div>

              {/* 歌曲信息（标题） */}
              <div className="song-info">
                <div className="song-title">{song.title}</div>
              </div>

              {/* 作者 */}
              <div className="song-artist-name">{song.artist}</div>

              {/* 时长 */}
              <div className="song-duration">
                {formatDuration(song.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
