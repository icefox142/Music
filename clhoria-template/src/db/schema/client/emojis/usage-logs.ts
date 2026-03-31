import { sql } from "drizzle-orm";
import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { clientEmojis } from "./emojis";

/**
 * Emoji usage logs table
 * 表情包使用记录表
 *
 * Tracks when and how emojis are used (for analytics and recommendations)
 * 追踪表情包何时、如何被使用（用于分析和推荐）
 */
export const clientEmojiUsageLogs = pgTable("client_emoji_usage_logs", {
  /** Usage record ID / 使用记录ID */
  id: uuid().primaryKey().default(sql`uuidv7()`),
  /** User ID who used the emoji / 使用表情的用户ID */
  userId: uuid().notNull(),
  /** Emoji ID that was used / 被使用的表情ID */
  emojiId: uuid().notNull().references(() => clientEmojis.id, { onDelete: "cascade" }),
  /** Usage context: chat, comment, post, etc. / 使用场景：聊天、评论、帖子等 */
  context: varchar({ length: 32 }).notNull(), // 'chat', 'comment', 'post', 'message', etc.
  /** Target ID (optional): where the emoji was used / 目标ID（可选）：表情使用在哪里 */
  targetId: uuid(), // e.g., chat room ID, comment ID, post ID
  /** Usage count (if user sent multiple times) / 使用次数（如果用户发送多次） */
  count: integer().default(1).notNull(),
  /** When the emoji was used / 使用时间 */
  usedAt: timestamp({ mode: "string" }).$defaultFn(() => new Date().toISOString()),
}, table => [
  // Index for querying user's usage history / 用户使用历史查询索引
  index("client_emoji_usage_logs_user_id_idx").on(table.userId, table.usedAt),
  // Index for querying emoji's usage stats / 表情使用统计查询索引
  index("client_emoji_usage_logs_emoji_id_idx").on(table.emojiId, table.usedAt),
  // Index for context-based queries / 基于场景的查询索引
  index("client_emoji_usage_logs_context_idx").on(table.context, table.usedAt),
]);

/**
 * Select Schema
 */
export const selectClientEmojiUsageLogsSchema = createSelectSchema(clientEmojiUsageLogs, {
  id: schema => schema.meta({ description: "记录ID" }),
  userId: schema => schema.meta({ description: "用户ID" }),
  emojiId: schema => schema.meta({ description: "表情ID" }),
  context: schema => schema.meta({ description: "使用场景" }),
  targetId: schema => schema.meta({ description: "目标ID" }),
  count: schema => schema.meta({ description: "使用次数" }),
  usedAt: schema => schema.meta({ description: "使用时间" }),
});

/**
 * Insert Schema
 */
export const insertClientEmojiUsageLogsSchema = createInsertSchema(clientEmojiUsageLogs).extend({
  context: z.enum(["chat", "comment", "post", "message", "profile", "other"]),
  count: z.number().int().min(1).max(100).default(1),
}).omit({
  id: true,
  usedAt: true,
});
