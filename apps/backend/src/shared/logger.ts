import { createLogger, transports, format } from "winston";
const { combine, timestamp, prettyPrint, errors, json } = format;

// TODO: capture request ID's for better tracking + log files
export const genericLogger = createLogger({
  level: process.env.LOG_LEVEL || "http",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    errors({ stack: true }),
    process.env.NODE_ENV === "production" ? json() : prettyPrint(),
  ),
  transports: [new transports.Console()],
});
