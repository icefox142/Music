/**
 * 表情包 API
 * Emojis API
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import api from "@/lib/axios";

export interface Emoji {
  id: string;
  name: string;
  description: string | null;
  keywords: string[];
  category: string | null;
  imageUrl: string;
  gifUrl: string | null;
  stickerUrl: string | null;
  tags: string[];
  isPublic: boolean;
  status: "ENABLED" | "DISABLED";
  createdAt: string;
  updatedAt: string;
}

export interface EmojiQueryParams {
  page?: number;
  pageSize?: number;
  tags?: string[];
  tagsAll?: string[];
  category?: string;
  sortBy?: "createdAt" | "name";
  order?: "asc" | "desc";
}

export const emojisApi = {
  /**
   * 获取表情包列表
   */
  getList: async (params: EmojiQueryParams): Promise<PaginatedResponse<Emoji>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Emoji>>>(
      "/api/client/emojis",
      { params }
    );
    return response.data;
  },

  /**
   * 获取表情包详情
   */
  getById: async (id: string): Promise<ApiResponse<Emoji>> => {
    return api.get<ApiResponse<Emoji>>(`/api/client/emojis/${id}`);
  },

  /**
   * 创建表情包
   */
  create: async (data: Partial<Emoji>): Promise<ApiResponse<Emoji>> => {
    return api.post<ApiResponse<Emoji>>("/api/client/emojis", data);
  },

  /**
   * 更新表情包
   */
  update: async (id: string, data: Partial<Emoji>): Promise<ApiResponse<Emoji>> => {
    return api.patch<ApiResponse<Emoji>>(`/api/client/emojis/${id}`, data);
  },

  /**
   * 删除表情包
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(`/api/client/emojis/${id}`);
  },
};
