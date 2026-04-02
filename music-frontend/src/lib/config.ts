/**
 * 应用配置
 * App configuration
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9999",

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
