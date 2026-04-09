/**
 * 音乐播放器歌词组件
 * Music player lyrics component
 */

import { useEffect, useState, useRef } from "react";
import { useMusic } from "@/hooks/useMusic";
import { useLyricsMock } from "@/hooks/useLyricsMock";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // 如果提供了 songId，使用 Mock hook 获取歌词
  const { data: lyricsLRC } = useLyricsMock(songId);
  const hasSongId = !!songId;

  // 如果提供了 lyrics prop，使用它；否则使用 Mock hook 获取的数据
  const mockLyrics = hasSongId && lyricsLRC ? parseLRC(lyricsLRC) : DEFAULT_LYRICS;
  const finalLyrics = propLyrics || mockLyrics;

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

  // 自动滚动到当前歌词行
  useEffect(() => {
    if (activeIndex >= 0 && activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;

      // 计算滚动位置，使当前行居中
      const containerHeight = container.clientHeight;
      const lineTop = activeLine.offsetTop;
      const lineHeight = activeLine.clientHeight;
      const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  // 点击歌词行跳转
  const handleLineClick = (time: number) => {
    const duration = getDuration();
    if (duration > 0) {
      seek(time / duration);
    }
  };

  // 格式化时间标签
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      <div className="lyrics-header">
        <h3>歌词</h3>
        {finalLyrics.length > 0 && (
          <span className="lyrics-count">{finalLyrics.length} 行</span>
        )}
      </div>

      <div ref={containerRef} className="lyrics-content">
        {finalLyrics.map((line, index) => (
          <div
            key={index}
            ref={index === activeIndex ? activeLineRef : null}
            className={`lyrics-line ${index === activeIndex ? "active" : ""}`}
            onClick={() => handleLineClick(line.time)}
          >
            <span className="lyrics-time">{formatTime(line.time)}</span>
            <span className="lyrics-text">{line.text}</span>
          </div>
        ))}
      </div>

      {/* 歌词进度指示器 */}
      {activeIndex >= 0 && (
        <div className="lyrics-progress">
          <div className="lyrics-progress-bar">
            <div
              className="lyrics-progress-fill"
              style={{
                width: `${(currentTime / getDuration()) * 100 || 0}%`,
              }}
            />
          </div>
        </div>
      )}
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
    // 匹配 [mm:ss.xx] 格式的时间标签
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const [, mins, secs, centis, text] = match;
      const time = parseInt(mins) * 60 + parseInt(secs) + parseInt(centis) / 100;
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
