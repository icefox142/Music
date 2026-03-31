import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { songCreateSchema, songListResponseSchema, songQuerySchema, songResponseSchema, songUpdateSchema } from "./songs.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/songs";
const tags = [`${routePrefix}（歌曲）`];

/** Song list / 歌曲列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "歌曲列表",
  description: `
获取歌曲列表，支持搜索、筛选和排序

**查询参数：**
- \`search\`: 搜索歌曲标题或艺术家
- \`genre\`: 按音乐流派筛选
- \`language\`: 按语言筛选
- \`sortBy\`: 排序字段（playCount/releaseDate/createdAt/title）
- \`order\`: 排序方向（asc/desc）
  `.trim(),
  request: {
    query: songQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(songListResponseSchema), "查询成功"),
  },
});

/** Create song / 创建歌曲 */
export const create = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "创建歌曲",
  description: "创建新的歌曲（需要客户端登录）",
  request: {
    body: jsonContentRequired(songCreateSchema, "歌曲信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(songResponseSchema), "创建成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(respErrSchema, "参数验证失败"),
  },
});

/** Get song by ID / 根据ID获取歌曲 */
export const get = createRoute({
  path: `${routePrefix}/:id`,
  method: "get",
  tags,
  summary: "获取歌曲详情",
  description: "根据 ID 获取单个歌曲详情",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(songResponseSchema), "获取成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌曲不存在"),
  },
});

/** Update song / 更新歌曲 */
export const update = createRoute({
  path: `${routePrefix}/:id`,
  method: "patch",
  tags,
  summary: "更新歌曲",
  description: "更新歌曲信息（部分更新）",
  request: {
    body: jsonContentRequired(songUpdateSchema, "更新的歌曲信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(songResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌曲不存在"),
  },
});

/** Delete song / 删除歌曲 */
export const remove = createRoute({
  path: `${routePrefix}/:id`,
  method: "delete",
  tags,
  summary: "删除歌曲",
  description: "删除指定的歌曲",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌曲不存在"),
  },
});
