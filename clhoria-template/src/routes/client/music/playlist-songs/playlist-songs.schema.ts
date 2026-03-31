import { z } from "zod";

import { createSelectSchema } from "drizzle-zod";

import { clientPlaylistSongs, clientSongs } from "@/db/schema";

/** Playlist song create schema / 添加歌曲到歌单 */
export const playlistSongCreateSchema = z.object({
  songId: z.string().uuid("歌曲ID格式不正确"),
  position: z.number().int().min(0, "位置不能为负数").optional(),
});

/** Playlist song update schema / 更新歌曲位置 */
export const playlistSongUpdateSchema = z.object({
  position: z.number().int().min(0, "位置不能为负数"),
});

/** Batch add songs schema / 批量添加歌曲 */
export const playlistSongBatchAddSchema = z.object({
  songIds: z.array(z.string().uuid("歌曲ID格式不正确")).min(1, "至少需要一首歌曲").max(100, "最多100首歌曲"),
});

/** Batch remove songs schema / 批量删除歌曲 */
export const playlistSongBatchRemoveSchema = z.object({
  songIds: z.array(z.string().uuid("歌曲ID格式不正确")).min(1, "至少需要一首歌曲").max(100, "最多100首歌曲"),
});

/** Batch update positions schema / 批量更新歌曲位置 */
export const playlistSongBatchUpdateSchema = z.object({
  updates: z.array(z.object({
    songId: z.string().uuid("歌曲ID格式不正确"),
    position: z.number().int().min(0, "位置不能为负数"),
  })).min(1, "至少需要一首歌曲").max(100, "最多100首歌曲"),
});

/** Playlist song response schema / 歌单歌曲响应 */
export const playlistSongResponseSchema = createSelectSchema(clientPlaylistSongs, {
  id: schema => schema.meta({ description: "关联记录ID" }),
  playlistId: schema => schema.meta({ description: "歌单ID" }),
  songId: schema => schema.meta({ description: "歌曲ID" }),
  position: schema => schema.meta({ description: "位置" }),
  addedAt: schema => schema.meta({ description: "添加时间" }),
});

/** Playlist song with song details / 歌单歌曲（包含歌曲详情） */
export const playlistSongWithDetailSchema = playlistSongResponseSchema.extend({
  song: createSelectSchema(clientSongs, {
    id: schema => schema.meta({ description: "歌曲ID" }),
    title: schema => schema.meta({ description: "歌曲标题" }),
    artist: schema => schema.meta({ description: "艺术家名称" }),
    coverUrl: schema => schema.meta({ description: "封面图URL" }),
    audioUrl: schema => schema.meta({ description: "音频文件URL" }),
    duration: schema => schema.meta({ description: "时长（秒）" }),
    genre: schema => schema.meta({ description: "音乐流派" }),
    language: schema => schema.meta({ description: "语言" }),
  }),
});

/** Playlist song list response schema / 歌单歌曲列表响应 */
export const playlistSongListResponseSchema = z.array(playlistSongWithDetailSchema);
