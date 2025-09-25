import { createLogger, transports, format } from "winston";
const { combine, timestamp, json, errors } = format;

// TODO: capture request ID's for better tracking + log files
export const genericLogger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [new transports.Console()],
});
