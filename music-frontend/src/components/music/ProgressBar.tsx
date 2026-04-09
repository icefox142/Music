/**
 * 音乐播放器进度条组件
 * Music player progress bar component
 */

import { useEffect, useState, useRef } from "react";
import { useMusic } from "@/hooks/useMusic";
import "./ProgressBar.css";

interface ProgressBarProps {
  className?: string;
}

export function ProgressBar({ className = "" }: ProgressBarProps) {
  const { getCurrentTime, getDuration, seek, getProgress } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const updateTimerRef = useRef<number | undefined>(undefined);

  // 更新进度
  useEffect(() => {
    if (isDragging) return;

    const updateProgress = () => {
      const current = getCurrentTime();
      const dur = getDuration();
      const prog = getProgress();

      setCurrentTime(current);
      setDuration(dur);
      setProgress(prog);
    };

    updateProgress();
    updateTimerRef.current = window.setInterval(updateProgress, 100);

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [getCurrentTime, getDuration, getProgress, isDragging]);

  // 处理进度条点击/拖动
  const handleSeek = (clientX: number) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const clickProgress = Math.max(0, Math.min(1, clickPosition / rect.width));

    setProgress(clickProgress);
    setCurrentTime(clickProgress * duration);
    seek(clickProgress);
  };

  // 鼠标/触摸事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  // 触摸事件支持
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSeek(e.touches[0].clientX);
  };

  // 全局鼠标事件
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleSeek(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, duration]);

  if (duration === 0) {
    return null;
  }

  return (
    <div className={`progress-bar-container ${className}`}>
      {/* 当前时间 */}
      <span className="time-label time-current">
        {formatTime(currentTime)}
      </span>

      {/* 进度条 */}
      <div
        ref={progressBarRef}
        className="progress-bar"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 缓冲进度（可选） */}
        <div className="progress-buffer" style={{ width: "0%" }} />

        {/* 播放进度 */}
        <div
          className="progress-fill"
          style={{ width: `${progress * 100}%` }}
        >
          {/* 拖动点 */}
          <div className="progress-thumb" />
        </div>
      </div>

      {/* 总时长 */}
      <span className="time-label time-duration">
        {formatTime(duration)}
      </span>
    </div>
  );
}

/**
 * 格式化时间（秒 -> MM:SS）
 * Format time (seconds -> MM:SS)
 */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
