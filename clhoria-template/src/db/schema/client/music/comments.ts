import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@/db/schema/_shard/base-columns";
import { statusEnum } from "@/db/schema/_shard/enums";
import { clientSongs } from "./songs";
import { clientUsers } from "../users/users";
import { Status } from "@/lib/enums";
import { StatusDescriptions } from "@/lib/schemas";

/**
 * Song comments table / 歌曲评论表
 *
 * Features:
 * - User comments on songs / 用户对歌曲的评论
 * - Nested comment threading / 嵌套评论线程
 * - Like/dislike functionality / 点赞/踩功能
 * - Rich text content support / 富文本内容支持
 * - Moderation tools / 内容审核工具
 */
export const clientComments = pgTable("client_comments", {
  ...baseColumns,
  /** Associated song ID / 关联歌曲ID */
  songId: uuid().notNull().references(() => clientSongs.id, { onDelete: "cascade" }),
  /** Commenter user ID / 评论用户ID */
  userId: uuid().notNull().references(() =>clientUsers.id, { onDelete: "cascade" }),
  /** Parent comment ID (for nested replies) / 父评论ID（用于嵌套回复） */
  parentId: uuid().references(() => clientComments.id, { onDelete: "cascade" }),
  /** Comment content (rich text) / 评论内容（富文本） */
  content: text().notNull(),
  /** Like count / 点赞数 */
  likeCount: integer().default(0).notNull(),
  /** Dislike count / 踩数量 */
  dislikeCount: integer().default(0).notNull(),
  /** Reply count / 回复数量 */
  replyCount: integer().default(0).notNull(),
  /** IP address for spam control / IP地址用于垃圾评论控制 */
  ipAddress: varchar({ length: 64 }),
  /** User agent for spam control / 用户代理用于垃圾评论控制 */
  userAgent: text(),
  /** Is pinned by admin / 是否被管理员置顶 */
  isPinned: boolean().default(false).notNull(),
  /** Is highlighted / 是否高亮显示 */
  isHighlighted: boolean().default(false).notNull(),
  /** Last activity timestamp / 最后活跃时间戳 */
  lastActivityAt: timestamp({ mode: "string" }),
  /** Status / 状态 */
  status: statusEnum().default(Status.ENABLED).notNull(),
}, table => [
  // Index for song comments / 歌曲评论索引
  index("client_comments_song_id_idx").on(table.songId, table.createdAt.desc()),
  // Index for user comments / 用户评论索引
  index("client_comments_user_id_idx").on(table.userId, table.createdAt.desc()),
  // Index for parent comments / 父评论索引
  index("client_comments_parent_id_idx").on(table.parentId),
  // Index for pinned comments / 置顶评论索引
  index("client_comments_pinned_idx").on(table.isPinned, table.likeCount.desc()),
  // Index for popularity / 热度索引
  index("client_comments_popularity_idx").on(table.likeCount.desc()),
  // Index for last activity / 最后活跃时间索引
  index("client_comments_last_activity_idx").on(table.lastActivityAt.desc()),
  // Index for status / 状态索引
  index("client_comments_status_idx").on(table.status),
]);

/**
 * Comment likes table / 评论点赞表
 *
 * Tracks user likes/dislikes on comments
 * 跟踪用户对评论的点赞/踩
 */
export const clientCommentLikes = pgTable("client_comment_likes", {
  /** User who liked/disliked the comment / 点赞/踩的用户 */
  userId: uuid().notNull().references(() => clientUsers.id, { onDelete: "cascade" }),
  /** Comment that was liked/disliked / 被点赞/踩的评论 */
  commentId: uuid().notNull().references(() => clientComments.id, { onDelete: "cascade" }),
  /** Like type: 1 = like, -1 = dislike, 0 = removed / 点赞类型：1=点赞，-1=踩，0=取消 */
  likeType: integer().notNull(),
  /** When the like/dislike was given / 点赞/踩时间 */
  likedAt: timestamp({ mode: "string" }).$defaultFn(() => new Date().toISOString()),
}, table => [
  // Composite primary key / 联合主键
  primaryKey({ columns: [table.userId, table.commentId] }),
  // Index for user's likes / 用户点赞索引
  index("client_comment_likes_user_id_idx").on(table.userId),
  // Index for comment's likes / 评论点赞索引
  index("client_comment_likes_comment_id_idx").on(table.commentId),
  // Index for like type / 点赞类型索引
  index("client_comment_likes_type_idx").on(table.likeType),
]);

