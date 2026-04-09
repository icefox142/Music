/**
 * 音乐页面
 * Music page - 平行组件布局
 */

import { useState } from "react";
import { EnhancedMusicPlayer, SongList, Lyrics } from "@/components/music";
import { useMusic } from "@/hooks/useMusic";
import { useSongsMock } from "@/hooks/useSongsMock";
import type { Song } from "@/types/api";
import "./Music.css";

export function Music() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { replaceAndPlay } = useMusic();
  const { data: songs = [] } = useSongsMock({ page: 1, pageSize: 50 });

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);

    // 找到歌曲在列表中的索引
    const index = songs.findIndex((s) => s.id === song.id);
    if (index >= 0) {
      // 场景1: 从歌单播放 - 替换整个播放列表并播放指定歌曲
      replaceAndPlay(songs, index);
    }
  };

  return (
    <div className="music-page">
      <div className="music-content">
        {/* 页面标题 */}
        <div className="music-header">
          <h1>🎵 音乐播放器</h1>
          <p>选择歌曲开始播放</p>
        </div>

        {/* 主内容区：歌曲列表 + 歌词 */}
        <div className="music-main">
          {/* 左侧：歌曲列表 */}
          <SongList
            songs={songs}
            onSongSelect={handleSongSelect}
            selectedSongId={selectedSong?.id}
          />

          {/* 右侧：歌词 */}
          <div className="lyrics-panel-wrapper">
            <Lyrics songId={selectedSong?.id} />
          </div>
        </div>
      </div>

      {/* 底部播放器 */}
      <div className="music-player-wrapper">
        <EnhancedMusicPlayer />
      </div>
    </div>
  );
}
