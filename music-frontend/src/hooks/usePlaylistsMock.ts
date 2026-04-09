/**
 * 播放列表 Mock 数据 Hook
 * 使用 Mock 数据，不依赖后端 API
 */

import { useState, useEffect } from "react";
import type { Playlist, PaginatedResponse } from "@/types/api";

// Mock 播放列表数据
const mockPlaylists: Playlist[] = [
  {
    id: "1",
    userId: "user1",
    name: "我喜欢的音乐",
    description: "精选收藏",
    coverUrl: "https://picsum.photos/seed/playlist1/300/300",
    isPublic: false,
    songCount: 25,
    playCount: 0,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "2",
    userId: "user1",
    name: "轻松工作音乐",
    description: "工作时听的轻松音乐",
    coverUrl: "https://picsum.photos/seed/playlist2/300/300",
    isPublic: true,
    songCount: 50,
    playCount: 0,
    sortOrder: 2,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "3",
    userId: "user1",
    name: "运动健身",
    description: "健身时的动感音乐",
    coverUrl: "https://picsum.photos/seed/playlist3/300/300",
    isPublic: true,
    songCount: 30,
    playCount: 0,
    sortOrder: 3,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
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
 * 获取播放列表列表 - Mock 版本
 */
export function usePlaylistsMock(params?: {
  page?: number;
  pageSize?: number;
  isPublic?: boolean;
}) {
  const [data, setData] = useState<PaginatedResponse<Playlist> | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await delay();

        let filteredPlaylists = [...mockPlaylists];

        // 过滤公开/私有
        if (params?.isPublic !== undefined) {
          filteredPlaylists = filteredPlaylists.filter((p) => p.isPublic === params.isPublic);
        }

        // 分页
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const result = paginate(filteredPlaylists, page, pageSize);

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
 * 获取我的播放列表 - Mock 版本
 */
export function useMyPlaylistsMock() {
  const [data, setData] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await delay();
        setData(mockPlaylists);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    isLoading,
  };
}

/**
 * 获取公开播放列表 - Mock 版本
 */
export function usePublicPlaylistsMock(params?: {
  page?: number;
  pageSize?: number;
}) {
  return usePlaylistsMock({ ...params, isPublic: true });
}

/**
 * 获取单个播放列表 - Mock 版本
 */
export function usePlaylistMock(id: string) {
  const [data, setData] = useState<Playlist | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await delay();

        const playlist = mockPlaylists.find((p) => p.id === id);
        if (!playlist) {
          throw new Error(`播放列表 ${id} 不存在`);
        }

        setData(playlist);
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
 * 获取所有 Mock 播放列表
 */
export function useAllPlaylistsMock() {
  return {
    playlists: mockPlaylists,
    loading: false,
  };
}
