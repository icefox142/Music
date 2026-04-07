import { z } from "zod";

/** Add emoji to favorites Schema / 添加收藏 Schema */
export const favoriteCreateSchema = z.object({
  emojiId: z.string().min(1, "表情ID不能为空").meta({ description: "表情ID" }),
});

/** Query params Schema / 查询参数 Schema */
export const favoriteQuerySchema = z.object({
  // Pagination / 分页
  page: z.coerce.number().int().min(1).default(1).meta({ description: "页码" }),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).meta({ description: "每页数量" }),
});

/** Response Schema with emoji details / 响应 Schema（包含表情详情） */
export const favoriteResponseSchema = z.object({
  userId: z.string().meta({ description: "用户ID" }),
  emojiId: z.string().meta({ description: "表情ID" }),
  favoritedAt: z.string().meta({ description: "收藏时间" }),
  // Embed emoji details / 嵌入表情详情
  emoji: z.object({
    id: z.string(),
    tags: z.array(z.string()),
    url: z.string(),
    description: z.string().nullable().optional(),
    status: z.string(),
  }).optional().meta({ description: "表情详情" }),
});

/** List response Schema / 列表响应 Schema */
export const favoriteListResponseSchema = z.array(favoriteResponseSchema);