/**
 * Select Schema for comments
 * 评论的 Select Schema
 */
export const selectClientCommentsSchema = createSelectSchema(clientComments, {
  id: schema => schema.meta({ description: "评论ID" }),
  songId: schema => schema.meta({ description: "关联歌曲ID" }),
  userId: schema => schema.meta({ description: "评论用户ID" }),
  parentId: schema => schema.meta({ description: "父评论ID" }),
  content: schema => schema.meta({ description: "评论内容" }),
  likeCount: schema => schema.meta({ description: "点赞数" }),
  dislikeCount: schema => schema.meta({ description: "踩数量" }),
  replyCount: schema => schema.meta({ description: "回复数量" }),
  ipAddress: schema => schema.meta({ description: "IP地址" }),
  userAgent: schema => schema.meta({ description: "用户代理" }),
  isPinned: schema => schema.meta({ description: "是否置顶" }),
  isHighlighted: schema => schema.meta({ description: "是否高亮" }),
  lastActivityAt: schema => schema.meta({ description: "最后活跃时间" }),
  status: schema => schema.meta({ description: StatusDescriptions.SYSTEM }),
  createdAt: schema => schema.meta({ description: "创建时间" }),
  createdBy: schema => schema.meta({ description: "创建人" }),
  updatedAt: schema => schema.meta({ description: "更新时间" }),
  updatedBy: schema => schema.meta({ description: "更新人" }),
});

/**
 * Insert Schema for comments
 * 评论的 Insert Schema
 */
const baseInsertSchema = createInsertSchema(clientComments).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertClientCommentsSchema = baseInsertSchema.extend({
  songId: z.string().uuid("歌曲ID格式不正确"),
  userId: z.string().uuid("用户ID格式不正确"),
  parentId: z.string().uuid("父评论ID格式不正确").optional(),
  content: z.string().min(1, "评论内容不能为空").max(5000, "评论内容最多5000个字符"),
  likeCount: z.number().int().min(0).default(0),
  dislikeCount: z.number().int().min(0).default(0),
  replyCount: z.number().int().min(0).default(0),
  ipAddress: z.string().max(64, "IP地址最多64个字符").optional(),
  userAgent: z.string().max(500, "用户代理最多500个字符").optional(),
  isPinned: z.boolean().optional(),
  isHighlighted: z.boolean().optional(),
  lastActivityAt: z.string().datetime().optional(),
  status: z.nativeEnum(Status).optional(),
});

/**
 * Select Schema for comment likes
 * 评论点赞的 Select Schema
 */
export const selectClientCommentLikesSchema = createSelectSchema(clientCommentLikes, {
  userId: schema => schema.meta({ description: "用户ID" }),
  commentId: schema => schema.meta({ description: "评论ID" }),
  likeType: schema => schema.meta({ description: "点赞类型：1=点赞，-1=踩，0=取消" }),
  likedAt: schema => schema.meta({ description: "点赞时间" }),
});

/**
 * Insert Schema for comment likes
 * 评论点赞的 Insert Schema
 */
export const insertClientCommentLikesSchema = createInsertSchema(clientCommentLikes).extend({
  userId: z.string().uuid("用户ID格式不正确"),
  commentId: z.string().uuid("评论ID格式不正确"),
  likeType: z.number().int().refine(val => val === 1 || val === -1 || val === 0, {
    message: "点赞类型必须是1（点赞）、-1（踩）或0（取消）"
  }),
});
