import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import {
  playlistSongBatchAddSchema,
  playlistSongBatchRemoveSchema,
  playlistSongBatchUpdateSchema,
  playlistSongCreateSchema,
  playlistSongListResponseSchema,
  playlistSongResponseSchema,
  playlistSongUpdateSchema,
  playlistSongWithDetailSchema,
} from "./playlist-songs.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/playlists/:id/songs";
const tags = ["歌单歌曲"];

/** Get playlist songs / 获取歌单中的歌曲列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "获取歌单歌曲列表",
  description: "获取指定歌单中的所有歌曲（包含歌曲详情）",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistSongListResponseSchema), "查询成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});

/** Add song to playlist / 添加歌曲到歌单 */
export const add = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "添加歌曲到歌单",
  description: "向指定歌单添加一首歌曲（只能操作自己创建的歌单）",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
    }),
    body: jsonContentRequired(playlistSongCreateSchema, "歌曲信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistSongWithDetailSchema), "添加成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单或歌曲不存在"),
    [HttpStatusCodes.CONFLICT]: jsonContent(respErrSchema, "歌曲已存在于歌单中"),
  },
});

/** Batch add songs / 批量添加歌曲 */
export const batchAdd = createRoute({
  path: `${routePrefix}/batch`,
  method: "post",
  tags,
  summary: "批量添加歌曲到歌单",
  description: "批量添加多首歌曲到指定歌单",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
    }),
    body: jsonContentRequired(playlistSongBatchAddSchema, "歌曲ID列表"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ count: z.number(), added: z.array(playlistSongResponseSchema) })), "添加成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});

/** Remove song from playlist / 从歌单移除歌曲 */
export const remove = createRoute({
  path: `${routePrefix}/:songId`,
  method: "delete",
  tags,
  summary: "从歌单移除歌曲",
  description: "从指定歌单移除一首歌曲",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
      songId: z.string().uuid("歌曲ID格式不正确"),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});

/** Batch remove songs / 批量移除歌曲 */
export const batchRemove = createRoute({
  path: `${routePrefix}/batch`,
  method: "delete",
  tags,
  summary: "批量从歌单移除歌曲",
  description: "批量从指定歌单移除多首歌曲",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
    }),
    body: jsonContentRequired(playlistSongBatchRemoveSchema, "歌曲ID列表"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ count: z.number() })), "删除成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});

/** Update song position / 更新歌曲位置 */
export const update = createRoute({
  path: `${routePrefix}/:songId`,
  method: "put",
  tags,
  summary: "更新歌曲位置",
  description: "更新歌曲在歌单中的位置",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
      songId: z.string().uuid("歌曲ID格式不正确"),
    }),
    body: jsonContentRequired(playlistSongUpdateSchema, "位置信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(playlistSongResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单或歌曲不存在"),
  },
});

/** Batch update positions / 批量更新歌曲位置 */
export const batchUpdate = createRoute({
  path: `${routePrefix}/batch`,
  method: "put",
  tags,
  summary: "批量更新歌曲位置",
  description: "批量更新多首歌曲在歌单中的位置",
  request: {
    params: z.object({
      id: z.string().uuid("歌单ID格式不正确"),
    }),
    body: jsonContentRequired(playlistSongBatchUpdateSchema, "位置更新列表"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ count: z.number() })), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(respErrSchema, "无权操作"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌单不存在"),
  },
});
