/**
 * 表情包数据管理 Hook
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emojisApi, type EmojiQueryParams } from "@/api/emojis";
import { emojiFavoritesApi } from "@/api/emoji-favorites";

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
