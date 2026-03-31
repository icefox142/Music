import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { favoriteCreateSchema, favoriteListResponseSchema, favoriteQuerySchema, favoriteResponseSchema } from "./favorites.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/emoji-favorites";
const tags = [`${routePrefix}（表情收藏）`];

/** Get user's favorite emojis list / 获取用户收藏的表情列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "我的收藏列表",
  description: "获取当前用户收藏的表情包列表（按收藏时间倒序）",
  request: {
    query: favoriteQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(favoriteListResponseSchema), "查询成功"),
  },
});

/** Add emoji to favorites / 添加收藏 */
export const add = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "添加收藏",
  description: "收藏指定的表情包（重复收藏会自动忽略）",
  request: {
    body: jsonContentRequired(favoriteCreateSchema, "表情ID"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(favoriteResponseSchema), "收藏成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "表情包不存在"),
  },
});

/** Remove emoji from favorites / 取消收藏 */
export const remove = createRoute({
  path: `${routePrefix}/:emojiId`,
  method: "delete",
  tags,
  summary: "取消收藏",
  description: "取消收藏指定的表情包",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "取消成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "收藏记录不存在"),
  },
});

/** Check if emoji is favorited / 检查是否已收藏 */
export const check = createRoute({
  path: `${routePrefix}/:emojiId/check`,
  method: "get",
  tags,
  summary: "检查收藏状态",
  description: "检查当前用户是否已收藏指定表情包",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ isFavorited: z.boolean() })), "查询成功"),
  },
});
