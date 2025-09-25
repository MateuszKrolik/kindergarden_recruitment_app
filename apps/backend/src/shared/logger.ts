import { createLogger, transports, format } from "winston";
const { combine, timestamp, prettyPrint, errors } = format;

// TODO: capture request ID's for better tracking + log files
export const genericLogger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), prettyPrint()),
  transports: [new transports.Console()],
});
