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
import { ReportingHandler } from "./modules/reporting/handler.ts";
import { genericLogger } from "./shared/logger.ts";
import { morganMiddleware } from "./middleware/log.ts";
import multer from "multer";

const FRONTEND_URL = "http://localhost:3000";
const BE_PORT = 3001;

const app = express();
const server = createServer(app);
const socketServer = new SocketServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});
app.use(express.json());
app.use(morganMiddleware);

const pool = initDB();
const { redisClient, redisSubscriber } = await createRedisClients();
// IDENTITY
const identityRepo = new IdentityRepo(pool, redisClient, genericLogger);
const identitySvc = new IdentitySvc(identityRepo);
// REPORTING
const s3Repo = new S3Repository(genericLogger);
const reportingRepo = new ReportingRepo(pool, redisClient, genericLogger);
const reportingSvc = new ReportingSvc(reportingRepo, s3Repo);
const reportingHandler = new ReportingHandler(
  reportingSvc,
  authN,
  genericLogger,
  multer({ storage: multer.memoryStorage() }),
);
app.use(reportingHandler.router);
// PROPERTY MANAGEMENT
const propertyManagementRepo = new PropertyManagementRepo(
  pool,
  redisClient,
  genericLogger,
);
const propertyManagementSvc = new PropertyManagementSvc(
  propertyManagementRepo,
  identitySvc,
);
new PropertyManagementEventHandler(
  propertyManagementSvc,
  reportingSvc,
  redisSubscriber,
  socketServer,
  genericLogger,
);
const propertyManagementHandler = new PropertyManagementHandler(
  propertyManagementSvc,
  authN,
  genericLogger,
);
app.use(propertyManagementHandler.router);
// COMPLIANCE
const complianceRepo = new ComplianceRepo(pool, redisClient, genericLogger);
const complianceSvc = new ComplianceSvc(
  complianceRepo,
  redisClient,
  socketServer,
  genericLogger,
);
const complianceHandler = new ComplianceHandler(
  complianceSvc,
  authN,
  genericLogger,
);
app.use(complianceHandler.router);

socketServer.on("connection", (socket) => {
  socket.on("ping", () => {
    console.log("pong");
    socket.emit("pong");
  });
});

server.listen(BE_PORT, () => {
  console.log(`> Ready on: http://localhost:${BE_PORT}`);
});
