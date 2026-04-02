/**
 * 歌单歌曲 API
 * Playlist Songs API
 */

import type { ApiResponse, PlaylistSong } from "@/types/api";
import api from "@/lib/axios";

export const playlistSongsApi = {
  /**
   * 获取歌单中的歌曲
   */
  getSongs: async (playlistId: string): Promise<ApiResponse<PlaylistSong[]>> => {
    return api.get<ApiResponse<PlaylistSong[]>>(`/api/client/playlists/${playlistId}/songs`);
  },

  /**
   * 添加歌曲到歌单
   */
  addSong: async (
    playlistId: string,
    data: { songId: string; position?: number }
  ): Promise<ApiResponse<PlaylistSong>> => {
    return api.post<ApiResponse<PlaylistSong>>(
      `/api/client/playlists/${playlistId}/songs`,
      data
    );
  },

  /**
   * 批量添加歌曲
   */
  batchAddSongs: async (
    playlistId: string,
    data: { songIds: string[] }
  ): Promise<ApiResponse<{ count: number; added: PlaylistSong[] }>> => {
    return api.post<ApiResponse<{ count: number; added: PlaylistSong[] }>>(
      `/api/client/playlists/${playlistId}/songs/batch`,
      data
    );
  },

  /**
   * 移除歌曲
   */
  removeSong: async (
    playlistId: string,
    songId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(
      `/api/client/playlists/${playlistId}/songs/${songId}`
    );
  },

  /**
   * 批量移除歌曲
   */
  batchRemoveSongs: async (
    playlistId: string,
    data: { songIds: string[] }
  ): Promise<ApiResponse<{ count: number }>> => {
    return api.delete<ApiResponse<{ count: number }>>(
      `/api/client/playlists/${playlistId}/songs/batch`,
      { data }
    );
  },

  /**
   * 更新歌曲位置
   */
  updatePosition: async (
    playlistId: string,
    songId: string,
    position: number
  ): Promise<ApiResponse<PlaylistSong>> => {
    return api.put<ApiResponse<PlaylistSong>>(
      `/api/client/playlists/${playlistId}/songs/${songId}`,
      { position }
    );
  },

  /**
   * 批量更新位置
   */
  batchUpdatePositions: async (
    playlistId: string,
    updates: { songId: string; position: number }[]
  ): Promise<ApiResponse<{ count: number }>> => {
    return api.put<ApiResponse<{ count: number }>>(
      `/api/client/playlists/${playlistId}/songs/batch`,
      { updates }
    );
  },
};
