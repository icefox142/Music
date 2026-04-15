import { boolean, index, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@/db/schema/_shard/base-columns";
import { statusEnum } from "@/db/schema/_shard/enums";
import { clientSongs } from "./songs";
import { Status } from "@/lib/enums";
import { StatusDescriptions } from "@/lib/schemas";

/**
 * Song lyrics table / 歌词表
 *
 * Features:
 * - Stores LRC format lyrics with timestamps / 存储带时间戳的LRC格式歌词
 * - One-to-one relationship with songs / 与歌曲一对一关系
 * - Supports multiple language versions / 支持多语言版本
 * - Includes metadata like offset and duration / 包含偏移量和时长等元数据
 */
export const clientLyrics = pgTable("client_lyrics", {
  ...baseColumns,
  /** Associated song ID / 关联歌曲ID */
  songId: uuid().notNull().unique().references(() => clientSongs.id, { onDelete: "cascade" }),
  /** Lyrics content in LRC format / LRC格式歌词内容 */
  content: text().notNull(),
  /** Language of the lyrics / 歌词语言 */
  language: varchar({ length: 16 }).notNull(),
  /** Translation content (optional) / 翻译内容（可选） */
  translation: text(),
  /** Time offset in milliseconds / 时间偏移量（毫秒） */
  offset: integer().default(0).notNull(),
  /** Duration of the lyrics in seconds / 歌词时长（秒） */
  duration: integer().notNull(),
  /** Verified by admin / 是否经过管理员验证 */
  isVerified: boolean().default(false).notNull(),
  /** Quality score (0-100) / 质量评分（0-100） */
  qualityScore: integer().default(0).notNull(),
  /** View count / 查看次数 */
  viewCount: integer().default(0).notNull(),
  /** Status / 状态 */
  status: statusEnum().default(Status.ENABLED).notNull(),
}, table => [
  // Unique index on song ID / 歌曲ID唯一索引
  index("client_lyrics_song_id_idx").on(table.songId),
  // Index for language / 语言索引
  index("client_lyrics_language_idx").on(table.language),
  // Index for verified lyrics / 已验证歌词索引
  index("client_lyrics_verified_idx").on(table.isVerified),
  // Index for quality / 质量索引
  index("client_lyrics_quality_idx").on(table.qualityScore.desc()),
  // Index for status / 状态索引
  index("client_lyrics_status_idx").on(table.status),
]);

/**
 * Select Schema (used for queries)
 * Select Schema（查询时使用）
 */
export const selectClientLyricsSchema = createSelectSchema(clientLyrics, {
  id: schema => schema.meta({ description: "歌词ID" }),
  songId: schema => schema.meta({ description: "关联歌曲ID" }),
  content: schema => schema.meta({ description: "LRC格式歌词内容" }),
  language: schema => schema.meta({ description: "歌词语言" }),
  translation: schema => schema.meta({ description: "翻译内容" }),
  offset: schema => schema.meta({ description: "时间偏移量（毫秒）" }),
  duration: schema => schema.meta({ description: "歌词时长（秒）" }),
  isVerified: schema => schema.meta({ description: "是否经过验证" }),
  qualityScore: schema => schema.meta({ description: "质量评分（0-100）" }),
  viewCount: schema => schema.meta({ description: "查看次数" }),
  status: schema => schema.meta({ description: StatusDescriptions.SYSTEM }),
  createdAt: schema => schema.meta({ description: "创建时间" }),
  createdBy: schema => schema.meta({ description: "创建人" }),
  updatedAt: schema => schema.meta({ description: "更新时间" }),
  updatedBy: schema => schema.meta({ description: "更新人" }),
});

/**
 * Insert Schema (used for insertions)
 * Insert Schema（插入时使用）
 */
const baseInsertSchema = createInsertSchema(clientLyrics).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertClientLyricsSchema = baseInsertSchema.extend({
  songId: z.string().uuid("歌曲ID格式不正确"),
  content: z.string().min(1, "歌词内容不能为空"),
  language: z.string().min(1, "语言代码不能为空").max(16, "语言代码最多16个字符"),
  translation: z.string().optional(),
  offset: z.number().int().min(-10000, "偏移量不能小于-10000毫秒").max(10000, "偏移量不能大于10000毫秒").default(0),
  duration: z.number().int().min(1, "时长必须大于0秒").max(3600, "时长不能超过3600秒（1小时）"),
  isVerified: z.boolean().optional(),
  qualityScore: z.number().int().min(0, "质量评分必须在0-100之间").max(100, "质量评分必须在0-100之间").default(0),
  viewCount: z.number().int().min(0).default(0),
  status: z.nativeEnum(Status).optional(),
});
