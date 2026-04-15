import { z } from "zod";

import { selectClientCommentsSchema, insertClientCommentsSchema } from "@/db/schema";

/**
 * Query schema for comments list / 评论列表查询schema
 */
export const commentsQuerySchema = z.object({
  songId: z.string().optional().openapi({
    description: "歌曲ID（筛选特定歌曲的评论）",
    example: "01234567-89ab-cdef-0123-456789abcdef",
  }),
  parentId: z.string().nullable().optional().openapi({
    description: "父评论ID（null表示顶级评论）",
    example: null,
  }),
  userId: z.string().optional().openapi({
    description: "用户ID（筛选特定用户的评论）",
    example: "01234567-89ab-cdef-0123-456789abcdef",
  }),
  sortBy: z.enum(["latest", "hot", "pinned"]).optional().default("latest").openapi({
    description: "排序方式",
    enum: ["latest", "hot", "pinned"],
    example: "latest",
  }),
  page: z.coerce.number().int().min(1).optional().default(1).openapi({
    description: "页码",
  }),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20).openapi({
    description: "每页数量",
  }),
});

/**
 * Create schema for comments / 创建评论schema
 */
export const commentsCreateSchema = insertClientCommentsSchema;

/**
 * Update schema for comments / 更新评论schema
 */
export const commentsUpdateSchema = insertClientCommentsSchema
  .partial()
  .extend({
    content: z.string().min(1).max(5000).openapi({
      description: "更新的评论内容",
    }),
  });

/**
 * Like schema for comments / 点评点赞schema
 */
export const commentsLikeSchema = z.object({
  likeType: z.enum(["1", "-1", "0"]).openapi({
    description: "点赞类型：1=点赞，-1=踩，0=取消",
    enum: ["1", "-1", "0"],
    example: "1",
  }),
});

/**
 * Response schema for single comment / 单个评论响应schema
 */
export const commentsResponseSchema = selectClientCommentsSchema;

/**
 * Response schema for comments list / 评论列表响应schema
 */
export const commentsListResponseSchema = z.object({
  data: z.array(selectClientCommentsSchema),
  meta: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
  }),
});

/**
 * Types
 */
export type CommentsQuery = z.infer<typeof commentsQuerySchema>;
export type CommentsCreate = z.infer<typeof commentsCreateSchema>;
export type CommentsUpdate = z.infer<typeof commentsUpdateSchema>;
export type CommentsLike = z.infer<typeof commentsLikeSchema>;
