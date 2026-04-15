import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { lyricsQuerySchema, lyricsCreateSchema, lyricsResponseSchema, lyricsListResponseSchema, lyricsUpdateSchema } from "./lyrics.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/lyrics";
const tags = [`${routePrefix}（歌词）`];

/** Lyrics list / 歌词列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "歌词列表",
  description: `
获取歌词列表，支持筛选和分页

**查询参数：**
- \`songId\`: 筛选特定歌曲的歌词
- \`language\`: 按语言筛选
- \`isVerified\`: 仅显示已验证的歌词
- \`page\`: 页码
- \`limit\`: 每页数量
  `.trim(),
  request: {
    query: lyricsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(lyricsListResponseSchema), "查询成功"),
  },
});

/** Get lyrics by ID / 根据ID获取歌词 */
export const get = createRoute({
  path: `${routePrefix}/:id`,
  method: "get",
  tags,
  summary: "获取歌词详情",
  description: "根据ID获取单个歌词详情",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "歌词ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(lyricsResponseSchema), "获取成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌词不存在"),
  },
});

/** Create lyrics / 创建歌词 */
export const create = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "创建歌词",
  description: "创建新的歌词（需要客户端登录）",
  request: {
    body: jsonContentRequired(lyricsCreateSchema, "歌词信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(lyricsResponseSchema), "创建成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(respErrSchema, "参数验证失败"),
  },
});

/** Update lyrics / 更新歌词 */
export const update = createRoute({
  path: `${routePrefix}/:id`,
  method: "patch",
  tags,
  summary: "更新歌词",
  description: "更新歌词信息（部分更新）",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "歌词ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
    body: jsonContentRequired(lyricsUpdateSchema, "更新的歌词信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(lyricsResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌词不存在"),
  },
});

/** Delete lyrics / 删除歌词 */
export const remove = createRoute({
  path: `${routePrefix}/:id`,
  method: "delete",
  tags,
  summary: "删除歌词",
  description: "删除指定的歌词",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "歌词ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "歌词不存在"),
  },
});
