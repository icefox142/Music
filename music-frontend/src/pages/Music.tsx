/**
 * 音乐页面
 * Music page - 平行组件布局
 */

import { EnhancedMusicPlayer, SongList, Lyrics } from "@/components/music";
import { useMusic } from "@/hooks/useMusic";
import { useSongsMock } from "@/hooks/useSongsMock";
import type { Song } from "@/types/api";
import "./Music.css";

export function Music() {
  const { currentSong, replaceAndPlay } = useMusic();
  const { data: songs = [] } = useSongsMock({ page: 1, pageSize: 50 });

  const handleSongSelect = (song: Song) => {
    console.log('🎵 点击歌曲:', song.title);
    console.log('📍 歌曲信息:', song);

    // 找到歌曲在列表中的索引
    const index = songs.findIndex((s) => s.id === song.id);
    console.log('📍 歌曲索引:', index);

    if (index >= 0) {
      console.log('▶️ 调用 replaceAndPlay');
      // 场景1: 从歌单播放 - 替换整个播放列表并播放指定歌曲
      replaceAndPlay(songs, index);
    } else {
      console.error('❌ 歌曲不在列表中');
    }
  };

  return (
    <div className="music-page">
      <div className="music-content">


        {/* 主内容区：歌曲列表 + 歌词 */}
        <div className="music-main">
          {/* 左侧：歌曲列表 */}
          <SongList
            songs={songs}
            onSongSelect={handleSongSelect}
            selectedSongId={currentSong?.id}
          />

          {/* 右侧：歌词 */}
          <div className="lyrics-panel-wrapper">
            <Lyrics songId={currentSong?.id} />
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
