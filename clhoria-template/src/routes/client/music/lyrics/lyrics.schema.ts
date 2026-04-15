import { z } from "zod";

import { selectClientLyricsSchema, insertClientLyricsSchema } from "@/db/schema";

/**
 * Query schema for lyrics list / 歌词列表查询schema
 */
export const lyricsQuerySchema = z.object({
  songId: z.string().optional().openapi({
    description: "歌曲ID（筛选特定歌曲的歌词）",
    example: "01234567-89ab-cdef-0123-456789abcdef",
  }),
  language: z.string().optional().openapi({
    description: "歌词语言（如：zh-CN, ja, ko, en）",
    example: "zh-CN",
  }),
  isVerified: z.coerce.boolean().optional().openapi({
    description: "仅显示已验证的歌词",
  }),
  page: z.coerce.number().int().min(1).optional().default(1).openapi({
    description: "页码",
  }),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20).openapi({
    description: "每页数量",
  }),
});

/**
 * Create schema for lyrics / 创建歌词schema
 */
export const lyricsCreateSchema = insertClientLyricsSchema;

/**
 * Update schema for lyrics / 更新歌词schema
 */
export const lyricsUpdateSchema = insertClientLyricsSchema.partial().extend({
  id: z.string().optional(), // 允许在body中传递id但会被忽略
});

/**
 * Response schema for single lyrics / 单个歌词响应schema
 */
export const lyricsResponseSchema = selectClientLyricsSchema;

/**
 * Response schema for lyrics list / 歌词列表响应schema
 */
export const lyricsListResponseSchema = z.object({
  data: z.array(selectClientLyricsSchema),
  meta: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
  }),
});

/**
 * Types
 */
export type LyricsQuery = z.infer<typeof lyricsQuerySchema>;
export type LyricsCreate = z.infer<typeof lyricsCreateSchema>;
export type LyricsUpdate = z.infer<typeof lyricsUpdateSchema>;
