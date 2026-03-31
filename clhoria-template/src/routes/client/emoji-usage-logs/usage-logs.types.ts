import type { z } from "zod";
import type * as routes from "./usage-logs.routes";
import type { usageStatsSchema, popularEmojisSchema } from "./usage-logs.schema";
import type { AppRouteHandler } from "@/types/lib";

/** Usage statistics type / 使用统计类型 */
export type UsageStats = z.infer<typeof usageStatsSchema>;

/** Popular emojis type / 热门表情类型 */
export type PopularEmojis = z.infer<typeof popularEmojisSchema>;

/** Route type mapping / 路由类型映射 */
type RouteTypes = {
  [K in keyof typeof routes]: typeof routes[K];
};

/** Usage logs route handler type / 使用记录路由 Handler 类型 */
export type UsageLogsRouteHandlerType<T extends keyof RouteTypes> = AppRouteHandler<RouteTypes[T]>;
