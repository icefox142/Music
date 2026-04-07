/**
 * Mock API 客户端
 * 在 API 层之前拦截请求并返回模拟数据
 * Mock API client - Intercepts requests before API layer and returns mock data
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Emoji,
  EmojiQueryParams,
  EmojiCollection,
  CollectionQueryParams,
  EmojiFavorite,
  FavoriteQueryParams,
} from "@/api";
import {
  mockEmojis,
  mockCollections,
  mockFavorites,
  mockTags,
  mockCategories,
} from "./mockData";

/**
 * 模拟网络延迟
 */
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 分页辅助函数
 */
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
 * 过滤表情包
 */
function filterEmojis(params: EmojiQueryParams) {
  let filtered = [...mockEmojis];

  // 按标签过滤 (tags 是 OR 关系)
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter((emoji) =>
      params.tags!.some((tag) => emoji.tags.includes(tag))
    );
  }

  // 按标签过滤 (tagsAll 是 AND 关系)
  if (params.tagsAll && params.tagsAll.length > 0) {
    filtered = filtered.filter((emoji) =>
      params.tagsAll!.every((tag) => emoji.tags.includes(tag))
    );
  }

  // 按分类过滤
  if (params.category) {
    filtered = filtered.filter((emoji) => emoji.category === params.category);
  }

  // 排序
  const sortBy = params.sortBy || "createdAt";
  const order = params.order || "desc";

  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "createdAt") {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name, "zh");
    }
    return order === "asc" ? comparison : -comparison;
  });

  return filtered;
}

/**
 * Mock API 客户端
 */
