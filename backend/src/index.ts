import "dotenv/config";
import express from "express";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { authN } from "./middleware/auth.ts";
import { PropertyManagementRepo } from "./modules/property-management/repo.ts";
import { IdentityRepo } from "./modules/identity/repo.ts";
import { IdentitySvc } from "./modules/identity/svc.ts";
import { PropertyManagementSvc } from "./modules/property-management/svc.ts";
import { initDB } from "./db/db.ts";
import { createRedisClients } from "./db/redis-client.ts";
import { PropertyManagementHandler } from "./modules/property-management/handler.ts";
import { PropertyManagementEventHandler } from "./modules/property-management/eventHandler.ts";
import { ReportingRepo, S3Repository } from "./modules/reporting/repo.ts";
import { ReportingSvc } from "./modules/reporting/svc.ts";
import { ComplianceRepo } from "./modules/compliance/repo.ts";
import { ComplianceSvc } from "./modules/compliance/svc.ts";
import { ComplianceHandler } from "./modules/compliance/handler.ts";

const BASE_URL = "http://localhost";
const BE_PORT = 3001;
const FE_PORT = 3000;

const app = express();
const server = createServer(app);
const socketServer = new SocketServer(server, {
  cors: {
    origin: `${BASE_URL}:${FE_PORT}`,
    methods: ["GET", "POST"],
  },
});
app.use(express.json());

const pool = initDB();
const { redisClient, redisSubscriber } = await createRedisClients();
// IDENTITY MODULE SERVICES
const identityRepo = new IdentityRepo(pool, redisClient);
const identitySvc = new IdentitySvc(identityRepo);
// REPORTING MODULE SERVICES
const s3Repo = new S3Repository();
const reportingRepo = new ReportingRepo(pool, redisClient);
const reportingSvc = new ReportingSvc(reportingRepo, s3Repo);
// PROPERTY MANAGEMENT MODULE SERVICES
const propertyManagementRepo = new PropertyManagementRepo(pool, redisClient);
const propertyManagementSvc = new PropertyManagementSvc(
  propertyManagementRepo,
  identitySvc,
);
new PropertyManagementEventHandler(
  propertyManagementSvc,
  reportingSvc,
  redisSubscriber,
  socketServer,
);
const propertyManagementHandler = new PropertyManagementHandler(
  propertyManagementSvc,
  authN,
);
app.use(propertyManagementHandler.router);
// COMPLIANCE MODULE SERVICES
const complianceRepo = new ComplianceRepo(pool, redisClient);
const complianceSvc = new ComplianceSvc(
  complianceRepo,
  redisClient,
  socketServer,
);
const complianceHandler = new ComplianceHandler(complianceSvc, authN);
app.use(complianceHandler.router);

socketServer.on("connection", (socket) => {
  socket.on("ping", () => {
    console.log("pong");
    socket.emit("pong");
  });
});

server.listen(BE_PORT, () => {
  console.log(`> Ready on ${BASE_URL}:${BE_PORT}`);
});
