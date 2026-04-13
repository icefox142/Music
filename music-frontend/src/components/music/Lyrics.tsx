/**
 * 音乐播放器歌词组件
 * Music player lyrics component
 */

import { useEffect, useState, useRef } from "react";
import { useMusic } from "@/hooks/useMusic";
import { useLyricsMock } from "@/hooks/useLyricsMock";
import { useSongMock } from "@/hooks/useSongsMock";
import "./Lyrics.css";

interface LyricLine {
  time: number; // 时间（秒）
  text: string; // 歌词文本
}

interface LyricsProps {
  songId?: string; // 歌曲 ID（用于获取歌词）
  lyrics?: LyricLine[]; // 直接传入歌词数据
  className?: string;
}

// 默认示例歌词
const DEFAULT_LYRICS: LyricLine[] = [
  { time: 0, text: "暂无歌词" },
];

export function Lyrics({ songId, lyrics: propLyrics, className = "" }: LyricsProps) {
  const { getCurrentTime, getDuration, seek } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [centerLineCount, setCenterLineCount] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const LINE_HEIGHT = 32;

  const { data: lyricsLRC } = useLyricsMock(songId);
  const { data: song } = useSongMock(songId || "");
  const hasSongId = !!songId;

  // 如果提供了 lyrics prop，使用它；否则使用 Mock hook 获取的数据
  const mockLyrics = hasSongId && lyricsLRC ? parseLRC(lyricsLRC) : DEFAULT_LYRICS;
  const finalLyrics = propLyrics || mockLyrics;

  // 计算居中行数
  useEffect(() => {
    const updateCenterLineCount = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        if (containerHeight > 0) {
          const newCenterLineCount = Math.floor(containerHeight / LINE_HEIGHT / 2);
          setCenterLineCount(newCenterLineCount);
        }
      }
    };

    // 延迟执行，确保DOM已渲染
    const timer = setTimeout(updateCenterLineCount, 100);
    updateCenterLineCount();

    // 监听窗口大小变化
    window.addEventListener('resize', updateCenterLineCount);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCenterLineCount);
    };
  }, [finalLyrics.length]);

  // 更新当前时间
  useEffect(() => {
    const updateTimer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 100);

    return () => clearInterval(updateTimer);
  }, [getCurrentTime]);

  // 计算当前应该高亮的歌词行
  useEffect(() => {
    if (finalLyrics.length === 0 || finalLyrics[0].text === "暂无歌词") {
      setActiveIndex(-1);
      return;
    }

    // 找到最后一个时间小于等于当前时间的行
    let index = finalLyrics.findIndex((line, i) => {
      const nextLine = finalLyrics[i + 1];
      return (
        currentTime >= line.time &&
        (!nextLine || currentTime < nextLine.time)
      );
    });

    if (index === -1 && currentTime >= finalLyrics[finalLyrics.length - 1].time) {
      index = finalLyrics.length - 1;
    }

    setActiveIndex(index);
  }, [currentTime, finalLyrics]);

  // 计算滚动位置（使用 transform）
  const translateY = activeIndex >= 0 ? -(activeIndex - centerLineCount) * LINE_HEIGHT : 0;


  // 点击歌词行跳转
  const handleLineClick = (time: number) => {
    const duration = getDuration();
    if (duration > 0) {
      seek(time / duration);
    }
  };

  if (finalLyrics.length === 0 || (finalLyrics.length === 1 && finalLyrics[0].text === "暂无歌词")) {
    
    return (
      <div className={`lyrics-container ${className}`}>
        <div className="lyrics-empty">
          <p>🎵 暂无歌词</p>
          <small>播放音乐时自动加载歌词</small>
        </div>
      </div>
    );
  }


  return (
    <div className={`lyrics-container ${className}`}>
      {/* 歌曲封面 */}
      {song?.coverUrl && (
        <div className="lyrics-cover">
          <img src={song.coverUrl} alt={song.title} className="cover-image" />
        </div>
      )}

      <div ref={containerRef} className="lyrics-content">
        <div
          ref={listRef}
          className="lyrics-list"
          style={{
            transform: `translate3d(0, ${translateY}px, 0)`,
            transition: 'transform 0.6s ease-out'
          }}
        >
          {finalLyrics.map((line, index) => (
            <div
              key={index}
              className={`lyrics-line ${index === activeIndex ? "active" : ""}`}
              onClick={() => handleLineClick(line.time)}
            >
              <span className="lyrics-text">{line.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 解析 LRC 格式歌词
 * Parse LRC format lyrics
 *
 * LRC 格式示例:
 * [00:12.34]这是一行歌词
 * [00:23.45]这是另一行歌词
 */
export function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split("\n");
  const lyrics: LyricLine[] = [];

  for (const line of lines) {
    // 匹配 [mm:ss.xx] 或 [mm:ss.xxx] 格式的时间标签
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const [, mins, secs, centis, text] = match;
      // 正确处理毫秒：2位除以100，3位除以1000
      const centisNum = parseInt(centis);
      const milliseconds = centisNum.toString().length === 2
        ? centisNum / 100
        : centisNum / 1000;
      const time = parseInt(mins) * 60 + parseInt(secs) + milliseconds;
      const trimmedText = text.trim();

      if (trimmedText) {
        lyrics.push({ time, text: trimmedText });
      }
    }
  }

  return lyrics;
}

/**
 * 获取歌词文本（用于编辑）
 * Get lyrics text (for editing)
 */
export function lyricsToText(lyrics: LyricLine[]): string {
  return lyrics
    .map((line) => {
      const mins = Math.floor(line.time / 60);
      const secs = Math.floor(line.time % 60);
      const centis = Math.round((line.time % 1) * 100);
      const timeTag = `[${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}]`;
      return `${timeTag}${line.text}`;
    })
    .join("\n");
}
