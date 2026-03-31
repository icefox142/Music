import { createRouter } from "@/lib/core/create-app";
import * as handlers from "./playlist-songs.handlers";
import * as routes from "./playlist-songs.routes";

export default createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.add, handlers.add)
  .openapi(routes.batchAdd, handlers.batchAdd)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.batchRemove, handlers.batchRemove)
  .openapi(routes.update, handlers.update)
  .openapi(routes.batchUpdate, handlers.batchUpdate);
