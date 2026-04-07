/**
 * 表情包数据管理 Hook - Mock 版本
 * 使用 Mock 数据，不依赖后端 API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApiClient } from "@/lib/mockApiClient";
import type { EmojiQueryParams } from "@/api/emojis";

export function useEmojis(params?: EmojiQueryParams) {
  return useQuery({
    queryKey: ["emojis-mock", params],
    queryFn: () => mockApiClient.emojis.getList(params || {}),
  });
}

export function useEmoji(id: string) {
  return useQuery({
    queryKey: ["emoji-mock", id],
    queryFn: () => mockApiClient.emojis.getById(id),
    enabled: !!id,
  });
}

export function useEmojiFavorite() {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: (emojiId: string) => mockApiClient.favorites.add(emojiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emoji-favorites-mock"] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: (emojiId: string) => mockApiClient.favorites.remove(emojiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emoji-favorites-mock"] });
    },
  });

  const checkFavorite = (emojiId: string) => {
    return mockApiClient.favorites.check(emojiId);
  };

  return {
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    checkFavorite,
    isAdding: addFavorite.isPending,
    isRemoving: removeFavorite.isPending,
  };
}

export function useEmojiFavorites() {
  return useQuery({
    queryKey: ["emoji-favorites-mock"],
    queryFn: () => mockApiClient.favorites.getList(),
  });
}

export function useEmojiCollections() {
  return useQuery({
    queryKey: ["emoji-collections-mock"],
    queryFn: () => mockApiClient.collections.getList({ isFeatured: true }),
  });
}

// 导出所有可用的 mock 数据标签和分类
export function useEmojiTags() {
  return { tags: mockApiClient.getTags() };
}

export function useEmojiCategories() {
  return { categories: mockApiClient.getCategories() };
}
