/**
 * 歌词数据管理 Hook
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lyricsApi, type LyricsQueryParams } from "@/api/lyrics";

export function useLyrics(params?: LyricsQueryParams) {
  return useQuery({
    queryKey: ["lyrics", params],
    queryFn: () => lyricsApi.getList(params || {}),
  });
}

export function useLyric(id: string) {
  return useQuery({
    queryKey: ["lyric", id],
    queryFn: () => lyricsApi.getById(id),
    enabled: !!id,
  });
}

export function useLyricsBySongId(songId?: string) {
  return useQuery({
    queryKey: ["lyrics", "song", songId],
    queryFn: () => lyricsApi.getList({ songId, page: 1, limit: 1 }),
    enabled: !!songId,
  });
}

export function useLyricMutation() {
  const queryClient = useQueryClient();

  const createLyric = useMutation({
    mutationFn: (data: Partial<typeof lyricsApi>) => lyricsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lyrics"] });
    },
  });

  const updateLyric = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof lyricsApi> }) =>
      lyricsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lyrics"] });
    },
  });

  const deleteLyric = useMutation({
    mutationFn: (id: string) => lyricsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lyrics"] });
    },
  });

  return {
    createLyric: createLyric.mutate,
    updateLyric: updateLyric.mutate,
    deleteLyric: deleteLyric.mutate,
    isCreating: createLyric.isPending,
    isUpdating: updateLyric.isPending,
    isDeleting: deleteLyric.isPending,
  };
}
