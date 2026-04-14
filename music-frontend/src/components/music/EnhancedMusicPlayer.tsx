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

  // 播放模式循环切换
  const cyclePlayMode = () => {
    const modes: Array<"sequence" | "shuffle" | "loop-one" | "loop-all"> = ["sequence", "shuffle", "loop-one", "loop-all"];
    const currentIndex = modes.indexOf(playMode as any);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  // 获取当前模式对应的图标
  const getPlayModeIcon = () => {
    switch (playMode) {
      case "sequence":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <polygon points="15,3 21,6 15,9"></polygon>
            <line x1="3" y1="18" x2="21" y2="18"></line>
            <polygon points="9,15 3,18 9,21"></polygon>
          </svg>
        );
      case "shuffle":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16,3 21,3 21,8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21,16 21,21 16,21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
        );
      case "loop-one":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6"></path>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            <circle cx="12" cy="13" r="3" fill="currentColor"></circle>
          </svg>
        );
      case "loop-all":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6"></path>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            <path d="M23 20v-6h-6"></path>
            <path d="M20.49 9a9 9 0 1 0-2.13 9.36L23 14"></path>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <polygon points="15,3 21,6 15,9"></polygon>
            <line x1="3" y1="18" x2="21" y2="18"></line>
            <polygon points="9,15 3,18 9,21"></polygon>
          </svg>
        );
    }
  };

  // 获取当前模式对应的提示文字
  const getPlayModeTitle = () => {
    switch (playMode) {
      case "sequence": return "顺序播放";
      case "shuffle": return "随机播放";
      case "loop-one": return "单曲循环";
      case "loop-all": return "列表循环";
      default: return "顺序播放";
    }
  };

  return (
    <div className={`enhanced-music-player ${className}`}>
      {/* 歌曲信息 */}
      <div className="player-song-info">
        {currentSong?.coverUrl && (
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="album-cover"
          />
        )}
        <div className="track-details">
          <h3 className="track-title">{currentSong?.title || "未选择歌曲"}</h3>
          <p className="track-artist">{currentSong?.artist || "从列表中选择歌曲"}</p>
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
            disabled={!currentSong || playlist.length === 0}
            aria-label="上一首"
            title="上一首"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19,20 9,12 19,4"></polygon>
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"></line>
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentSong}
            aria-label={isPlaying ? "暂停" : "播放"}
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
            )}
          </button>

          <button
            onClick={nextSong}
            disabled={!currentSong || playlist.length === 0}
            aria-label="下一首"
            title="下一首"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20"></polygon>
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"></line>
            </svg>
          </button>
        </div>

        {/* 播放模式 */}
        <div className="play-modes">
          <button
            onClick={cyclePlayMode}
            className="play-mode-btn active"
            title={getPlayModeTitle()}
            aria-label={getPlayModeTitle()}
          >
            {getPlayModeIcon()}
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
