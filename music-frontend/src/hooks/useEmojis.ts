/**
 * 表情包数据管理 Hook
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emojisApi, type EmojiQueryParams } from "@/api/emojis";
import { emojiFavoritesApi } from "@/api/emoji-favorites";
import { emojiCollectionsApi } from "@/api/emoji-collections";

export function useEmojis(params?: EmojiQueryParams) {
  return useQuery({
    queryKey: ["emojis", params],
    queryFn: () => emojisApi.getList(params || {}),
  });
}

export function useEmoji(id: string) {
  return useQuery({
    queryKey: ["emoji", id],
    queryFn: () => emojisApi.getById(id),
    enabled: !!id,
  });
}

export function useEmojiFavorite() {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: (emojiId: string) => emojiFavoritesApi.add(emojiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emoji-favorites"] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: (emojiId: string) => emojiFavoritesApi.remove(emojiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emoji-favorites"] });
    },
  });

  const checkFavorite = (emojiId: string) => {
    return emojiFavoritesApi.check(emojiId);
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
    queryKey: ["emoji-favorites"],
    queryFn: () => emojiFavoritesApi.getList(),
  });
}

export function useEmojiCollections() {
  return useQuery({
    queryKey: ["emoji-collections"],
    queryFn: () => emojiCollectionsApi.getList({ isFeatured: true }),
  });
}

// 获取所有可用的标签（从表情包列表中提取）
export function useEmojiTags() {
  const { data: emojisData } = useEmojis({ pageSize: 30 });

  // 从所有表情包中提取唯一标签
  const tags = emojisData?.data
    ? Array.from(
        new Set(
          emojisData.data.flatMap((emoji) => emoji.tags || [])
        )
      )
    : [];

  return { tags };
}

// 获取所有可用的分类
export function useEmojiCategories() {
  const { data: emojisData } = useEmojis({ pageSize: 30 });

  // 从所有表情包中提取唯一分类
  const categories = emojisData?.data
    ? Array.from(
        new Set(
          emojisData.data.map((emoji) => emoji.category).filter(Boolean)
        )
      )
    : [];

  return { categories };
}
