import { createRouter } from "@/lib/core/create-app";
import * as handlers from "./lyrics.handlers";
import * as routes from "./lyrics.routes";

export default createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.get, handlers.get)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove);
