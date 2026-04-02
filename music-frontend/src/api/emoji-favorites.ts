/**
 * 表情收藏 API
 * Emoji Favorites API
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import api from "@/lib/axios";

export interface EmojiFavorite {
  id: string;
  userId: string;
  emojiId: string;
  emoji?: any;
  createdAt: string;
}

export interface FavoriteQueryParams {
  page?: number;
  pageSize?: number;
}

export const emojiFavoritesApi = {
  /**
   * 获取我的收藏列表
   */
  getList: async (params?: FavoriteQueryParams): Promise<PaginatedResponse<EmojiFavorite>> => {
    return api.get<PaginatedResponse<EmojiFavorite>>("/api/client/emoji-favorites", { params });
  },

  /**
   * 添加收藏
   */
  add: async (emojiId: string): Promise<ApiResponse<EmojiFavorite>> => {
    return api.post<ApiResponse<EmojiFavorite>>("/api/client/emoji-favorites", { emojiId });
  },

  /**
   * 取消收藏
   */
  remove: async (emojiId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(
      `/api/client/emoji-favorites/${emojiId}`
    );
  },

  /**
   * 检查收藏状态
   */
  check: async (emojiId: string): Promise<ApiResponse<{ isFavorited: boolean }>> => {
    return api.get<ApiResponse<{ isFavorited: boolean }>>(
      `/api/client/emoji-favorites/${emojiId}/check`
    );
  },
};
