/**
 * 音乐播放器组件
 * Music player component
 */

import { useMusic } from "@/hooks/useMusic";

export function MusicPlayer() {
  const {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    setPlayMode,
  } = useMusic();

  if (!currentSong) {
    return (
      <div className="music-player empty">
        <p>未选择歌曲</p>
      </div>
    );
  }

  return (
    <div className="music-player">
      {/* 歌曲信息 */}
      <div className="now-playing">
        {currentSong.coverUrl && (
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="album-cover"
          />
        )}
        <div className="track-info">
          <h3 className="track-title">{currentSong.title}</h3>
          <p className="track-artist">{currentSong.artist}</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar">
        <div className="progress-current"></div>
      </div>

      {/* 控制按钮 */}
      <div className="player-controls">
        <button
          onClick={prevSong}
          disabled={playlist.length === 0}
          aria-label="上一首"
        >
          ⏮
        </button>

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? "⏸" : "▶️"}
        </button>

        <button
          onClick={nextSong}
          disabled={playlist.length === 0}
          aria-label="下一首"
        >
          ⏭
        </button>
      </div>

      {/* 音量控制 */}
      <div className="volume-control">
        <button onClick={() => setVolume(Math.max(0, volume - 0.1))}>
          🔉-
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          aria-label="音量"
        />
        <button onClick={() => setVolume(Math.min(1, volume + 0.1))}>
          🔉+
        </button>
      </div>

      {/* 播放模式 */}
      <div className="play-modes">
        <button
          onClick={() => setPlayMode("sequence")}
          className={playMode === "sequence" ? "active" : ""}
          title="顺序播放"
        >
          🔁
        </button>
        <button
          onClick={() => setPlayMode("shuffle")}
          className={playMode === "shuffle" ? "active" : ""}
          title="随机播放"
        >
          🔀
        </button>
        <button
          onClick={() => setPlayMode("loop-one")}
          className={playMode === "loop-one" ? "active" : ""}
          title="单曲循环"
        >
          🔂
        </button>
        <button
          onClick={() => setPlayMode("loop-all")}
          className={playMode === "loop-all" ? "active" : ""}
          title="列表循环"
        >
          🔁
        </button>
      </div>

      {/* 歌曲信息 */}
      <div className="playlist-info">
        <span>
          {currentIndex + 1} / {playlist.length}
        </span>
      </div>
    </div>
  );
}
