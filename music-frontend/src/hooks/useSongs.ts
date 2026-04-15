/**
 * 歌曲数据管理 Hook
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { songsApi, type SongQueryParams } from "@/api/songs";

export function useSongs(params?: SongQueryParams) {
  return useQuery({
    queryKey: ["songs", params],
    queryFn: () => songsApi.getList(params || {}),
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: ["song", id],
    queryFn: () => songsApi.getById(id),
    enabled: !!id,
  });
}

export function useSongMutation() {
  const queryClient = useQueryClient();

  const createSong = useMutation({
    mutationFn: (data: Partial<Song>) => songsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const updateSong = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Song> }) =>
      songsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const deleteSong = useMutation({
    mutationFn: (id: string) => songsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  return {
    createSong: createSong.mutate,
    updateSong: updateSong.mutate,
    deleteSong: deleteSong.mutate,
    isCreating: createSong.isPending,
    isUpdating: updateSong.isPending,
    isDeleting: deleteSong.isPending,
  };
}
