import { index, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@/db/schema/_shard/base-columns";
import { musicGenreEnum, musicLanguageEnum, statusEnum } from "@/db/schema/_shard/enums";
import { MusicGenre, MusicLanguage, Status } from "@/lib/enums";
import { StatusDescriptions } from "@/lib/schemas";

/**
 * Songs table / 歌曲表
 *
 * Stores music track information independent of albums
 * 存储独立于专辑的歌曲信息
 */
export const clientSongs = pgTable("client_songs", {
  ...baseColumns,
  /** Song title / 歌曲标题 */
  title: varchar({ length: 256 }).notNull(),
  /** Artist name / 艺术家名称 */
  artist: varchar({ length: 256 }).notNull(),
  /** Cover image URL / 封面图URL */
  coverUrl: varchar({ length: 1024 }),
  /** Audio file URL / 音频文件URL */
  audioUrl: varchar({ length: 1024 }).notNull(),
  /** Duration in seconds / 时长（秒） */
  duration: integer().notNull(),
  /** Music genre / 音乐流派 */
  genre: musicGenreEnum().notNull(),
  /** Language / 语言 */
  language: musicLanguageEnum().notNull(),
  /** Release date / 发行日期 */
  releaseDate: timestamp({ mode: "string" }),
  /** Play count / 播放次数 */
  playCount: integer().default(0).notNull(),
  /** Favorite count / 收藏次数 */
  favoriteCount: integer().default(0).notNull(),
  /** Spotify ID (optional) / Spotify ID（可选） */
  spotifyId: varchar({ length: 128 }),
  /** Apple Music ID (optional) / Apple Music ID（可选） */
  appleMusicId: varchar({ length: 128 }),
  /** YouTube ID (optional) / YouTube ID（可选） */
  youtubeId: varchar({ length: 128 }),
  /** Status / 状态 */
  status: statusEnum().default(Status.ENABLED).notNull(),
}, table => [
  // Index for title search / 标题搜索索引
  index("client_songs_title_idx").on(table.title),
  // Index for artist search / 艺术家搜索索引
  index("client_songs_artist_idx").on(table.artist),
  // Index for genre filtering / 流派筛选索引
  index("client_songs_genre_idx").on(table.genre),
  // Index for language filtering / 语言筛选索引
  index("client_songs_language_idx").on(table.language),
  // Index for popularity (play count) / 热度（播放次数）索引
  index("client_songs_play_count_idx").on(table.playCount.desc()),
  // Index for release date / 发行日期索引
  index("client_songs_release_date_idx").on(table.releaseDate.desc()),
  // Index for status / 状态索引
  index("client_songs_status_idx").on(table.status),
]);

/**
 * Select Schema
 */
export const selectClientSongsSchema = createSelectSchema(clientSongs, {
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
  status: schema => schema.meta({ description: StatusDescriptions.SYSTEM }),
});

/**
 * Insert Schema
 */
const baseInsertSchema = createInsertSchema(clientSongs).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertClientSongsSchema = baseInsertSchema.extend({
  title: z.string().min(1, "歌曲标题不能为空").max(256, "歌曲标题最多256个字符"),
  artist: z.string().min(1, "艺术家名称不能为空").max(256, "艺术家名称最多256个字符"),
  coverUrl: z.string().url("封面图URL格式不正确").max(1024, "封面图URL最多1024个字符").optional(),
  audioUrl: z.string().min(1, "音频文件URL不能为空").url("音频文件URL格式不正确").max(1024, "音频文件URL最多1024个字符"),
  duration: z.number().int().min(1, "时长必须大于0秒").max(3600, "时长不能超过3600秒（1小时）"),
  genre: z.nativeEnum(MusicGenre),
  language: z.nativeEnum(MusicLanguage),
  releaseDate: z.string().datetime().optional(),
  playCount: z.number().int().min(0).default(0),
  favoriteCount: z.number().int().min(0).default(0),
  spotifyId: z.string().max(128, "Spotify ID最多128个字符").optional(),
  appleMusicId: z.string().max(128, "Apple Music ID最多128个字符").optional(),
  youtubeId: z.string().max(128, "YouTube ID最多128个字符").optional(),
  status: z.nativeEnum(Status).optional(),
});
