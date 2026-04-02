/**
 * 音乐播放器状态管理
 * Music player state management with Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@/types/api";

// 重新导出 Song 类型
export type { Song };

// 播放模式
export type PlayMode = "sequence" | "shuffle" | "loop-one" | "loop-all";

// 播放器状态接口
interface MusicPlayerState {
  // 当前播放
  currentSong: Song | null;
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  playMode: PlayMode;

  // 操作方法
  setCurrentSong: (song: Song | null) => void;
  setPlaylist: (songs: Song[]) => void;
  playSong: (song: Song, playlist?: Song[]) => void;
  playSongAtIndex: (index: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  setPlayMode: (mode: PlayMode) => void;
  clearPlaylist: () => void;
}

// 创建 Zustand store
export const useMusicStore = create<MusicPlayerState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentSong: null,
      playlist: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 0.7,
      playMode: "sequence",

      // 设置当前歌曲
      setCurrentSong: (song) => set({ currentSong: song }),

      // 设置播放列表
      setPlaylist: (songs) => set({ playlist: songs }),

      // 播放指定歌曲（可选择是否更新播放列表）
      playSong: (song, playlist) => {
        const state = get();

        if (playlist) {
          const index = playlist.findIndex((s) => s.id === song.id);
          set({
            playlist,
            currentSong: song,
            currentIndex: index >= 0 ? index : 0,
            isPlaying: true,
          });
        } else {
          // 在当前播放列表中查找
          const index = state.playlist.findIndex((s) => s.id === song.id);
          if (index >= 0) {
            set({
              currentSong: song,
              currentIndex: index,
              isPlaying: true,
            });
          } else {
            // 不在列表中，单独播放
            set({
              currentSong: song,
              isPlaying: true,
            });
          }
        }
      },

      // 播放指定索引的歌曲
      playSongAtIndex: (index) => {
        const state = get();
        if (index >= 0 && index < state.playlist.length) {
          set({
            currentSong: state.playlist[index],
            currentIndex: index,
            isPlaying: true,
          });
        }
      },

      // 切换播放/暂停
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      // 下一首
      nextSong: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let nextIndex = state.currentIndex + 1;

        switch (state.playMode) {
          case "shuffle":
            // 随机播放
            nextIndex = Math.floor(Math.random() * state.playlist.length);
            break;
          case "loop-one":
            // 单曲循环，不切换
            nextIndex = state.currentIndex;
            break;
          case "loop-all":
            // 列表循环
            if (nextIndex >= state.playlist.length) {
              nextIndex = 0;
            }
            break;
          case "sequence":
          default:
            // 顺序播放，到列表末尾停止
            if (nextIndex >= state.playlist.length) {
              set({ isPlaying: false });
              return;
            }
            break;
        }

        set({
          currentSong: state.playlist[nextIndex],
          currentIndex: nextIndex,
          isPlaying: true,
        });
      },

      // 上一首
      prevSong: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let prevIndex = state.currentIndex - 1;

        switch (state.playMode) {
          case "shuffle":
            // 随机播放
            prevIndex = Math.floor(Math.random() * state.playlist.length);
            break;
          case "loop-one":
            // 单曲循环，不切换
            prevIndex = state.currentIndex;
            break;
          case "loop-all":
            // 列表循环
            if (prevIndex < 0) {
              prevIndex = state.playlist.length - 1;
            }
            break;
          case "sequence":
          default:
            // 顺序播放，到列表开头停止
            if (prevIndex < 0) {
              set({ isPlaying: false });
              return;
            }
            break;
        }

        set({
          currentSong: state.playlist[prevIndex],
          currentIndex: prevIndex,
          isPlaying: true,
        });
      },

      // 设置音量
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      // 设置播放模式
      setPlayMode: (mode) => set({ playMode: mode }),

      // 清空播放列表
      clearPlaylist: () =>
        set({
          playlist: [],
          currentSong: null,
          currentIndex: -1,
          isPlaying: false,
        }),
    }),
    {
      name: "music-player-storage", // localStorage key
      partialize: (state) => ({
        volume: state.volume,
        playMode: state.playMode,
        // 不持久化播放状态和歌曲，刷新后重新开始
      }),
    }
  )
);
