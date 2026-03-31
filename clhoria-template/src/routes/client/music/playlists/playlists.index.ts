import { createRouter } from "@/lib/core/create-app";
import * as handlers from "./playlists.handlers";
import * as routes from "./playlists.routes";

export default createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.mine, handlers.mine)
  .openapi(routes.getPublic, handlers.getPublic)
  .openapi(routes.create, handlers.create)
  .openapi(routes.get, handlers.get)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove);
