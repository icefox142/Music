/**
 * 歌词 API
 * Lyrics API
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import api from "@/lib/axios";

export interface LyricsQueryParams {
  songId?: string;
  language?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface Lyrics {
  id: string;
  songId: string;
  content: string;
  language: string;
  isVerified: boolean;
  qualityScore: number;
  viewCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const lyricsApi = {
  /**
   * 获取歌词列表
   */
  getList: async (params: LyricsQueryParams): Promise<PaginatedResponse<Lyrics>> => {
    return api.get<PaginatedResponse<Lyrics>>("/api/client/music/lyrics", { params });
  },

  /**
   * 获取歌词详情
   */
  getById: async (id: string): Promise<ApiResponse<Lyrics>> => {
    return api.get<ApiResponse<Lyrics>>(`/api/client/music/lyrics/${id}`);
  },

  /**
   * 创建歌词
   */
  create: async (data: Partial<Lyrics>): Promise<ApiResponse<Lyrics>> => {
    return api.post<ApiResponse<Lyrics>>("/api/client/music/lyrics", data);
  },

  /**
   * 更新歌词
   */
  update: async (id: string, data: Partial<Lyrics>): Promise<ApiResponse<Lyrics>> => {
    return api.patch<ApiResponse<Lyrics>>(`/api/client/music/lyrics/${id}`, data);
  },

  /**
   * 删除歌词
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(`/api/client/music/lyrics/${id}`);
  },
};
