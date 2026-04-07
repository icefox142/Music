import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { respErrSchema } from "@/utils";
import { emojiCreateSchema, emojiListResponseSchema, emojiPatchSchema, emojiQuerySchema, emojiResponseSchema } from "./emojis.schema";

const routePrefix = "/emoji/emojis";
const tags = [`${routePrefix}（表情包）`];

/** Emoji list / 表情包列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "表情包列表",
  description: `
通过标签查询表情包

**查询方式：**
- \`tags\`: 查询包含**任一**标签的表情包（OR 逻辑）
- \`tagsAll\`: 查询包含**所有**标签的表情包（AND 逻辑）

**示例：**
\`\`\`json
// 查询包含 "happy" 或 "sad" 的表情包
{"tags": ["happy", "sad"]}

// 查询同时包含 "happy" 和 "cat" 的表情包
{"tagsAll": ["happy", "cat"]}
\`\`\`
  `.trim(),
  request: {
    query: emojiQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(emojiListResponseSchema), "查询成功"),
  },
});

/** Create emoji / 创建表情包 */
export const create = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "创建表情包",
  description: "创建新的表情包（需要客户端登录）",
  request: {
    body: jsonContentRequired(emojiCreateSchema, "表情包信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(emojiResponseSchema), "创建成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(respErrSchema, "参数验证失败"),
  },
});

/** Get emoji by ID / 根据ID获取表情包 */
export const get = createRoute({
  path: `${routePrefix}/:id`,
  method: "get",
  tags,
  summary: "获取表情包详情",
  description: "根据 ID 获取单个表情包详情",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(emojiResponseSchema), "获取成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "表情包不存在"),
  },
});

/** Update emoji / 更新表情包 */
export const update = createRoute({
  path: `${routePrefix}/:id`,
  method: "patch",
  tags,
  summary: "更新表情包",
  description: "更新表情包信息（部分更新）",
  request: {
    body: jsonContentRequired(emojiPatchSchema, "更新的表情包信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(emojiResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "表情包不存在"),
  },
});

/** Delete emoji / 删除表情包 */
export const remove = createRoute({
  path: `${routePrefix}/:id`,
  method: "delete",
  tags,
  summary: "删除表情包",
  description: "删除指定的表情包",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "表情包不存在"),
  },
});
