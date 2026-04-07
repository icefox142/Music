import { z } from "zod";

import { Status } from "@/lib/enums";

/** Create emoji Schema / 创建表情包 Schema */
export const emojiCreateSchema = z.object({
  tags: z.array(z.string().min(1, "标签不能为空").max(32, "标签最多32个字符"))
    .min(1, "至少需要一个标签")
    .max(10, "最多10个标签")
    .meta({ description: "标签列表" }),
  url: z.string().min(1, "图片地址不能为空").max(512, "图片地址最多512个字符").url("图片地址格式不正确").meta({ description: "表情图片地址" }),
  description: z.string().max(200, "描述最多200个字符").optional().meta({ description: "描述" }),
  status: z.enum([Status.ENABLED, Status.DISABLED]).optional().meta({ description: "状态" }),
});

/** Update emoji Schema / 更新表情包 Schema */
export const emojiPatchSchema = emojiCreateSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "至少需要提供一个字段进行更新" },
);

/** Query params Schema / 查询参数 Schema */
export const emojiQuerySchema = z.object({
  // Tag filtering (supports multiple tags, OR logic) / 标签过滤（支持多个标签，OR 逻辑）
  tags: z.array(z.string()).optional().meta({ description: "标签列表（查询包含任一标签的表情包）" }),
  // Tag exact match (supports multiple tags, AND logic) / 标签精确匹配（支持多个标签，AND 逻辑）
  tagsAll: z.array(z.string()).optional().meta({ description: "标签列表（查询同时包含所有标签的表情包）" }),
  status: z.enum([Status.ENABLED, Status.DISABLED]).optional().meta({ description: "状态" }),
  // Pagination / 分页
  page: z.coerce.number().int().min(1).default(1).meta({ description: "页码" }),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).meta({ description: "每页数量" }),
});

/** Response Schema / 响应 Schema */
export const emojiResponseSchema = z.object({
  id: z.string().meta({ description: "表情ID" }),
  tags: z.array(z.string()).meta({ description: "标签列表" }),
  url: z.string().meta({ description: "表情图片地址" }),
  description: z.string().nullable().optional().meta({ description: "描述" }),
  status: z.string().meta({ description: "状态" }),
  createdAt: z.string().nullable().optional().meta({ description: "创建时间" }),
  updatedAt: z.string().nullable().optional().meta({ description: "更新时间" }),
});

/** List response Schema / 列表响应 Schema */
export const emojiListResponseSchema = z.array(emojiResponseSchema);
