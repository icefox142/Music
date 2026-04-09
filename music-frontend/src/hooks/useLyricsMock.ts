/**
 * 歌词 Mock 数据 Hook
 * 使用 Mock 数据，不依赖后端 API
 */

import { useState, useEffect } from "react";

// Mock 歌词数据（LRC 格式）
const mockLyrics: Record<string, string> = {
  default: `
[00:00.00]欢迎收听音乐播放器
[00:05.23]这是一首示例歌曲
[00:10.45]歌词会随着播放自动滚动
[00:15.67]当前播放的歌词会高亮显示
[00:20.89]您可以点击歌词跳转到对应位置
[00:25.34]支持多种播放模式切换
[00:30.56]顺序播放、随机播放、单曲循环
[00:35.78]列表循环等多种模式
[00:40.90]音量可以自由调节
[00:45.12]支持键盘快捷键控制
[00:50.34]使用方向键调节音量
[00:55.56]按 M 键切换静音
[01:00.00]感谢您的收听
`,
  "1": `
[00:00.00]Time to Pretend
[00:05.00]Lazer Boomerang
[00:10.00]纯音乐 - 电子合成器波
[00:15.00]享受这首音乐的律动
[00:20.00]感受合成器的美妙音色
[00:25.00]沉浸在这首伪装时刻
[00:30.00]百万级装备试听体验
[00:35.00]Hi-Res 高解析度音质
[00:40.00]让音乐带你进入另一个世界
[00:45.00]Time to pretend...
[00:50.00]享受这段音乐旅程
`,
  "2": `
[00:00.00]Signals
[00:05.00]Electronic Music Series
[00:10.00]好听的电子音乐系列
[00:15.00]接收来自电波的信号
[00:20.00]Signals in the air
[00:25.00]让节奏触动你的心灵
[00:30.00]电子音乐的魅力
[00:35.00]无法抗拒的旋律
[00:40.00]Signals all around
[00:45.00]感受音乐的力量
`,
};

// 模拟网络延迟
const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 获取歌曲歌词 - Mock 版本
 */
export function useLyricsMock(songId?: string) {
  const [data, setData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 模拟网络延迟
        await delay();

        // 根据 songId 获取对应的歌词，如果没有则使用默认歌词
        const lyrics = songId ? (mockLyrics[songId] || mockLyrics.default) : mockLyrics.default;

        setData(lyrics);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [songId]);

  return {
    data,
    isLoading,
    error,
  };
}

/**
 * 获取所有 Mock 歌词（用于调试）
 */
export function getAllLyricsMock() {
  return mockLyrics;
}
