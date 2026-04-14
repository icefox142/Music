/**
 * 音乐播放器 Hook - 修复版
 */

import { useEffect, useRef, useCallback } from "react";
import { useMusicStore } from "@/stores/useMusicStore";

// 获取 store 的 setState 方法（用于直接修改状态）
const setMusicState = useMusicStore.setState;

// 全局单例 Audio 元素，避免 StrictMode 导致的重复创建
let globalAudioElement: HTMLAudioElement | null = null;
let globalAudioInitialized = false;

export function useMusic() {
  const {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    playSong,
    playSongAtIndex,
    replaceAndPlay,
    insertAndPlay,
    togglePlay: storeTogglePlay,
    nextSong: storeNextSong,
    prevSong: storePrevSong,
    setVolume,
    setPlayMode,
  } = useMusicStore();

  // 调试：监听状态变化
  useEffect(() => {
    console.log('🎼 useMusic: 状态变化');
    console.log('  - currentSong:', currentSong?.title);
    console.log('  - isPlaying:', isPlaying);
    console.log('  - currentIndex:', currentIndex);
    console.log('  - audio状态:', audioRef.current ? (audioRef.current.paused ? 'paused' : 'playing') : 'null');
  }, [currentSong, isPlaying, currentIndex]);

  // 获取 store 的 get 方法用于读取状态
  const storeGet = useMusicStore.getState.bind(useMusicStore);

  // 使用 ref 保存稳定的引用，避免依赖数组问题
  const storeNextSongRef = useRef(storeNextSong);
  const storeTogglePlayRef = useRef(storeTogglePlay);
  const storePrevSongRef = useRef(storePrevSong);

  // 同步最新的 store 函数到 ref
  useEffect(() => {
    storeNextSongRef.current = storeNextSong;
    storeTogglePlayRef.current = storeTogglePlay;
    storePrevSongRef.current = storePrevSong;
  }, [storeNextSong, storeTogglePlay, storePrevSong]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSongIdRef = useRef<string | undefined>(undefined);
  const isInitializingRef = useRef<boolean>(false);
  const shouldPlayRef = useRef<boolean>(false);
  const failedSongsRef = useRef<Set<string>>(new Set()); // 记录失败的歌曲ID
  const consecutiveErrorsRef = useRef<number>(0); // 连续错误计数

  // 初始化全局 Audio 元素（只执行一次）
  useEffect(() => {
    // 如果全局 Audio 已经初始化，直接复用
    if (globalAudioInitialized && globalAudioElement) {
      console.log('♻️ 复用全局 Audio 元素');
      audioRef.current = globalAudioElement;

      // 🔥 关键：同步 Audio 实际播放状态到 store
      const actuallyPlaying = !globalAudioElement.paused;
      const state = storeGet();
      console.log('🔄 当前 store 状态:', {
        isPlaying: state.isPlaying,
        currentSong: state.currentSong?.title,
        currentIndex: state.currentIndex
      });
      console.log('🔄 Audio 实际状态:', {
        paused: globalAudioElement.paused,
        src: globalAudioElement.src,
        currentTime: globalAudioElement.currentTime
      });

      // 🔥 优化：只在实际需要时才同步状态，避免不必要的状态更新
      if (actuallyPlaying !== state.isPlaying && state.currentSong) {
        console.log('🔄 同步播放状态:', actuallyPlaying);
        setMusicState({ isPlaying: actuallyPlaying });
      }

      // 🔥 关键：设置 refs，避免重复初始化
      currentSongIdRef.current = state.currentSong?.id;
      shouldPlayRef.current = state.isPlaying;
      isInitializingRef.current = false; // 🔥 确保不会被认为是初始化中

      console.log('✅ Audio 元素复用完成，状态已同步');
      return;
    }

    // 创建全局 Audio 元素
    console.log('🌐 创建全局 Audio 元素');
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = 'auto';

    // 保存事件处理函数引用，以便清理
    const handleEnded = () => {
      const state = storeGet(); // 获取当前 store 状态

      // 🔥 歌曲正常播放结束，重置连续错误计数
      consecutiveErrorsRef.current = 0;

      if (state.playMode === "loop-one") {
        // 单曲循环：重新播放当前歌曲
        console.log('🔂 单曲循环，重新播放');
        audio.currentTime = 0; // 重置播放时间
        audio.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('单曲循环播放失败:', err);
          }
        });
      } else {
        // 其他模式：播放下一首
        console.log('✅ 播放结束，自动下一首');
        storeNextSongRef.current();
      }
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const mediaError = target.error;

      // 🔥 关键：忽略 ABORTED 错误 (code = 1)
      if (mediaError?.code === MediaError.MEDIA_ERR_ABORTED) {
        console.log('⏹️ 请求被中止（可能是 StrictMode 导致，忽略）');
        return;
      }

      const state = storeGet();
      const currentSongId = state.currentSong?.id;

      console.error('❌ 音频错误:', {
        url: target.src,
        code: mediaError?.code,
        message: mediaError?.message,
        songId: currentSongId,
      });

      isInitializingRef.current = false;

      // 🔥 只处理真正的加载错误（MEDIA_ERR_SRC_NOT_SUPPORTED = 4）
      if (mediaError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED && currentSongId) {
        // 检查是否已经尝试过这首歌
        if (failedSongsRef.current.has(currentSongId)) {
          console.log('⚠️ 这首歌已经失败过，停止尝试');
          return;
        }

        // 记录失败的歌曲
        failedSongsRef.current.add(currentSongId);
        consecutiveErrorsRef.current++;

        console.log(`📝 连续失败次数: ${consecutiveErrorsRef.current}`);

        // 如果连续失败超过 3 次，停止自动跳转
        if (consecutiveErrorsRef.current >= 2) {
          console.error('🛑 连续失败次数过多，停止自动播放');
          setMusicState({ isPlaying: false });
          return;
        }

        // 自动跳到下一首
        console.log('⏭️ 歌曲加载失败，自动跳到下一首');
        setTimeout(() => {
          storeNextSongRef.current();
          alert('🎵 这首歌暂时不存在，即将为您播放下一首');
        }, 1000); // 延迟 1 秒，让用户看到错误
      }
    };

    const handleCanPlay = () => {
      console.log('✅ 可以播放');
      isInitializingRef.current = false;

      // 🔥 歌曲成功加载，重置连续错误计数
      consecutiveErrorsRef.current = 0;
      console.log('📊 重置连续错误计数');

      // 🔥 关键：检查用户是否明确请求了暂停
      // 如果音频当前正在播放但 shouldPlayRef 是 false，说明用户在加载期间点击了暂停
      if (!audio.paused && !shouldPlayRef.current) {
        console.log('⏸️ 检测到用户暂停请求，停止自动播放');
        audio.pause();
        return;
      }

      if (shouldPlayRef.current && audio.paused) {
        console.log('▶️ 自动播放');
        audio.play().catch((err) => {
          // 忽略中止错误
          if (err.name === 'AbortError' || err.message?.includes('aborted')) {
            return;
          }
          console.error('自动播放失败:', err);
        });
      } else {
        console.log('⏸️ 不需要播放 (shouldPlay:', shouldPlayRef.current, ', paused:', audio.paused, ')');
      }
    };

    const handleLoadStart = () => {
      console.log('📥 开始加载音频');
    };

    // 绑定事件
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    // 保存为全局单例
    globalAudioElement = audio;
    globalAudioInitialized = true;
    audioRef.current = audio;

    console.log('✅ 全局 Audio 元素初始化完成');

    // 清理函数（组件卸载时不会清理全局 Audio）
    return () => {
      console.log('🔌 组件卸载，保留全局 Audio 元素');
      audioRef.current = null;
    };
  }, []); // 空依赖数组，只在第一次挂载时执行

  // 更新音频源
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('❌ Audio 元素未初始化');
      return;
    }

    if (!currentSong) {
      console.log('⚠️ currentSong 为 null');
      // 🔥 只在没有播放任何歌曲时才清空
      if (!audio.src || audio.src === window.location.href) {
        audio.pause();
        audio.src = '';
        currentSongIdRef.current = undefined;
        shouldPlayRef.current = false;
        isInitializingRef.current = false;
      }
      return;
    }

    // 同一首歌不重复加载
    if (currentSongIdRef.current === currentSong.id) {
      console.log('⏭️ 同一首歌，跳过加载');
      console.log('📍 当前歌曲ID:', currentSongIdRef.current);
      console.log('📍 新歌曲ID:', currentSong.id);
      console.log('📍 Audio当前状态:', {
        paused: audio.paused,
        currentTime: audio.currentTime,
        src: audio.src
      });

      // 🔥 关键修复：确认已经在播放正确的歌曲，完全跳过初始化
      if (audio.src && audio.src !== window.location.href) {
        console.log('✅ Audio已经有正确的源，跳过所有初始化');
        isInitializingRef.current = false;
        shouldPlayRef.current = isPlaying;

        // 只同步播放状态
        if (isPlaying && audio.paused) {
          console.log('▶️ 同一首歌，恢复播放');
          audio.play().catch((err) => {
            console.error('播放失败:', err);
          });
        } else if (!isPlaying && !audio.paused) {
          console.log('⏸️ 同一首歌，暂停播放');
          audio.pause();
        }

        return; // 🔥 提前返回，不执行后续任何初始化代码
      }

      // 如果Audio没有正确的源，继续执行初始化
      console.log('⚠️ Audio没有正确的源，需要重新加载');
    }

    // 防止快速切换导致的竞态
    if (isInitializingRef.current) {
      console.log('⏳ 正在初始化中，跳过');
      return;
    }

    console.log('🎵 切换到:', currentSong.title);
    console.log('📍 isPlaying 状态:', isPlaying);
    isInitializingRef.current = true;
    shouldPlayRef.current = isPlaying;

    // 🔥 切换到新歌曲时重置连续错误计数
    consecutiveErrorsRef.current = 0;

    // 🔥 清除这首歌的失败记录（给用户手动选择的歌曲一个新的机会）
    if (currentSong.id && failedSongsRef.current.has(currentSong.id)) {
      failedSongsRef.current.delete(currentSong.id);
      console.log('🔄 清除歌曲失败记录:', currentSong.id);
    }

    try {
      // 先暂停
      audio.pause();

      // 清空旧 src（这会触发 ABORTED 错误，但已被忽略）
      const oldSrc = audio.src;
      if (oldSrc) {
        audio.src = '';
      }

      // 设置新 src
      console.log('🌐 加载音频 URL:', currentSong.audioUrl);
      audio.src = currentSong.audioUrl;
      audio.load();

      currentSongIdRef.current = currentSong.id;

    } catch (err) {
      console.error('设置音频源失败:', err);
      isInitializingRef.current = false;
      shouldPlayRef.current = false;
    }

  }, [currentSong?.id, currentSong?.audioUrl]); // 移除 isPlaying 依赖，避免状态变化时重新加载音频

  // 同步播放状态
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) {
      console.log('⚠️ 播放状态检查: audio 或 currentSong 为空');
      return;
    }

    console.log('🎵 播放状态同步');
    console.log('  - currentSong:', currentSong.title);
    console.log('  - isPlaying:', isPlaying);
    console.log('  - audio.paused:', audio.paused);
    console.log('  - isInitializing:', isInitializingRef.current);
    console.log('  - currentSongIdRef:', currentSongIdRef.current);

    shouldPlayRef.current = isPlaying;

    // 🔥 关键优化：如果正在初始化且是同一首歌，跳过状态同步
    if (isInitializingRef.current && currentSongIdRef.current === currentSong.id) {
      console.log('⏳ 正在初始化同一首歌，等待初始化完成...');
      return;
    }

    // 🔥 关键修复：如果用户明确要暂停（isPlaying = false），立即执行暂停，
    // 即使正在初始化。这会阻止 canplay 事件的自动播放
    if (!isPlaying && !audio.paused) {
      console.log('⏸️ 用户请求暂停，强制停止（即使正在初始化）');
      audio.pause();
      // 不要重置 isInitializingRef，让加载流程继续完成
      return;
    }

    // 初始化中等待 canplay
    if (isInitializingRef.current) {
      console.log('⏳ 等待初始化完成...');
      return;
    }

    // 🔥 关键：检查 Audio 的实际播放状态，避免不必要的暂停/播放
    const actuallyPlaying = !audio.paused;
    console.log('🔄 Audio 实际播放状态:', actuallyPlaying);

    if (isPlaying && !actuallyPlaying) {
      // 应该播放但实际未播放 → 播放
      console.log('▶️ 应该播放但实际未播放 → 开始播放');
      audio.play().catch((err) => {
        // 忽略中止错误
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          console.log('✅ 忽略播放中止错误');
          return;
        }
        console.error('❌ 播放失败:', err);
      });
    } else if (!isPlaying && actuallyPlaying) {
      // 不应该播放但实际在播放 → 暂停
      console.log('⏸️ 不应该播放但实际在播放 → 暂停');
      audio.pause();
    } else {
      console.log('✅ 状态一致，无需操作');
    }
  }, [isPlaying]); // 🔥 移除 currentSong?.id 依赖，避免歌曲切换时重新执行

  // 同步音量
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // 工具函数...
  const seek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = progress * audio.duration;
  }, []);

  const getProgress = useCallback((): number => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return 0;
    return audio.currentTime / audio.duration;
  }, []);

  const getCurrentTime = useCallback((): number => {
    return audioRef.current?.currentTime || 0;
  }, []);

  const getDuration = useCallback((): number => {
    return audioRef.current?.duration || 0;
  }, []);

  const togglePlay = useCallback(() => {
    storeTogglePlayRef.current();
  }, []);

  const nextSong = useCallback(() => {
    storeNextSongRef.current();
  }, []);

  const prevSong = useCallback(() => {
    storePrevSongRef.current();
  }, []);

  return {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    playSong,
    playSongAtIndex,
    replaceAndPlay,
    insertAndPlay,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    setPlayMode,
    getProgress,
    getCurrentTime,
    getDuration,
  };
}
