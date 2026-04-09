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

  // 场景1: 从歌单播放
  replaceAndPlay: (songs: Song[], index: number) => void;
  initializePlaylist: (songs: Song[]) => void;

  // 场景2: 从播放列表播放
  playSongAtIndex: (index: number) => void;

  // 场景3: 单曲插入播放
  insertAndPlay: (song: Song) => void;

  // 基础方法
  playSong: (song: Song) => void;
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

      // 场景1: 从歌单播放 - 替换整个播放列表并播放指定歌曲
      replaceAndPlay: (songs, index) => {
        const targetIndex = Math.max(0, Math.min(index, songs.length - 1));
        set({
          playlist: songs,
          currentIndex: targetIndex,
          currentSong: songs[targetIndex],
          isPlaying: true,
        });
      },

      // 初始化播放列表（只在首次加载时调用）
      initializePlaylist: (songs) => {
        const state = get();
        // 只有在播放列表为空时才初始化
        if (state.playlist.length === 0) {
          set({ playlist: songs });
        }
      },

      // 场景2: 从播放列表直接播放 - 只改变索引
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

      // 场景3: 单曲插入播放 - 如果不在列表中则插入到开头
      insertAndPlay: (song) => {
        const state = get();
        const index = state.playlist.findIndex((s) => s.id === song.id);

        if (index >= 0) {
          // 歌曲已在列表中，直接播放
          set({
            currentIndex: index,
            currentSong: state.playlist[index],
            isPlaying: true,
          });
        } else {
          // 歌曲不在列表中，插入到开头
          const newPlaylist = [song, ...state.playlist];
          set({
            playlist: newPlaylist,
            currentIndex: 0,
            currentSong: song,
            isPlaying: true,
          });
        }
      },

      // 播放指定歌曲（通用方法）
      playSong: (song) => {
        const state = get();

        // 在当前播放列表中查找
        const index = state.playlist.findIndex((s) => s.id === song.id);
        if (index >= 0) {
          set({
            currentSong: song,
            currentIndex: index,
            isPlaying: true,
          });
        } else {
          // 歌曲不在播放列表中，使用插入播放
          get().insertAndPlay(song);
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
