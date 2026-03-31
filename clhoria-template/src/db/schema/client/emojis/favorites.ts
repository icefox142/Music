import { index, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { clientEmojis } from "./emojis";
import { clientUsers } from "../users/users";

/**
 * User emoji favorites table
 * 用户收藏表情表
 */
export const clientEmojiFavorites = pgTable("client_emoji_favorites", {
  /** User ID who favorited the emoji / 收藏表情的用户ID */
  userId: uuid().notNull().references(() => clientUsers.id, { onDelete: "cascade" }),
  /** Emoji ID that was favorited / 被收藏的表情ID */
  emojiId: uuid().notNull().references(() => clientEmojis.id, { onDelete: "cascade" }),
  /** When the emoji was favorited / 收藏时间 */
  favoritedAt: timestamp({ mode: "string" }).$defaultFn(() => new Date().toISOString()),
}, table => [
  // Composite primary key / 联合主键
  primaryKey({ columns: [table.userId, table.emojiId] }),
  // Index for querying user's favorites / 用户收藏查询索引
  index("client_emoji_favorites_user_id_idx").on(table.userId),
  // Index for querying emoji's favoriters / 表情收藏者查询索引
  index("client_emoji_favorites_emoji_id_idx").on(table.emojiId),
]);

/**
 * Select Schema
 */
export const selectClientEmojiFavoritesSchema = createSelectSchema(clientEmojiFavorites, {
  userId: schema => schema.meta({ description: "用户ID" }),
  emojiId: schema => schema.meta({ description: "表情ID" }),
  favoritedAt: schema => schema.meta({ description: "收藏时间" }),
});

/**
 * Insert Schema
 */
export const insertClientEmojiFavoritesSchema = createInsertSchema(clientEmojiFavorites);
