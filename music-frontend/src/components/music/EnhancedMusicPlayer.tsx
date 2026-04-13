/**
 * 增强的音乐播放器组件
 * Enhanced music player with progress bar and volume control
 */

import { useMusic } from "@/hooks/useMusic";
import { ProgressBar, VolumeControl } from "@/components/music";
import "./EnhancedMusicPlayer.css";

interface EnhancedMusicPlayerProps {
  className?: string;
}

export function EnhancedMusicPlayer({ className = "" }: EnhancedMusicPlayerProps) {
  const {
    currentSong,
    playlist,
    isPlaying,
    playMode,
    togglePlay,
    nextSong,
    prevSong,
    setPlayMode,
  } = useMusic();

  if (!currentSong) {
    return (
      <div className={`enhanced-music-player empty ${className}`}>
        <div className="empty-state">
          <span className="empty-icon">🎵</span>
          <p>未选择歌曲</p>
          <small>从列表中选择歌曲开始播放</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`enhanced-music-player ${className}`}>
      {/* 歌曲信息 */}
      <div className="player-song-info">
        {currentSong.coverUrl && (
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="album-cover"
          />
        )}
        <div className="track-details">
          <h3 className="track-title">{currentSong.title}</h3>
          <p className="track-artist">{currentSong.artist}</p>
        </div>
      </div>

      {/* 进度条和控制区域 - 并列显示 */}
      <div className="player-controls-row">
        {/* 进度条 */}
        <div className="player-progress">
          <ProgressBar />
        </div>

        {/* 控制区域 */}
        <div className="player-controls-section">
        {/* 播放控制 */}
        <div className="playback-controls">
          <button
            onClick={prevSong}
            disabled={playlist.length === 0}
            aria-label="上一首"
            title="上一首"
          >
            ⏮
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "暂停" : "播放"}
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? "⏸" : "▶️"}
          </button>

          <button
            onClick={nextSong}
            disabled={playlist.length === 0}
            aria-label="下一首"
            title="下一首"
          >
            ⏭
          </button>
        </div>

        {/* 播放模式 */}
        <div className="play-modes">
          <button
            onClick={() => setPlayMode("sequence")}
            className={`play-mode-btn ${playMode === "sequence" ? "active" : ""}`}
            title="顺序播放"
            aria-label="顺序播放"
          >
            🔁
          </button>
          <button
            onClick={() => setPlayMode("shuffle")}
            className={`play-mode-btn ${playMode === "shuffle" ? "active" : ""}`}
            title="随机播放"
            aria-label="随机播放"
          >
            🔀
          </button>
          <button
            onClick={() => setPlayMode("loop-one")}
            className={`play-mode-btn ${playMode === "loop-one" ? "active" : ""}`}
            title="单曲循环"
            aria-label="单曲循环"
          >
            🔂
          </button>
          <button
            onClick={() => setPlayMode("loop-all")}
            className={`play-mode-btn ${playMode === "loop-all" ? "active" : ""}`}
            title="列表循环"
            aria-label="列表循环"
          >
            🔁
          </button>
        </div>

        {/* 音量控制 */}
        <div className="player-volume">
          <VolumeControl orientation="horizontal" showLabel={false} />
        </div>
      </div>
      </div>
    </div>
  );
}
