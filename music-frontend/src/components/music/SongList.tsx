/**
 * 歌曲列表组件
 * Song list component
 */

import type { Song } from "@/types/api";
import { MusicGenre, MusicLanguage } from "@/types/api";
import "./SongList.css";

interface SongListProps {
  songs: Song[];
  onSongSelect?: (song: Song) => void;
  selectedSongId?: string;
}

export function SongList({ songs, onSongSelect, selectedSongId }: SongListProps) {
  const handleSongClick = (song: Song) => {
    if (onSongSelect) {
      onSongSelect(song);
    }
  };

  // 格式化音乐类型
  const formatGenre = (genre: MusicGenre): string => {
    const genreMap: Record<MusicGenre, string> = {
      [MusicGenre.POP]: "流行",
      [MusicGenre.ROCK]: "摇滚",
      [MusicGenre.HIP_HOP]: "嘻哈",
      [MusicGenre.RNB]: "R&B",
      [MusicGenre.JAZZ]: "爵士",
      [MusicGenre.CLASSICAL]: "古典",
      [MusicGenre.ELECTRONIC]: "电子",
      [MusicGenre.COUNTRY]: "乡村",
      [MusicGenre.REGGAE]: "雷鬼",
      [MusicGenre.BLUES]: "蓝调",
      [MusicGenre.METAL]: "金属",
      [MusicGenre.FOLK]: "民谣",
      [MusicGenre.LATIN]: "拉丁",
      [MusicGenre.ASIAN_POP]: "华语流行",
      [MusicGenre.OTHER]: "其他",
    };
    return genreMap[genre] || genre;
  };

  // 格式化语言
  const formatLanguage = (language: MusicLanguage): string => {
    const languageMap: Record<MusicLanguage, string> = {
      [MusicLanguage.CHINESE]: "中文",
      [MusicLanguage.ENGLISH]: "英文",
      [MusicLanguage.JAPANESE]: "日语",
      [MusicLanguage.KOREAN]: "韩语",
      [MusicLanguage.FRENCH]: "法语",
      [MusicLanguage.SPANISH]: "西班牙语",
      [MusicLanguage.GERMAN]: "德语",
      [MusicLanguage.ITALIAN]: "意大利语",
      [MusicLanguage.PORTUGUESE]: "葡萄牙语",
      [MusicLanguage.RUSSIAN]: "俄语",
      [MusicLanguage.INSTRUMENTAL]: "纯音乐",
      [MusicLanguage.OTHER]: "其他",
    };
    return languageMap[language] || language;
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
      <h2>歌曲列表</h2>
      <div className="song-list">
        {songs.map((song: Song, index: number) => {
          const isActive = selectedSongId === song.id;

          return (
            <div
              key={song.id}
              className={`song-item ${isActive ? "active" : ""}`}
              onClick={() => handleSongClick(song)}
            >
              <div className="song-index">
                {isActive ? (
                  <span className="playing-icon">▶️</span>
                ) : (
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
                <div className="song-meta">
                  <span className="artist-name">{song.artist}</span>
                  <span className="separator">·</span>
                  <span className="genre-tag">{formatGenre(song.genre)}</span>
                  <span className="separator">·</span>
                  <span className="language-tag">{formatLanguage(song.language)}</span>
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
