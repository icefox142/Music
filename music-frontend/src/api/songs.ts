/**
 * 歌曲 API
 * Songs API
 */

import type { ApiResponse, PaginatedResponse, SongQueryParams, Song } from "@/types/api";
import api from "@/lib/axios";

export const songsApi = {
  /**
   * 获取歌曲列表
   */
  getList: async (params: SongQueryParams): Promise<PaginatedResponse<Song>> => {
    return api.get<PaginatedResponse<Song>>("/api/client/songs", { params });
  },

  /**
   * 获取歌曲详情
   */
  getById: async (id: string): Promise<ApiResponse<Song>> => {
    return api.get<ApiResponse<Song>>(`/api/client/songs/${id}`);
  },

  /**
   * 创建歌曲
   */
  create: async (data: Partial<Song>): Promise<ApiResponse<Song>> => {
    return api.post<ApiResponse<Song>>("/api/client/songs", data);
  },

  /**
   * 更新歌曲
   */
  update: async (id: string, data: Partial<Song>): Promise<ApiResponse<Song>> => {
    return api.patch<ApiResponse<Song>>(`/api/client/songs/${id}`, data);
  },

  /**
   * 删除歌曲
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(`/api/client/songs/${id}`);
  },
};
