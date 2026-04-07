import { z } from "zod";

import { Status } from "@/lib/enums";

/** Create emoji collection Schema / 创建表情包集合 Schema */
export const collectionCreateSchema = z.object({
  name: z.string().min(1, "集合名称不能为空").max(128, "集合名称最多128个字符").meta({ description: "集合名称" }),
  coverUrl: z.string().min(1, "封面图不能为空").max(512, "封面图最多512个字符").url("封面图格式不正确").meta({ description: "封面图地址" }),
  description: z.string().max(500, "描述最多500个字符").optional().meta({ description: "集合描述" }),
  tags: z.array(z.string().max(32, "标签最多32个字符")).max(10, "最多10个标签").optional().meta({ description: "标签列表" }),
  emojiIds: z.array(z.string()).min(1, "至少需要一个表情").max(100, "最多100个表情").meta({ description: "表情ID列表" }),
  isFeatured: z.boolean().optional().meta({ description: "是否精选" }),
  sortOrder: z.number().int().min(0, "排序不能为负数").optional().meta({ description: "排序序号" }),
  status: z.enum([Status.ENABLED, Status.DISABLED]).optional().meta({ description: "状态" }),
});

/** Update emoji collection Schema / 更新表情包集合 Schema */
export const collectionPatchSchema = collectionCreateSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "至少需要提供一个字段进行更新" },
);

/** Query params Schema / 查询参数 Schema */
export const collectionQuerySchema = z.object({
  tags: z.array(z.string()).optional().meta({ description: "标签列表（查询包含任一标签的集合）" }),
  tagsAll: z.array(z.string()).optional().meta({ description: "标签列表（查询同时包含所有标签的集合）" }),
  isFeatured: z.boolean().optional().meta({ description: "是否精选" }),
  status: z.enum([Status.ENABLED, Status.DISABLED]).optional().meta({ description: "状态" }),
  // Pagination / 分页
  page: z.coerce.number().int().min(1).default(1).meta({ description: "页码" }),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).meta({ description: "每页数量" }),
});

/** Response Schema / 响应 Schema */
export const collectionResponseSchema = z.object({
  id: z.string().meta({ description: "集合ID" }),
  name: z.string().meta({ description: "集合名称" }),
  coverUrl: z.string().meta({ description: "封面图" }),
  description: z.string().nullable().optional().meta({ description: "描述" }),
  tags: z.array(z.string()).meta({ description: "标签列表" }),
  emojiIds: z.array(z.string()).meta({ description: "表情ID列表" }),
  isFeatured: z.boolean().meta({ description: "是否精选" }),
  sortOrder: z.number().meta({ description: "排序" }),
  downloadCount: z.number().meta({ description: "下载次数" }),
  status: z.string().meta({ description: "状态" }),
  createdAt: z.string().nullable().optional().meta({ description: "创建时间" }),
  updatedAt: z.string().nullable().optional().meta({ description: "更新时间" }),
});

/** List response Schema / 列表响应 Schema */
export const collectionListResponseSchema = z.array(collectionResponseSchema);
