import { createRouter } from "@/lib/core/create-app";

import * as handlers from "./collections.handlers";
import * as routes from "./collections.routes";

const collectionRouter = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.get, handlers.get)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.incrementDownload, handlers.incrementDownload);

export default collectionRouter;
