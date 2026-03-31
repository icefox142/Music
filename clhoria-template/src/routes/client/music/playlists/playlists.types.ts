import type { z } from "zod";
import type * as routes from "./playlists.routes";
import type { playlistResponseSchema } from "./playlists.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Playlist type / 歌单类型 */
export type Playlist = z.infer<typeof playlistResponseSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Playlist route handler type / 歌单路由 Handler 类型 */
export type PlaylistRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
