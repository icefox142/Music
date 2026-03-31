import type { z } from "zod";
import type * as routes from "./playlist-songs.routes";
import type { playlistSongWithDetailSchema } from "./playlist-songs.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Playlist song type / 歌单歌曲类型 */
export type PlaylistSong = z.infer<typeof playlistSongWithDetailSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Playlist song route handler type / 歌单歌曲路由 Handler 类型 */
export type PlaylistSongRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
