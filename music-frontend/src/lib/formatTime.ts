/**
 * 格式化时间工具函数
 * Format time utility functions
 */

/**
 * 格式化时间（秒 -> MM:SS 或 HH:MM:SS）
 * Format time (seconds -> MM:SS or HH:MM:SS)
 *
 * @param seconds - 秒数
 * @param showHours - 是否显示小时（默认 false）
 * @returns 格式化后的时间字符串
 *
 * @example
 * formatTime(65) // "1:05"
 * formatTime(3665) // "1:01:05"
 * formatTime(65, true) // "0:01:05"
 */
export function formatTime(seconds: number, showHours = false): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return showHours ? "0:00:00" : "0:00";
  }

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (showHours || hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 格式化时间（秒 -> 中文描述）
 * Format time (seconds -> Chinese description)
 *
 * @param seconds - 秒数
 * @returns 中文时间描述
 *
 * @example
 * formatTimeChinese(65) // "1分5秒"
 * formatTimeChinese(3665) // "1小时1分5秒"
 */
export function formatTimeChinese(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return "0秒";
  }

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}小时`);
  }
  if (mins > 0) {
    parts.push(`${mins}分`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}秒`);
  }

  return parts.join("");
}
