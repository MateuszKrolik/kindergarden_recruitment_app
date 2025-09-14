import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { initSocketServer } from "./socketServer.ts";
import { PropertyManagementEventHandler } from "./data-access-layer/modules/property-management/eventHandler.ts";
import propertyManagementSvc from "./data-access-layer/modules/property-management/svc.ts";
import { redisSubscriber } from "./data-access-layer/db/redis-client.ts";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const socketServer = initSocketServer(httpServer);

  new PropertyManagementEventHandler(
    propertyManagementSvc,
    redisSubscriber,
    socketServer,
  );

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
