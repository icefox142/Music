import { jwt } from "hono/jwt";

import env from "@/env";
import { defineMiddleware } from "@/lib/core/define-config";
import { authorize } from "@/middlewares/authorize";
import { operationLog } from "@/middlewares/operation-log";

export default defineMiddleware([
  // TEMP: 临时禁用JWT认证以便前端开发调试
  // {
  //   handler: jwt({ secret: env.ADMIN_JWT_SECRET, alg: "HS256" }),
  //   except: c => ["/auth/login", "/auth/refresh", "/auth/challenge", "/auth/redeem"]
  //     .some(p => c.req.path.endsWith(p)),
  // },
  // 注意：由于禁用了JWT，authorize和operationLog可能会因为缺少用户信息而无法正常工作
  // 如需完整功能，请恢复JWT中间件
  // {
  //   handler: authorize,
  //   except: c => c.req.path.includes("/auth"),
  // },
  // {
  //   handler: operationLog(),
  //   except: c => c.req.path.includes("/auth"),
  // },
]);
