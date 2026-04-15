import type { RouteConfig } from "@hono/zod-openapi";
import { CommentsQuery, CommentsCreate, CommentsUpdate, CommentsLike } from "./comments.schema";
import { commentsResponseSchema, commentsListResponseSchema } from "./comments.schema";

export type CommentsRouteHandlerType<RouteName extends string> = RouteConfig<
  Record<never, never>,
  {
    in: {
      param: RouteName extends "get" | "update" | "remove" | "like"
        ? { id: string }
        : never;
      query: RouteName extends "list"
        ? CommentsQuery
        : never;
      json: RouteName extends "create" | "update"
        ? CommentsCreate extends Record<string, never> ? never : RouteName extends "update" ? CommentsUpdate : CommentsCreate
        : RouteName extends "like"
        ? CommentsLike
        : never;
    };
    out: {
      [status in number]: {
        data: z.infer<typeof commentsResponseSchema> extends infer T
          ? T
          : never;
      }[status] extends infer Result
        ? Result
        : never;
    };
  }
>;
