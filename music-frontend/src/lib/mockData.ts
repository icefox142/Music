/**
 * Mock 数据生成器 - 耄耋表情包版本
 * Mock data generator - Maodie Emoji Edition
 */

import type { Emoji, EmojiCollection, EmojiFavorite } from "@/api";
import emojiData from "../emojiMockData.json";

// Mock 表情包数据 - 从耄耋表情包文件夹生成
export const mockEmojis: Emoji[] = emojiData.emojis.map((emoji: any) => ({
  id: emoji.id,
  name: emoji.name,
  description: emoji.description,
  keywords: emoji.keywords,
  category: emoji.category,
  imageUrl: emoji.imageUrl,
  gifUrl: emoji.gifUrl,
  stickerUrl: emoji.stickerUrl,
  tags: emoji.tags,
  isPublic: emoji.isPublic,
  status: emoji.status as any,
  createdAt: emoji.createdAt,
  updatedAt: emoji.updatedAt,
}));

// Mock 表情包集合数据 - 从耄耋表情包文件夹生成
export const mockCollections: EmojiCollection[] = emojiData.collections.map((collection: any) => ({
  id: collection.id,
  name: collection.name,
  description: collection.description,
  coverUrl: collection.coverUrl,
  tags: collection.tags,
  isFeatured: collection.isFeatured,
  sortOrder: collection.sortOrder,
  downloadCount: collection.downloadCount,
  status: collection.status as any,
  createdAt: collection.createdAt,
  updatedAt: collection.updatedAt,
  emojis: collection.emojis,
}));

// Mock 收藏数据
export const mockFavorites: EmojiFavorite[] = emojiData.favorites.map((fav: any) => ({
  id: fav.id,
  userId: fav.userId,
  emojiId: fav.emojiId,
  emoji: fav.emoji,
  createdAt: fav.createdAt,
}));

// 所有可用的标签
export const mockTags = emojiData.tags;

// 所有可用的分类
export const mockCategories = emojiData.categories;

// 统计信息
export const mockStats = emojiData.stats;
