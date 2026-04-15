/**
 * 应用配置
 * App configuration
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9999",

  // 对象存储/CDN 基础 URL
  // 本地开发：使用后端服务器
  // 生产环境：使用 CDN 地址
  ossUrl: import.meta.env.VITE_OSS_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:9999",

  // 测试 JWT Token（从 API测试指南获取）
  // 实际使用时应该通过登录接口获取
  testToken: import.meta.env.VITE_TEST_TOKEN || "",
};

/**
 * 获取认证 Token
 */
export const getAuthToken = () => {
  return localStorage.getItem("access_token") || config.testToken;
};

/**
 * 设置认证 Token
 */
export const setAuthToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

/**
 * 清除认证 Token
 */
export const clearAuthToken = () => {
  localStorage.removeItem("access_token");
};

/**
 * 获取完整的资源 URL
 * 支持本地开发和生产环境
 * @param path 相对路径（如 "/emojis/1/耄神.png"）或完整 URL
 * @returns 完整的资源 URL
 *
 * 工作原理：
 * - 本地开发：如果 ossUrl == apiBaseUrl（默认情况），直接返回相对路径
 *   浏览器会自动解析为前端服务器地址（http://localhost:5174/emojis/1/耄神.png）
 * - 生产环境：如果设置了独立的 CDN URL，返回完整 CDN 地址
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "/placeholder.png";

  // 如果已经是完整 URL，直接返回
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 判断是否使用独立的 CDN（生产环境）
  const hasCdn = config.ossUrl && config.ossUrl !== config.apiBaseUrl;

  if (hasCdn) {
    // 生产环境：拼接 CDN URL
    const baseUrl = config.ossUrl.replace(/\/$/, "");
    const relativePath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${relativePath}`;
  } else {
    // 本地开发：直接返回相对路径，让浏览器自动解析
    // 例如："/emojis/1/耄神.png" → "http://localhost:5174/emojis/1/耄神.png"
    return path;
  }
};

/**
 * 从表情包对象中获取图片 URL
 * 兼容新旧 API 字段：优先使用 url（后端实际返回），降级到 imageUrl
 * @param emoji 表情包对象
 * @returns 图片 URL 路径
 */
export const getEmojiImageUrl = (emoji: Partial<{ url?: string; imageUrl?: string }>): string => {
  return emoji.url || emoji.imageUrl || "";
};
