import { z } from "zod";

import { createSelectSchema } from "drizzle-zod";

import { clientPlaylists } from "@/db/schema";

/** Playlist query schema / 歌单查询参数 */
export const playlistQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(["ENABLED", "DISABLED"]).optional(),
  sortBy: z.enum(["playCount", "createdAt", "songCount", "sortOrder"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** Playlist create schema / 创建歌单 */
export const playlistCreateSchema = z.object({
  name: z.string().min(1, "歌单名称不能为空").max(128, "歌单名称最多128个字符"),
  description: z.string().max(500, "歌单描述最多500个字符").optional(),
  coverUrl: z.string().url("封面图URL格式不正确").max(1024, "封面图URL最多1024个字符").optional(),
  isPublic: z.boolean().default(false),
  sortOrder: z.number().int().min(0).optional(),
});

/** Playlist update schema / 更新歌单 */
export const playlistUpdateSchema = playlistCreateSchema.partial();

/** Playlist response schema / 歌单响应 */
export const playlistResponseSchema = createSelectSchema(clientPlaylists, {
  id: schema => schema.meta({ description: "歌单ID" }),
  userId: schema => schema.meta({ description: "创建者用户ID" }),
  name: schema => schema.meta({ description: "歌单名称" }),
  description: schema => schema.meta({ description: "歌单描述" }),
  coverUrl: schema => schema.meta({ description: "封面图URL" }),
  isPublic: schema => schema.meta({ description: "是否公开" }),
  songCount: schema => schema.meta({ description: "歌曲数量" }),
  playCount: schema => schema.meta({ description: "播放次数" }),
  sortOrder: schema => schema.meta({ description: "排序" }),
  status: schema => schema.meta({ description: "状态" }),
});

/** Playlist list response schema / 歌单列表响应 */
export const playlistListResponseSchema = z.array(playlistResponseSchema);
