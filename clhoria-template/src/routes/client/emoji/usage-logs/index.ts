import { createRouter } from "@/lib/core/create-app";

import * as handlers from "./usage-logs.handlers";
import * as routes from "./usage-logs.routes";

const usageLogsRouter = createRouter()
  .openapi(routes.record, handlers.record)
  .openapi(routes.batchRecord, handlers.batchRecord)
  .openapi(routes.getHistory, handlers.getHistory)
  .openapi(routes.getPopular, handlers.getPopular)
  .openapi(routes.getStats, handlers.getStats);

export default usageLogsRouter;
