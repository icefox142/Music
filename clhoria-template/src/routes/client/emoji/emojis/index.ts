import { createRouter } from "@/lib/core/create-app";

import * as handlers from "./emojis.handlers";
import * as routes from "./emojis.routes";

const emojiRouter = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.get, handlers.get)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove);

export default emojiRouter;