export const mockApiClient = {
  /**
   * 表情包 API
   */
  emojis: {
    getList: async (params: EmojiQueryParams = {}): Promise<PaginatedResponse<Emoji>> => {
      await delay();
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const filtered = filterEmojis(params);
      return paginate(filtered, page, pageSize);
    },

    getById: async (id: string): Promise<ApiResponse<Emoji>> => {
      await delay();
      const emoji = mockEmojis.find((e) => e.id === id);
      if (!emoji) {
        throw new Error(`Emoji with id ${id} not found`);
      }
      return { data: emoji, success: true };
    },

    create: async (data: Partial<Emoji>): Promise<ApiResponse<Emoji>> => {
      await delay();
      const newEmoji: Emoji = {
        id: String(mockEmojis.length + 1),
        name: data.name || "新表情",
        description: data.description || null,
        keywords: data.keywords || [],
        category: data.category || null,
        imageUrl: data.imageUrl || "https://picsum.photos/200/200",
        gifUrl: data.gifUrl || null,
        stickerUrl: data.stickerUrl || null,
        tags: data.tags || [],
        isPublic: data.isPublic ?? true,
        status: data.status || "ENABLED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockEmojis.push(newEmoji);
      return { data: newEmoji, success: true };
    },

    update: async (id: string, data: Partial<Emoji>): Promise<ApiResponse<Emoji>> => {
      await delay();
      const index = mockEmojis.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error(`Emoji with id ${id} not found`);
      }
      mockEmojis[index] = {
        ...mockEmojis[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { data: mockEmojis[index], success: true };
    },

    delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
      await delay();
      const index = mockEmojis.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error(`Emoji with id ${id} not found`);
      }
      mockEmojis.splice(index, 1);
      return { data: { success: true }, success: true };
    },
  },

  /**
   * 表情包集合 API
   */
  collections: {
    getList: async (
      params: CollectionQueryParams = {}
    ): Promise<PaginatedResponse<EmojiCollection>> => {
      await delay();
      let filtered = [...mockCollections];

      // 按标签过滤
      if (params.tags && params.tags.length > 0) {
        filtered = filtered.filter((collection) =>
          params.tags!.some((tag) => collection.tags.includes(tag))
        );
      }

      // 按精选过滤
      if (params.isFeatured !== undefined) {
        filtered = filtered.filter((collection) => collection.isFeatured === params.isFeatured);
      }

      // 按状态过滤
      if (params.status) {
        filtered = filtered.filter((collection) => collection.status === params.status);
      }

      // 排序
      const sortBy = params.sortBy || "sortOrder";
      const order = params.order || "asc";

      filtered.sort((a, b) => {
        let comparison = 0;
        if (sortBy === "sortOrder") {
          comparison = a.sortOrder - b.sortOrder;
        } else if (sortBy === "createdAt") {
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === "downloadCount") {
          comparison = a.downloadCount - b.downloadCount;
        }
        return order === "asc" ? comparison : -comparison;
      });

      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      return paginate(filtered, page, pageSize);
    },

    getById: async (id: string): Promise<ApiResponse<EmojiCollection>> => {
      await delay();
      const collection = mockCollections.find((c) => c.id === id);
      if (!collection) {
        throw new Error(`Collection with id ${id} not found`);
      }
      return { data: collection, success: true };
    },

    create: async (
      data: Partial<EmojiCollection>
    ): Promise<ApiResponse<EmojiCollection>> => {
      await delay();
      const newCollection: EmojiCollection = {
        id: `c${mockCollections.length + 1}`,
        name: data.name || "新集合",
        description: data.description || null,
        coverUrl: data.coverUrl || "https://picsum.photos/400/300",
        tags: data.tags || [],
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder || mockCollections.length + 1,
        downloadCount: 0,
        status: data.status || "ENABLED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emojis: data.emojis || [],
      };
      mockCollections.push(newCollection);
      return { data: newCollection, success: true };
    },

    update: async (
      id: string,
      data: Partial<EmojiCollection>
    ): Promise<ApiResponse<EmojiCollection>> => {
      await delay();
      const index = mockCollections.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Collection with id ${id} not found`);
      }
      mockCollections[index] = {
        ...mockCollections[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { data: mockCollections[index], success: true };
    },

    delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
      await delay();
      const index = mockCollections.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Collection with id ${id} not found`);
      }
      mockCollections.splice(index, 1);
      return { data: { success: true }, success: true };
    },

    incrementDownload: async (
      id: string
    ): Promise<ApiResponse<{ downloadCount: number }>> => {
      await delay();
      const collection = mockCollections.find((c) => c.id === id);
      if (!collection) {
        throw new Error(`Collection with id ${id} not found`);
      }
      collection.downloadCount += 1;
      return { data: { downloadCount: collection.downloadCount }, success: true };
    },
  },

  /**
   * 表情收藏 API
   */
  favorites: {
    getList: async (
      params: FavoriteQueryParams = {}
    ): Promise<PaginatedResponse<EmojiFavorite>> => {
      await delay();
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      return paginate(mockFavorites, page, pageSize);
    },

    add: async (emojiId: string): Promise<ApiResponse<EmojiFavorite>> => {
      await delay();
      const existing = mockFavorites.find((f) => f.emojiId === emojiId);
      if (existing) {
        return { data: existing, success: true };
      }

      const emoji = mockEmojis.find((e) => e.id === emojiId);
      if (!emoji) {
        throw new Error(`Emoji with id ${emojiId} not found`);
      }

      const newFavorite: EmojiFavorite = {
        id: `f${mockFavorites.length + 1}`,
        userId: "user-1",
        emojiId,
        emoji,
        createdAt: new Date().toISOString(),
      };
      mockFavorites.push(newFavorite);
      return { data: newFavorite, success: true };
    },

    remove: async (emojiId: string): Promise<ApiResponse<{ success: boolean }>> => {
      await delay();
      const index = mockFavorites.findIndex((f) => f.emojiId === emojiId);
      if (index === -1) {
        throw new Error(`Favorite for emoji ${emojiId} not found`);
      }
      mockFavorites.splice(index, 1);
      return { data: { success: true }, success: true };
    },

    check: async (emojiId: string): Promise<ApiResponse<{ isFavorited: boolean }>> => {
      await delay();
      const exists = mockFavorites.some((f) => f.emojiId === emojiId);
      return { data: { isFavorited: exists }, success: true };
    },
  },

  /**
   * 辅助方法 - 获取所有标签和分类
   */
  getTags: () => mockTags,
  getCategories: () => mockCategories,
};

/**
 * 导出所有可用的 mock 数据（用于调试）
 */
export const mockDataExports = {
  emojis: mockEmojis,
  collections: mockCollections,
  favorites: mockFavorites,
  tags: mockTags,
  categories: mockCategories,
};
