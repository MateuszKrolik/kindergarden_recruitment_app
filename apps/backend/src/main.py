import logging
import asyncio
import os
from asyncpg import create_pool
from fastapi import FastAPI
from src.modules.compliance.handler import ComplianceHandler
from src.modules.compliance.repo import ComplianceRepo
from src.modules.compliance.svc import ComplianceSvc
from src.modules.identity.handler import IdentityHandler
from src.modules.identity.repo import IdentityRepo
from src.modules.identity.svc import IdentitySvc
from src.modules.property_management.event_handler import PropertyManagementEventHandler
from src.modules.property_management.handler import PropertyManagementHandler
from src.modules.property_management.repo import PropertyManagementRepo
from src.modules.property_management.svc import PropertyManagementSvc
from src.modules.reporting.handler import ReportingHandler
from src.modules.reporting.repo import ReportingRepo
from src.modules.reporting.s3 import S3Repository
from src.modules.reporting.svc import ReportingSvc
from src.shared.middlewares.auth import auth_middleware
import uvicorn
import redis.asyncio as redis
import socketio


async def main():
    app = FastAPI()

    sio = socketio.AsyncServer(
        async_mode="asgi",
        cors_allowed_origins=os.getenv("FRONTEND_URL", "http://localhost:3000"),
    )

    socket_app = socketio.ASGIApp(sio, app)

    pool = await create_pool(
        os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/auth")
    )

    redis_client = redis.Redis(
        host="localhost",
        port=6379,
        db=0,
        decode_responses=True,  # get strings instead of bytes
    )

    # IDENTITY
    identity_repo = IdentityRepo(pool=pool)
    identity_svc = IdentitySvc(repo=identity_repo)
    identity_handler = IdentityHandler(
        svc=identity_svc, auth_middleware=auth_middleware
    )
    app.include_router(identity_handler.router, tags=["identity"])

    # REPORTING
    s3_repo = S3Repository()
    reporting_repo = ReportingRepo(pool=pool)
    reporting_svc = ReportingSvc(repo=reporting_repo, s3_repo=s3_repo)
    reporting_handler = ReportingHandler(
        svc=reporting_svc, auth_middleware=auth_middleware
    )
    app.include_router(reporting_handler.router, tags=["reporting"])

    # PROPERTY MANAGEMENT
    property_repo = PropertyManagementRepo(pool=pool)
    property_svc = PropertyManagementSvc(
        repo=property_repo, identity_client=identity_svc
    )
    property_event_handler = PropertyManagementEventHandler(
        svc=property_svc,
        reporting_client=reporting_svc,
        redis_client=redis_client,
        socket_server=sio,
    )
    await property_event_handler.initialize()
    property_handler = PropertyManagementHandler(
        svc=property_svc, auth_middleware=auth_middleware
    )
    app.include_router(property_handler.router, tags=["property"])

    # COMPLIANCE
    compliance_repo = ComplianceRepo(pool=pool)
    compliance_svc = ComplianceSvc(
        repo=compliance_repo, identity_client=identity_svc, redis_client=redis_client
    )
    compliance_handler = ComplianceHandler(
        svc=compliance_svc,
        auth_middleware=auth_middleware,
    )
    app.include_router(compliance_handler.router, tags=["compliance"])

    config = uvicorn.Config(socket_app, host="0.0.0.0", port=3001, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format="%(levelname)s - %(name)s - %(message)s"
    )
    asyncio.run(main())
