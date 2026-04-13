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

/**
 * Fisher-Yates 洗牌算法
 * 用于随机播放时打乱列表顺序
 */
function shufflePlaylist<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 播放器状态接口
interface MusicPlayerState {
  // 当前播放
  currentSong: Song | null;
  playlist: Song[]; // 当前播放列表
  originalPlaylist: Song[]; // 原始顺序列表（用于从随机模式恢复）
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
      originalPlaylist: [], // 原始列表初始化为空
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
        console.log('🔄 replaceAndPlay 调用');
        console.log('📋 歌曲数量:', songs.length);
        console.log('📍 目标索引:', index);

        const targetIndex = Math.max(0, Math.min(index, songs.length - 1));
        const targetSong = songs[targetIndex];

        console.log('🎵 播放歌曲:', targetSong?.title);
        console.log('🎵 歌曲 ID:', targetSong?.id);
        console.log('🔊 设置 isPlaying: true');

        const newState = {
          playlist: songs,
          originalPlaylist: songs, // 保存原始列表
          currentIndex: targetIndex,
          currentSong: targetSong,
          isPlaying: true,
        };

        console.log('📦 新状态:', newState);
        set(newState);

        // 立即检查状态是否更新
        setTimeout(() => {
          const currentState = get();
          console.log('🔍 当前状态检查:');
          console.log('  - currentSong:', currentState.currentSong?.title);
          console.log('  - isPlaying:', currentState.isPlaying);
          console.log('  - currentIndex:', currentState.currentIndex);
        }, 0);

        console.log('✅ replaceAndPlay 完成');
      },

      // 初始化播放列表（只在首次加载时调用）
      initializePlaylist: (songs) => {
        const state = get();
        // 只有在播放列表为空时才初始化
        if (state.playlist.length === 0) {
          set({
            playlist: songs,
            originalPlaylist: songs, // 保存原始列表
          });
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
            originalPlaylist: [song, ...state.originalPlaylist], // 同步更新原始列表
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
      togglePlay: () => {
        const currentState = get();
        console.log('🎛️ togglePlay 调用');
        console.log('📍 当前 isPlaying:', currentState.isPlaying);
        console.log('🔄 将切换为:', !currentState.isPlaying);

        set((state) => ({ isPlaying: !state.isPlaying }));

        // 检查状态是否更新
        setTimeout(() => {
          const newState = get();
          console.log('✅ togglePlay 完成');
          console.log('📍 新的 isPlaying:', newState.isPlaying);
        }, 0);
      },

      // 下一首
      nextSong: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let nextIndex = state.currentIndex + 1;

        switch (state.playMode) {
          case "shuffle":
            // 随机播放：按打乱后的列表顺序播放
            if (nextIndex >= state.playlist.length) {
              nextIndex = 0; // 播放完列表后循环
            }
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
            // 随机播放：按打乱后的列表顺序播放
            if (prevIndex < 0) {
              prevIndex = state.playlist.length - 1; // 循环到最后一首
            }
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
      setPlayMode: (mode) => {
        const state = get();
        const newMode = mode;

        // 如果是从非随机模式切换到随机模式，需要打乱列表
        if (newMode === "shuffle" && state.playMode !== "shuffle") {
          // 保存当前正在播放的歌曲
          const currentSong = state.currentSong;

          // 使用 Fisher-Yates 算法打乱列表
          const shuffledPlaylist = shufflePlaylist(state.originalPlaylist);

          // 找到当前歌曲在打乱后列表中的位置
          const newIndex = currentSong
            ? shuffledPlaylist.findIndex((s) => s.id === currentSong.id)
            : 0;

          set({
            playMode: newMode,
            playlist: shuffledPlaylist,
            currentIndex: newIndex >= 0 ? newIndex : 0,
          });
        }
        // 如果从随机模式切换回其他模式，恢复原始顺序
        else if (newMode !== "shuffle" && state.playMode === "shuffle") {
          const currentSong = state.currentSong;

          // 恢复原始顺序列表
          const restoredPlaylist = state.originalPlaylist;

          // 找到当前歌曲在原始列表中的位置
          const newIndex = currentSong
            ? restoredPlaylist.findIndex((s) => s.id === currentSong.id)
            : 0;

          set({
            playMode: newMode,
            playlist: restoredPlaylist,
            currentIndex: newIndex >= 0 ? newIndex : 0,
          });
        }
        // 其他情况只切换模式
        else {
          set({ playMode: newMode });
        }
      },

      // 清空播放列表
      clearPlaylist: () =>
        set({
          playlist: [],
          originalPlaylist: [], // 同时清空原始列表
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
