/**
 * 音乐播放器音量控制组件
 * Music player volume control component
 */

import { useState, useRef, useEffect } from "react";
import { useMusic } from "@/hooks/useMusic";
import "./VolumeControl.css";

interface VolumeControlProps {
  className?: string;
  showLabel?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function VolumeControl({
  className = "",
  showLabel = false,
  orientation = "horizontal",
}: VolumeControlProps) {
  const { volume, setVolume } = useMusic();
  const [isDragging, setIsDragging] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [showSlider, setShowSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 初始化保存音量
  useEffect(() => {
    setPreviousVolume(volume);
  }, []);

  // 获取音量图标
  const getVolumeIcon = () => {
    if (volume === 0) return "🔇";
    if (volume < 0.3) return "🔈";
    if (volume < 0.7) return "🔉";
    return "🔊";
  };

  // 切换静音
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume > 0 ? previousVolume : 0.5);
    }
  };

  // 处理滑块拖动
  const handleVolumeChange = (clientX: number, clientY: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    let newVolume: number;

    if (orientation === "horizontal") {
      const position = clientX - rect.left;
      newVolume = Math.max(0, Math.min(1, position / rect.width));
    } else {
      const position = rect.bottom - clientY;
      newVolume = Math.max(0, Math.min(1, position / rect.height));
    }

    setVolume(newVolume);
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleVolumeChange(e.clientX, e.clientY);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleVolumeChange(e.touches[0].clientX, e.touches[0].clientY);
  };

  // 全局鼠标事件
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleVolumeChange(e.clientX, e.clientY);
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
  }, [isDragging]);

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.1));
        break;
      case "ArrowDown":
      case "ArrowLeft":
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.1));
        break;
      case "m":
      case "M":
        e.preventDefault();
        toggleMute();
        break;
    }
  };

  // 快速增减音量
  const handleVolumeAdjust = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
  };

  return (
    <div
      className={`volume-control volume-control-${orientation} ${className} ${
        showSlider ? "show-slider" : ""
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="音量控制"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={volume}
      aria-valuetext={`${Math.round(volume * 100)}%`}
    >
      {showLabel && (
        <span className="volume-label">
          {Math.round(volume * 100)}%
        </span>
      )}

      {/* 静音按钮 */}
      <button
        className="volume-mute-btn"
        onClick={toggleMute}
        title={volume > 0 ? "静音" : "取消静音"}
        aria-label={volume > 0 ? "静音" : "取消静音"}
      >
        {getVolumeIcon()}
      </button>

      {/* 音量滑块容器 */}
      <div
        className="volume-slider-wrapper"
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        {/* 快速减少按钮 */}
        <button
          className="volume-adjust-btn volume-decrease"
          onClick={() => handleVolumeAdjust(-0.1)}
          disabled={volume === 0}
          aria-label="减少音量"
        >
          −
        </button>

        {/* 音量滑块 */}
        <div
          ref={sliderRef}
          className={`volume-slider volume-slider-${orientation}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* 音量填充 */}
          <div
            className="volume-fill"
            style={{
              width: orientation === "horizontal" ? `${volume * 100}%` : "100%",
              height: orientation === "vertical" ? `${volume * 100}%` : "100%",
            }}
          >
            {/* 拖动点 */}
            <div
              className="volume-thumb"
              style={{
                left: orientation === "horizontal" ? `${volume * 100}%` : "50%",
                bottom: orientation === "vertical" ? `${volume * 100}%` : "50%",
              }}
            />
          </div>
        </div>

        {/* 快速增加按钮 */}
        <button
          className="volume-adjust-btn volume-increase"
          onClick={() => handleVolumeAdjust(0.1)}
          disabled={volume === 1}
          aria-label="增加音量"
        >
          +
        </button>
      </div>
    </div>
  );
}
