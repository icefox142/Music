import { createRoute, z } from "@hono/zod-openapi";

import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { respErrSchema } from "@/utils";
import { batchUsageLogSchema, popularEmojisSchema, usageLogCreateSchema, usageLogQuerySchema, usageStatsSchema } from "./usage-logs.schema";

const routePrefix = "/emoji/usage-logs";
const tags = [`${routePrefix}（表情使用记录）`];

/** Record emoji usage / 记录表情使用 */
export const record = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "记录表情使用",
  description: `
记录表情包使用情况（用于统计和推荐）

**使用场景（context）：**
- \`chat\` - 聊天
- \`comment\` - 评论
- \`post\` - 帖子
- \`message\` - 私信
- \`profile\` - 个人资料
- \`other\` - 其他

**建议时机：**
- 用户发送表情时立即调用
- 批量记录可使用 \`/batch\` 端点
  `.trim(),
  request: {
    body: jsonContentRequired(usageLogCreateSchema, "使用记录"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ success: z.boolean() }), "记录成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
  },
});

/** Batch record emoji usage / 批量记录表情使用 */
export const batchRecord = createRoute({
  path: `${routePrefix}/batch`,
  method: "post",
  tags,
  summary: "批量记录表情使用",
  description: "批量记录多个表情的使用情况（最多50条）",
  request: {
    body: jsonContentRequired(batchUsageLogSchema, "使用记录列表"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ success: z.boolean(), count: z.number() }), "记录成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
  },
});

/** Get user's usage history / 获取用户使用历史 */
export const getHistory = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "我的使用历史",
  description: "获取当前用户的表情使用历史（按时间倒序）",
  request: {
    query: usageLogQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({
      data: z.array(z.object({
        id: z.string(),
        emojiId: z.string(),
        context: z.string(),
        targetId: z.string().optional(),
        count: z.number(),
        usedAt: z.string(),
      })),
      total: z.number(),
    }), "查询成功"),
  },
});

/** Get popular emojis / 获取热门表情 */
export const getPopular = createRoute({
  path: `${routePrefix}/popular`,
  method: "get",
  tags,
  summary: "热门表情排行",
  description: `
获取热门表情排行榜

**可选参数：**
- \`context\`: 按使用场景筛选
- \`limit\`: 返回数量（默认10，最多50）
  `.trim(),
  request: {
    query: z.object({
      context: z.enum(["chat", "comment", "post", "message", "profile", "other"]).optional(),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(popularEmojisSchema), "查询成功"),
  },
});

/** Get emoji usage statistics / 获取表情使用统计 */
export const getStats = createRoute({
  path: `${routePrefix}/stats/:emojiId`,
  method: "get",
  tags,
  summary: "表情使用统计",
  description: "获取指定表情的详细使用统计（总次数、使用人数、场景分布）",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(usageStatsSchema, "查询成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "表情不存在"),
  },
});
