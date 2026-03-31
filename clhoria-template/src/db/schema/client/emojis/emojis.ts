import { index, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@/db/schema/_shard/base-columns";
import { statusEnum } from "@/db/schema/_shard/enums";
import { Status } from "@/lib/enums";
import { StatusDescriptions } from "@/lib/schemas";

/**
 * Client emoji stickers table
 * 客户端表情包表
 *
 * Features:
 * - No name field, only tag-based classification / 无名字字段，仅基于 tag 分类
 * - Multiple tags support (JSONB array) / 支持多个 tag
 * - Tag-based querying / 基于 tag 查询
 */
export const clientEmojis = pgTable("client_emojis", {
  ...baseColumns,
  /** Tag list for classification and querying / 标签列表，用于分类和查询 */
  tags: jsonb().$type<string[]>().default([]).notNull(),
  /** Emoji image URL / 表情图片地址 */
  url: varchar({ length: 512 }).notNull(),
  /** Optional description / 可选描述 */
  description: text(),
  /** Enabled/disabled status / 启用/禁用状态 */
  status: statusEnum().default(Status.ENABLED).notNull(),
}, table => [
  // GIN index for JSONB array queries (contains tag) / GIN 索引用于 JSONB 数组查询（包含 tag）
  index("client_emojis_tags_idx").using("gin", table.tags),
  // Index for status filtering / 状态过滤索引
  index("client_emojis_status_idx").on(table.status),
]);

/**
 * Select Schema (used for queries)
 * Select Schema（查询时使用）
 */
export const selectClientEmojisSchema = createSelectSchema(clientEmojis, {
  id: schema => schema.meta({ description: "表情ID" }),
  tags: schema => schema.meta({ description: "标签列表（用于分类和查询）" }),
  url: schema => schema.meta({ description: "表情图片地址" }),
  description: schema => schema.meta({ description: "描述" }),
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
const baseInsertClientEmojisSchema = createInsertSchema(clientEmojis).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertClientEmojisSchema = baseInsertClientEmojisSchema.extend({
  url: z.string().min(1, "图片地址不能为空").max(512, "图片地址最多512个字符").url("图片地址格式不正确"),
  tags: z.array(z.string().min(1, "标签不能为空").max(32, "标签最多32个字符")).min(1, "至少需要一个标签").max(10, "最多10个标签"),
  description: z.string().max(200, "描述最多200个字符").optional(),
});
