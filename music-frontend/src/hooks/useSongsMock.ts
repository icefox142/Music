/**
 * 歌曲 Mock 数据 Hook
 * 使用 Mock 数据，不依赖后端 API
 */

import { useState, useEffect } from "react";
import type { Song, SongQueryParams, PaginatedResponse } from "@/types/api";
import { MusicGenre, MusicLanguage } from "@/types/api";

// Mock 歌曲数据
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Time to Pretend",
    artist: "Lazer Boomerang",
    coverUrl: "https://picsum.photos/seed/song1/300/300",
    audioUrl: "/music/「合成器波」Time to Pretend 伪装时刻 - Lazer Boomerang 百万级装备试听【Hi-Res】(1)_2026.04.09-09.39.57.mp3",
    genre: MusicGenre.ELECTRONIC,
    language: MusicLanguage.INSTRUMENTAL,
    duration: 240,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "2",
    title: "Signals",
    artist: "Electronic Music Series",
    coverUrl: "https://picsum.photos/seed/song2/300/300",
    audioUrl: "/music/【好听的电子音乐系列】Signals_2026.04.09-09.40.06.mp3",
    genre: MusicGenre.ELECTRONIC,
    language: MusicLanguage.INSTRUMENTAL,
    duration: 220,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    status: "ENABLED",
  },
];

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// 分页辅助函数
function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);

  return {
    data,
    total,
    page,
    pageSize,
  };
}

/**
 * 获取歌曲列表 - Mock 版本
 */
export function useSongsMock(params?: SongQueryParams) {
  const [data, setData] = useState<PaginatedResponse<Song> | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 模拟网络延迟
        await delay();

        let filteredSongs = [...mockSongs];

        // 根据参数过滤
        if (params?.genre) {
          filteredSongs = filteredSongs.filter((s) => s.genre === params.genre);
        }
        if (params?.language) {
          filteredSongs = filteredSongs.filter((s) => s.language === params.language);
        }
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filteredSongs = filteredSongs.filter(
            (s) =>
              s.title.toLowerCase().includes(searchLower) ||
              s.artist.toLowerCase().includes(searchLower)
          );
        }

        // 分页
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const result = paginate(filteredSongs, page, pageSize);

        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return {
    data: data?.data,
    total: data?.total,
    page: data?.page,
    pageSize: data?.pageSize,
    isLoading,
    error,
  };
}

/**
 * 获取单个歌曲 - Mock 版本
 */
export function useSongMock(id: string) {
  const [data, setData] = useState<Song | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await delay();

        const song = mockSongs.find((s) => s.id === id);
        if (!song) {
          throw new Error(`歌曲 ${id} 不存在`);
        }

        setData(song);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return {
    data,
    isLoading,
    error,
  };
}

/**
 * 获取所有 Mock 歌曲（用于播放列表）
 */
export function useAllSongsMock() {
  return {
    songs: mockSongs,
    loading: false,
  };
}
