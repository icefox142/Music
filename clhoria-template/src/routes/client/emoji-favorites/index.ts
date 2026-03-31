import { createRouter } from "@/lib/core/create-app";

import * as handlers from "./favorites.handlers";
import * as routes from "./favorites.routes";

const favoriteRouter = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.add, handlers.add)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.check, handlers.check);

export default favoriteRouter;
