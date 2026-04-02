/**
 * 歌单 API
 * Playlists API
 */

import type { ApiResponse, PaginatedResponse, Playlist } from "@/types/api";
import api from "@/lib/axios";

export const playlistsApi = {
  /**
   * 获取歌单列表
   */
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    isPublic?: boolean;
    sortBy?: "playCount" | "createdAt" | "songCount";
    order?: "asc" | "desc";
  }): Promise<PaginatedResponse<Playlist>> => {
    return api.get<PaginatedResponse<Playlist>>("/api/client/playlists", { params });
  },

  /**
   * 获取我的歌单
   */
  getMine: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Playlist>> => {
    return api.get<PaginatedResponse<Playlist>>("/api/client/playlists/mine", { params });
  },

  /**
   * 获取公开歌单
   */
  getPublic: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Playlist>> => {
    return api.get<PaginatedResponse<Playlist>>("/api/client/playlists/public", { params });
  },

  /**
   * 获取歌单详情
   */
  getById: async (id: string): Promise<ApiResponse<Playlist>> => {
    return api.get<ApiResponse<Playlist>>(`/api/client/playlists/${id}`);
  },

  /**
   * 创建歌单
   */
  create: async (data: {
    name: string;
    description?: string;
    coverUrl?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<Playlist>> => {
    return api.post<ApiResponse<Playlist>>("/api/client/playlists", data);
  },

  /**
   * 更新歌单
   */
  update: async (id: string, data: Partial<Playlist>): Promise<ApiResponse<Playlist>> => {
    return api.patch<ApiResponse<Playlist>>(`/api/client/playlists/${id}`, data);
  },

  /**
   * 删除歌单
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(`/api/client/playlists/${id}`);
  },
};
