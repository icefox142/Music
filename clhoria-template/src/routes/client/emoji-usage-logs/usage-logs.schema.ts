import { z } from "zod";

/** Record emoji usage Schema / 记录表情使用 Schema */
export const usageLogCreateSchema = z.object({
  emojiId: z.string().min(1, "表情ID不能为空").meta({ description: "表情ID" }),
  context: z.enum(["chat", "comment", "post", "message", "profile", "other"]).meta({ description: "使用场景" }),
  targetId: z.string().optional().meta({ description: "目标ID（聊天室ID/评论ID/帖子ID等）" }),
  count: z.number().int().min(1).max(100).default(1).meta({ description: "使用次数" }),
});

/** Batch record usage Schema / 批量记录使用 Schema */
export const batchUsageLogSchema = z.object({
  usages: z.array(usageLogCreateSchema).min(1, "至少需要一条使用记录").max(50, "最多50条记录").meta({ description: "使用记录列表" }),
});

/** Query params Schema / 查询参数 Schema */
export const usageLogQuerySchema = z.object({
  context: z.enum(["chat", "comment", "post", "message", "profile", "other"]).optional().meta({ description: "使用场景" }),
  startDate: z.string().optional().meta({ description: "开始日期（ISO 8601）" }),
  endDate: z.string().optional().meta({ description: "结束日期（ISO 8601）" }),
  // Pagination / 分页
  page: z.coerce.number().int().min(1).default(1).meta({ description: "页码" }),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).meta({ description: "每页数量" }),
});

/** Usage statistics response Schema / 使用统计响应 Schema */
export const usageStatsSchema = z.object({
  emojiId: z.string().meta({ description: "表情ID" }),
  totalCount: z.number().meta({ description: "总使用次数" }),
  uniqueUsers: z.number().meta({ description: "使用人数" }),
  contextBreakdown: z.record(z.string(), z.number()).meta({ description: "场景使用分布" }),
});

/** Popular emojis response Schema / 热门表情响应 Schema */
export const popularEmojisSchema = z.object({
  emojiId: z.string().meta({ description: "表情ID" }),
  tags: z.array(z.string()).meta({ description: "标签" }),
  url: z.string().meta({ description: "图片地址" }),
  usageCount: z.number().meta({ description: "使用次数" }),
});
