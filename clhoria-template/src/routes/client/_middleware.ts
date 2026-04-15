import { jwt } from "hono/jwt";

import env from "@/env";
import { defineMiddleware } from "@/lib/core/define-config";

export default defineMiddleware([
  // TEMP: 临时禁用JWT认证以便前端开发调试
  // jwt({ secret: env.CLIENT_JWT_SECRET, alg: "HS256" }),
]);
