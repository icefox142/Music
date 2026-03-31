import type { z } from "zod";
import type * as routes from "./songs.routes";
import type { songResponseSchema } from "./songs.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Song type / 歌曲类型 */
export type Song = z.infer<typeof songResponseSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Song route handler type / 歌曲路由 Handler 类型 */
export type SongRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
