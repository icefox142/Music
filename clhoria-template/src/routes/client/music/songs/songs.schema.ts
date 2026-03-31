import { z } from "zod";

import { createSelectSchema } from "drizzle-zod";

import { clientSongs } from "@/db/schema";
import { MusicGenre, MusicLanguage } from "@/lib/enums";

/** Song query schema / 歌曲查询参数 */
export const songQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  genre: z.nativeEnum(MusicGenre).optional(),
  language: z.nativeEnum(MusicLanguage).optional(),
  status: z.enum(["ENABLED", "DISABLED"]).optional(),
  sortBy: z.enum(["playCount", "releaseDate", "createdAt", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** Song create schema / 创建歌曲 */
export const songCreateSchema = z.object({
  title: z.string().min(1, "歌曲标题不能为空").max(256, "歌曲标题最多256个字符"),
  artist: z.string().min(1, "艺术家名称不能为空").max(256, "艺术家名称最多256个字符"),
  coverUrl: z.string().url("封面图URL格式不正确").max(1024, "封面图URL最多1024个字符").optional(),
  audioUrl: z.string().min(1, "音频文件URL不能为空").url("音频文件URL格式不正确").max(1024, "音频文件URL最多1024个字符"),
  duration: z.number().int().min(1, "时长必须大于0秒").max(3600, "时长不能超过3600秒（1小时）"),
  genre: z.nativeEnum(MusicGenre),
  language: z.nativeEnum(MusicLanguage),
  releaseDate: z.string().datetime().optional(),
  spotifyId: z.string().max(128, "Spotify ID最多128个字符").optional(),
  appleMusicId: z.string().max(128, "Apple Music ID最多128个字符").optional(),
  youtubeId: z.string().max(128, "YouTube ID最多128个字符").optional(),
});

/** Song update schema / 更新歌曲 */
export const songUpdateSchema = songCreateSchema.partial();

/** Song response schema / 歌曲响应 */
export const songResponseSchema = createSelectSchema(clientSongs, {
  id: schema => schema.meta({ description: "歌曲ID" }),
  title: schema => schema.meta({ description: "歌曲标题" }),
  artist: schema => schema.meta({ description: "艺术家名称" }),
  coverUrl: schema => schema.meta({ description: "封面图URL" }),
  audioUrl: schema => schema.meta({ description: "音频文件URL" }),
  duration: schema => schema.meta({ description: "时长（秒）" }),
  genre: schema => schema.meta({ description: "音乐流派" }),
  language: schema => schema.meta({ description: "语言" }),
  releaseDate: schema => schema.meta({ description: "发行日期" }),
  playCount: schema => schema.meta({ description: "播放次数" }),
  favoriteCount: schema => schema.meta({ description: "收藏次数" }),
  spotifyId: schema => schema.meta({ description: "Spotify ID" }),
  appleMusicId: schema => schema.meta({ description: "Apple Music ID" }),
  youtubeId: schema => schema.meta({ description: "YouTube ID" }),
  status: schema => schema.meta({ description: "状态" }),
});

/** Song list response schema / 歌曲列表响应 */
export const songListResponseSchema = z.array(songResponseSchema);
