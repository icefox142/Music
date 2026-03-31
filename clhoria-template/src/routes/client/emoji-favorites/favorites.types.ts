import type { z } from "zod";
import type * as routes from "./favorites.routes";
import type { favoriteResponseSchema } from "./favorites.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Emoji favorite type / 表情收藏类型 */
export type Favorite = z.infer<typeof favoriteResponseSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Emoji favorite route handler type / 表情收藏路由 Handler 类型 */
export type FavoriteRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
