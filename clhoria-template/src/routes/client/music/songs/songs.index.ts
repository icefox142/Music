import { createRouter } from "@/lib/core/create-app";
import * as handlers from "./songs.handlers";
import * as routes from "./songs.routes";

export default createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.get, handlers.get)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove);
