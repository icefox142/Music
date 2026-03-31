import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { collectionCreateSchema, collectionListResponseSchema, collectionPatchSchema, collectionQuerySchema, collectionResponseSchema } from "./collections.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/emoji-collections";
const tags = [`${routePrefix}（表情包集合）`];

/** Emoji collection list / 表情包集合列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "表情包集合列表",
  description: `
查询表情包集合（表情包套餐）

**查询方式：**
- \`tags\`: 查询包含**任一**标签的集合（OR 逻辑）
- \`tagsAll\`: 查询包含**所有**标签的集合（AND 逻辑）
- \`isFeatured\`: 查询精选集合
- \`status\`: 按状态过滤

**排序：**
- 默认按 \`sortOrder\` 和 \`createdAt\` 排序
  `.trim(),
  request: {
    query: collectionQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(collectionListResponseSchema), "查询成功"),
  },
});

/** Create emoji collection / 创建表情包集合 */
export const create = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "创建表情包集合",
  description: "创建新的表情包集合（需要客户端登录）",
  request: {
    body: jsonContentRequired(collectionCreateSchema, "集合信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(collectionResponseSchema), "创建成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(respErrSchema, "参数验证失败"),
  },
});

/** Get collection by ID / 根据ID获取表情包集合 */
export const get = createRoute({
  path: `${routePrefix}/:id`,
  method: "get",
  tags,
  summary: "获取表情包集合详情",
  description: "根据 ID 获取单个表情包集合详情（包含表情列表）",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(collectionResponseSchema), "获取成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "集合不存在"),
  },
});

/** Update emoji collection / 更新表情包集合 */
export const update = createRoute({
  path: `${routePrefix}/:id`,
  method: "patch",
  tags,
  summary: "更新表情包集合",
  description: "更新表情包集合信息（部分更新）",
  request: {
    body: jsonContentRequired(collectionPatchSchema, "更新的集合信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(collectionResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "集合不存在"),
  },
});

/** Delete emoji collection / 删除表情包集合 */
export const remove = createRoute({
  path: `${routePrefix}/:id`,
  method: "delete",
  tags,
  summary: "删除表情包集合",
  description: "删除指定的表情包集合",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "集合不存在"),
  },
});

/** Increment download count / 增加下载次数 */
export const incrementDownload = createRoute({
  path: `${routePrefix}/:id/download`,
  method: "post",
  tags,
  summary: "记录集合下载",
  description: "增加表情包集合的下载次数（用户下载/添加集合时调用）",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ downloadCount: z.number() })), "记录成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "集合不存在"),
  },
});
