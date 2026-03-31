import type { z } from "zod";
import type * as routes from "./emojis.routes";
import type { emojiResponseSchema } from "./emojis.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Emoji type / 表情包类型 */
export type Emoji = z.infer<typeof emojiResponseSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Emoji route handler type / 表情包路由 Handler 类型 */
export type EmojiRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
