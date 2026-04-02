/**
 * 表情包集合 API
 * Emoji Collections API
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import api from "@/lib/axios";

export interface EmojiCollection {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string;
  tags: string[];
  isFeatured: boolean;
  sortOrder: number;
  downloadCount: number;
  status: "ENABLED" | "DISABLED";
  createdAt: string;
  updatedAt: string;
  emojis?: any[];
}

export interface CollectionQueryParams {
  page?: number;
  pageSize?: number;
  tags?: string[];
  tagsAll?: string[];
  isFeatured?: boolean;
  status?: "ENABLED" | "DISABLED";
  sortBy?: "sortOrder" | "createdAt" | "downloadCount";
  order?: "asc" | "desc";
}

export const emojiCollectionsApi = {
  /**
   * 获取表情包集合列表
   */
  getList: async (params: CollectionQueryParams): Promise<PaginatedResponse<EmojiCollection>> => {
    return api.get<PaginatedResponse<EmojiCollection>>("/api/client/emoji-collections", { params });
  },

  /**
   * 获取集合详情
   */
  getById: async (id: string): Promise<ApiResponse<EmojiCollection>> => {
    return api.get<ApiResponse<EmojiCollection>>(`/api/client/emoji-collections/${id}`);
  },

  /**
   * 创建集合
   */
  create: async (data: Partial<EmojiCollection>): Promise<ApiResponse<EmojiCollection>> => {
    return api.post<ApiResponse<EmojiCollection>>("/api/client/emoji-collections", data);
  },

  /**
   * 更新集合
   */
  update: async (id: string, data: Partial<EmojiCollection>): Promise<ApiResponse<EmojiCollection>> => {
    return api.patch<ApiResponse<EmojiCollection>>(`/api/client/emoji-collections/${id}`, data);
  },

  /**
   * 删除集合
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(`/api/client/emoji-collections/${id}`);
  },

  /**
   * 记录下载
   */
  incrementDownload: async (id: string): Promise<ApiResponse<{ downloadCount: number }>> => {
    return api.post<ApiResponse<{ downloadCount: number }>>(
      `/api/client/emoji-collections/${id}/download`
    );
  },
};
