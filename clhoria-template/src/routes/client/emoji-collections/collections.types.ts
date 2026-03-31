import type { z } from "zod";
import type * as routes from "./collections.routes";
import type { collectionResponseSchema } from "./collections.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Emoji collection type / 表情包集合类型 */
export type Collection = z.infer<typeof collectionResponseSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Emoji collection route handler type / 表情包集合路由 Handler 类型 */
export type CollectionRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
