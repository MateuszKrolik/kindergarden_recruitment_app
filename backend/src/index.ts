import "dotenv/config";
import express from "express";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { auth } from "./middleware/auth.ts";
import { PropertyManagementRepo } from "./modules/property-management/repo.ts";
import { IdentityRepo } from "./modules/identity/repo.ts";
import { IdentitySvc } from "./modules/identity/svc.ts";
import { PropertyManagementSvc } from "./modules/property-management/svc.ts";
import { initDB } from "./db/db.ts";
import { createRedisClients } from "./db/redis-client.ts";
import { PropertyManagementHandler } from "./modules/property-management/handler.ts";

const BASE_URL = "http://localhost";
const PORT = 3001;

const app = express();
const server = createServer(app);
const socketServer = new SocketServer(server, {
  cors: {
    origin: `${BASE_URL}:${PORT}`,
    methods: ["GET", "POST"],
  },
});
app.use(express.json());

// SERVICES
const pool = initDB();
const { redisClient } = await createRedisClients();
// IDENTITY MODULE
const identityRepo = new IdentityRepo(pool, redisClient);
const identitySvc = new IdentitySvc(identityRepo);
// PROPERTY MANAGEMENT MODULE
const propertyManagementRepo = new PropertyManagementRepo(pool, redisClient);
const propertyManagementSvc = new PropertyManagementSvc(
  propertyManagementRepo,
  identitySvc,
);
const propertyManagementHandler = new PropertyManagementHandler(
  propertyManagementSvc,
);
// ROUTES
app.get("/properties", auth, propertyManagementHandler.getAllProperties);

socketServer.on("connection", (socket) => {
  socket.on("ping", () => {
    console.log("pong");
    socket.emit("pong");
  });
});

server.listen(PORT, () => {
  console.log(`> Ready on ${BASE_URL}:${PORT}`);
});
