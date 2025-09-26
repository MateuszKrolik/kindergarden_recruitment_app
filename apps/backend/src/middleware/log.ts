import morgan from "morgan";
import { genericLogger } from "../shared/logger.ts";

export const morganMiddleware = morgan(
  function(tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) ?? "0"),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(
        tokens["response-time"](req, res) ?? "0",
      ),
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        genericLogger.http(`incoming-request`, data);
      },
    },
  },
);
