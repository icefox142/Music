/**
 * 用户 API
 * Users API
 */

import type { ApiResponse } from "@/types/api";
import api from "@/lib/axios";

export const usersApi = {
  /**
   * 获取用户信息
   */
  getInfo: async (): Promise<ApiResponse<{ message?: string }>> => {
    return api.get<ApiResponse<{ message?: string }>>("/api/client/client-users/info");
  },
};
