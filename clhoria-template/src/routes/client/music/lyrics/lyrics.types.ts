import type { RouteConfig } from "@hono/zod-openapi";
import { LyricsQuery, LyricsCreate, LyricsUpdate } from "./lyrics.schema";
import { lyricsResponseSchema, lyricsListResponseSchema } from "./lyrics.schema";

export type LyricsRouteHandlerType<RouteName extends string> = RouteConfig<
  Record<never, never>,
  {
    in: {
      param: RouteName extends "get" | "update" | "remove"
        ? { id: string }
        : never;
      query: RouteName extends "list"
        ? LyricsQuery
        : never;
      json: RouteName extends "create" | "update"
        ? LyricsCreate extends Record<string, never> ? never : RouteName extends "update" ? LyricsUpdate : never
        : never;
    };
    out: {
      [status in number]: {
        data: z.infer<typeof lyricsResponseSchema> extends infer T
          ? T
          : never;
      }[status] extends infer Result
        ? Result
        : never;
    };
  }
>;
