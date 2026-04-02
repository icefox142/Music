/**
 * 音乐播放器 Hook
 * Music player hook with Howler.js integration
 */

import { useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { useMusicStore } from "@/stores/useMusicStore";

export function useMusic() {
  const {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    setCurrentSong,
    setPlaylist,
    playSong,
    playSongAtIndex,
    togglePlay: storeTogglePlay,
    nextSong: storeNextSong,
    prevSong: storePrevSong,
    setVolume,
    setPlayMode,
    clearPlaylist,
  } = useMusicStore();

  // Howler.js 实例引用
  const soundRef = useRef<Howl | null>(null);

  // 初始化/更新 Howler 实例
  useEffect(() => {
    if (!currentSong) {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
      return;
    }

    // 清理旧实例
    if (soundRef.current) {
      soundRef.current.unload();
    }

    // 创建新实例
    const sound = new Howl({
      src: [currentSong.audioUrl],
      html5: true, // 使用 HTML5 Audio，支持流式播放
      volume: volume,
      autoplay: isPlaying,
      onend: () => {
        // 播放结束，自动下一首
        storeNextSong();
      },
      onloaderror: (_id: number, error: unknown) => {
        console.error("音频加载失败:", error);
      },
      onplayerror: (_id: number, error: unknown) => {
        console.error("音频播放失败:", error);
      },
    });

    soundRef.current = sound;

    return () => {
      sound.unload();
    };
  }, [currentSong?.id]); // 只在歌曲变化时重新创建

  // 同步播放状态
  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.play();
    } else {
      soundRef.current.pause();
    }
  }, [isPlaying]);

  // 同步音量
  useEffect(() => {
    if (!soundRef.current) return;
    soundRef.current.volume(volume);
  }, [volume]);

  // 跳转到指定进度
  const seek = useCallback((progress: number) => {
    if (!soundRef.current) return;
    const duration = soundRef.current.duration();
    if (duration) {
      soundRef.current.seek(progress * duration);
    }
  }, []);

  // 获取当前进度
  const getProgress = useCallback((): number => {
    if (!soundRef.current) return 0;
    const duration = soundRef.current.duration();
    const current = soundRef.current.seek();
    if (duration > 0) {
      return current / duration;
    }
    return 0;
  }, []);

  // 获取当前时间（秒）
  const getCurrentTime = useCallback((): number => {
    if (!soundRef.current) return 0;
    return soundRef.current.seek() as number;
  }, []);

  // 获取总时长（秒）
  const getDuration = useCallback((): number => {
    if (!soundRef.current) return 0;
    return soundRef.current.duration();
  }, []);

  // 切换播放/暂停
  const togglePlay = useCallback(() => {
    storeTogglePlay();
  }, [storeTogglePlay]);

  // 下一首
  const nextSong = useCallback(() => {
    storeNextSong();
  }, [storeNextSong]);

  // 上一首
  const prevSong = useCallback(() => {
    storePrevSong();
  }, [storePrevSong]);

  return {
    // 状态
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    playMode,

    // 播放控制
    togglePlay,
    nextSong,
    prevSong,
    playSong,
    playSongAtIndex,
    seek,

    // 进度相关
    getProgress,
    getCurrentTime,
    getDuration,

    // 设置
    setCurrentSong,
    setPlaylist,
    setVolume,
    setPlayMode,
    clearPlaylist,
  };
}
