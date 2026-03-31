import { boolean, index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@/db/schema/_shard/base-columns";
import { statusEnum } from "@/db/schema/_shard/enums";
import { Status } from "@/lib/enums";
import { StatusDescriptions } from "@/lib/schemas";

/**
 * Emoji collection/sticker pack table
 * 表情包集合/表情包套餐表
 *
 * A collection groups multiple emojis together (like a sticker pack)
 * 一个集合将多个表情包组合在一起（类似表情包套餐）
 */
export const clientEmojiCollections = pgTable("client_emoji_collections", {
  ...baseColumns,
  /** Collection name / 集合名称 */
  name: varchar({ length: 128 }).notNull(),
  /** Collection cover image / 集合封面图 */
  coverUrl: varchar({ length: 512 }).notNull(),
  /** Collection description / 集合描述 */
  description: text(),
  /** Collection tags for classification / 集合标签 */
  tags: text().array().default([]).notNull(),
  /** Emoji IDs in this collection (ordered) / 集合中的表情ID列表（有序） */
  emojiIds: text().array().default([]).notNull(),
  /** Is featured collection / 是否为精选集合 */
  isFeatured: boolean().default(false).notNull(),
  /** Sort order for display / 显示排序 */
  sortOrder: integer().default(0).notNull(),
  /** Download count / 下载次数 */
  downloadCount: integer().default(0).notNull(),
  /** Status / 状态 */
  status: statusEnum().default(Status.ENABLED).notNull(),
}, table => [
  index("client_emoji_collections_featured_idx").on(table.isFeatured, table.sortOrder),
  index("client_emoji_collections_status_idx").on(table.status),
]);

/**
 * Select Schema
 */
export const selectClientEmojiCollectionsSchema = createSelectSchema(clientEmojiCollections, {
  id: schema => schema.meta({ description: "集合ID" }),
  name: schema => schema.meta({ description: "集合名称" }),
  coverUrl: schema => schema.meta({ description: "封面图" }),
  description: schema => schema.meta({ description: "描述" }),
  tags: schema => schema.meta({ description: "标签列表" }),
  emojiIds: schema => schema.meta({ description: "表情ID列表" }),
  isFeatured: schema => schema.meta({ description: "是否精选" }),
  sortOrder: schema => schema.meta({ description: "排序" }),
  downloadCount: schema => schema.meta({ description: "下载次数" }),
  status: schema => schema.meta({ description: StatusDescriptions.SYSTEM }),
});

/**
 * Insert Schema
 */
const baseInsertSchema = createInsertSchema(clientEmojiCollections).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertClientEmojiCollectionsSchema = baseInsertSchema.extend({
  name: z.string().min(1, "集合名称不能为空").max(128, "集合名称最多128个字符"),
  coverUrl: z.string().min(1, "封面图不能为空").max(512, "封面图最多512个字符").url("封面图格式不正确"),
  description: z.string().max(500, "描述最多500个字符").optional(),
  tags: z.array(z.string().max(32, "标签最多32个字符")).max(10, "最多10个标签").optional(),
  emojiIds: z.array(z.string()).min(1, "至少需要一个表情").max(100, "最多100个表情"),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  downloadCount: z.number().int().min(0).optional(),
});
