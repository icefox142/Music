import { createRoute, z } from "@hono/zod-openapi";

import { RefineResultSchema } from "@/lib/core/refine-query";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "@/lib/core/stoker/openapi/helpers";
import { commentsQuerySchema, commentsCreateSchema, commentsResponseSchema, commentsListResponseSchema, commentsUpdateSchema } from "./comments.schema";
import { respErrSchema } from "@/utils";

const routePrefix = "/comments";
const tags = [`${routePrefix}（评论）`];

/** Comments list / 评论列表 */
export const list = createRoute({
  path: routePrefix,
  method: "get",
  tags,
  summary: "评论列表",
  description: `
获取评论列表，支持筛选和分页

**查询参数：**
- \`songId\`: 筛选特定歌曲的评论
- \`parentId\`: 筛选特定评论的回复（null表示顶级评论）
- \`userId\`: 筛选特定用户的评论
- \`sortBy\`: 排序方式（latest/hot/pinned）
- \`page\`: 页码
- \`limit\`: 每页数量
  `.trim(),
  request: {
    query: commentsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(commentsListResponseSchema), "查询成功"),
  },
});

/** Get comment by ID / 根据ID获取评论 */
export const get = createRoute({
  path: `${routePrefix}/:id`,
  method: "get",
  tags,
  summary: "获取评论详情",
  description: "根据ID获取单个评论详情",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "评论ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(commentsResponseSchema), "获取成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "评论不存在"),
  },
});

/** Create comment / 创建评论 */
export const create = createRoute({
  path: routePrefix,
  method: "post",
  tags,
  summary: "创建评论",
  description: "创建新的评论（需要客户端登录）",
  request: {
    body: jsonContentRequired(commentsCreateSchema, "评论信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(commentsResponseSchema), "创建成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(respErrSchema, "参数验证失败"),
  },
});

/** Update comment / 更新评论 */
export const update = createRoute({
  path: `${routePrefix}/:id`,
  method: "patch",
  tags,
  summary: "更新评论",
  description: "更新评论内容（部分更新）",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "评论ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
    body: jsonContentRequired(commentsUpdateSchema, "更新的评论信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(commentsResponseSchema), "更新成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "评论不存在"),
  },
});

/** Delete comment / 删除评论 */
export const remove = createRoute({
  path: `${routePrefix}/:id`,
  method: "delete",
  tags,
  summary: "删除评论",
  description: "删除指定的评论",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "评论ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ success: z.boolean() })), "删除成功"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "评论不存在"),
  },
});

/** Like comment / 点赞评论 */
export const like = createRoute({
  path: `${routePrefix}/:id/like`,
  method: "post",
  tags,
  summary: "点赞评论",
  description: "点赞或取消点赞评论（1=点赞，-1=踩，0=取消）",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "评论ID",
        example: "01234567-89ab-cdef-0123-456789abcdef",
      }),
    }),
    body: jsonContentRequired(z.object({
      likeType: z.enum(["1", "-1", "0"]).openapi({
        description: "点赞类型",
        enum: ["1", "-1", "0"],
        example: "1",
      }),
    }), "点赞信息"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(RefineResultSchema(z.object({ message: z.string(), likeCount: z.number() })), "操作成功"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(respErrSchema, "参数错误"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(respErrSchema, "评论不存在"),
  },
});
