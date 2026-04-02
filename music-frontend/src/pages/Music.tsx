/**
 * 音乐页面
 * Music page
 */

import { MusicPlayer } from "@/components/MusicPlayer";
import "./Music.css";

export function Music() {
  return (
    <div className="music-page">
      <div className="music-content">
        <h2>哈雅库</h2>
        <p>音乐占位</p>
      </div>

      {/* 底部播放器 */}
      <div className="music-player-wrapper">
        <MusicPlayer />
      </div>
    </div>
  );
}
