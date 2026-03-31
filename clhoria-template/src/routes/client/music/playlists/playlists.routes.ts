import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { playlistCreateSchema, playlistListResponseSchema, playlistQuerySchema, playlistResponseSchema, playlistUpdateSchema } from "./playlists.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/playlists";
const tags = [`${routePrefix}（歌单）`];

/** Playlist list / 歌单列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "歌单列表",
  description: `
获取歌单列表，支持筛选和排序

**查询参数：**
- \`userId\`: 按用户筛选
- \`isPublic\`: 按公开状态筛选
- \`sortBy\`: 排序字段（playCount/createdAt/songCount/sortOrder）
- \`order\`: 排序方向（asc/desc）
  `.trim(),
  request: {
    query: playlistQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistListResponseSchema), "查询成功"),
  },
});

/** Get my playlists / 获取我的歌单 */
export const mine = createRoute({
  path: `${routePrefix}/mine`,
  method: "get",
  tags,
  summary: "获取我的歌单",
  description: "获取当前登录用户创建的所有歌单",
  request: {
    query: playlistQuerySchema.pick({ page: true, pageSize: true, sortBy: true, order: true }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistListResponseSchema), "查询成功"),
  },
});

/** Get public playlists / 获取公开歌单 */
export const getPublic = createRoute({
  path: `${routePrefix}/public`,
  method: "get",
  tags,
  summary: "获取公开歌单",
  description: "获取所有公开的歌单列表",
  request: {
    query: playlistQuerySchema.pick({ page: true, pageSize: true, sortBy: true, order: true }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistListResponseSchema), "查询成功"),
  },
});

/** Create playlist / 创建歌单 */
export const create = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "创建歌单",
  description: "创建新的歌单（需要客户端登录）",
  request: {
    body: jsonContentRequired(playlistCreateSchema, "歌单信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistResponseSchema), "创建成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(respErrSchema, "参数验证失败"),
  },
});

/** Get playlist by ID / 根据ID获取歌单 */
export const get = createRoute({
  path: `${routePrefix}/:id`,
  method: "get",
  tags,
  summary: "获取歌单详情",
  description: "根据 ID 获取单个歌单详情",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistResponseSchema), "获取成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});

/** Update playlist / 更新歌单 */
export const update = createRoute({
  path: `${routePrefix}/:id`,
  method: "patch",
  tags,
  summary: "更新歌单",
  description: "更新歌单信息（部分更新，只能更新自己创建的歌单）",
  request: {
    body: jsonContentRequired(playlistUpdateSchema, "更新的歌单信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});

/** Delete playlist / 删除歌单 */
export const remove = createRoute({
  path: `${routePrefix}/:id`,
  method: "delete",
  tags,
  summary: "删除歌单",
  description: "删除指定的歌单（只能删除自己创建的歌单）",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});
