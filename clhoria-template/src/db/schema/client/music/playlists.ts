import { boolean, index, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@/db/schema/_shard/base-columns";
import { statusEnum } from "@/db/schema/_shard/enums";
import { clientUsers } from "@/db/schema/client/users/users";
import { Status } from "@/lib/enums";
import { StatusDescriptions } from "@/lib/schemas";

/**
 * User playlists table / 用户歌单表
 *
 * Stores user-created playlists
 * 存储用户创建的歌单
 */
export const clientPlaylists = pgTable("client_playlists", {
  ...baseColumns,
  /** Creator user ID / 创建者用户ID */
  userId: uuid().notNull().references(() => clientUsers.id, { onDelete: "cascade" }),
  /** Playlist name / 歌单名称 */
  name: varchar({ length: 128 }).notNull(),
  /** Playlist description / 歌单描述 */
  description: text(),
  /** Cover image URL / 封面图URL */
  coverUrl: varchar({ length: 1024 }),
  /** Is public / 是否公开 */
  isPublic: boolean().default(false).notNull(),
  /** Song count / 歌曲数量 */
  songCount: integer().default(0).notNull(),
  /** Play count / 播放次数 */
  playCount: integer().default(0).notNull(),
  /** Sort order for display / 显示排序 */
  sortOrder: integer().default(0).notNull(),
  /** Status / 状态 */
  status: statusEnum().default(Status.ENABLED).notNull(),
}, table => [
  // Index for user's playlists / 用户歌单查询索引
  index("client_playlists_user_id_idx").on(table.userId, table.sortOrder),
  // Index for public playlists / 公开歌单索引
  index("client_playlists_public_idx").on(table.isPublic, table.playCount.desc()),
  // Index for popularity / 热度索引
  index("client_playlists_play_count_idx").on(table.playCount.desc()),
  // Index for status / 状态索引
  index("client_playlists_status_idx").on(table.status),
]);

/**
 * Select Schema
 */
export const selectClientPlaylistsSchema = createSelectSchema(clientPlaylists, {
  id: schema => schema.meta({ description: "歌单ID" }),
  userId: schema => schema.meta({ description: "创建者用户ID" }),
  name: schema => schema.meta({ description: "歌单名称" }),
  description: schema => schema.meta({ description: "歌单描述" }),
  coverUrl: schema => schema.meta({ description: "封面图URL" }),
  isPublic: schema => schema.meta({ description: "是否公开" }),
  songCount: schema => schema.meta({ description: "歌曲数量" }),
  playCount: schema => schema.meta({ description: "播放次数" }),
  sortOrder: schema => schema.meta({ description: "排序" }),
  status: schema => schema.meta({ description: StatusDescriptions.SYSTEM }),
});

/**
 * Insert Schema
 */
const baseInsertSchema = createInsertSchema(clientPlaylists).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertClientPlaylistsSchema = baseInsertSchema.extend({
  userId: z.string().uuid("用户ID格式不正确"),
  name: z.string().min(1, "歌单名称不能为空").max(128, "歌单名称最多128个字符"),
  description: z.string().max(500, "歌单描述最多500个字符").optional(),
  coverUrl: z.string().url("封面图URL格式不正确").max(1024, "封面图URL最多1024个字符").optional(),
  isPublic: z.boolean().optional(),
  songCount: z.number().int().min(0).default(0),
  playCount: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).optional(),
  status: z.nativeEnum(Status).optional(),
});
