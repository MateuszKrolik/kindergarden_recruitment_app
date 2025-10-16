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
from src.modules.property_management.handler import PropertyManagementHandler
from src.modules.property_management.repo import PropertyManagementRepo
from src.modules.property_management.svc import PropertyManagementSvc
from src.modules.reporting.handler import ReportingHandler
from src.modules.reporting.repo import ReportingRepo
from src.modules.reporting.s3 import S3Repository
from src.modules.reporting.svc import ReportingSvc
from src.shared.middlewares.auth import auth_middleware
import uvicorn


async def main():
    app = FastAPI()

    pool = await create_pool(
        os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/auth")
    )

    # IDENTITY
    identity_repo = IdentityRepo(pool=pool)
    identity_svc = IdentitySvc(repo=identity_repo)
    identity_handler = IdentityHandler(
        svc=identity_svc, auth_middleware=auth_middleware
    )
    app.include_router(identity_handler.router, tags=["identity"])

    # PROPERTY MANAGEMENT
    property_repo = PropertyManagementRepo(pool=pool)
    property_svc = PropertyManagementSvc(
        repo=property_repo, identity_client=identity_svc
    )
    property_handler = PropertyManagementHandler(
        svc=property_svc, auth_middleware=auth_middleware
    )
    app.include_router(property_handler.router, tags=["property"])

    # REPORTING
    s3_repo = S3Repository()
    reporting_repo = ReportingRepo(pool=pool)
    reporting_svc = ReportingSvc(repo=reporting_repo, s3_repo=s3_repo)
    reporting_handler = ReportingHandler(
        svc=reporting_svc, auth_middleware=auth_middleware
    )
    app.include_router(reporting_handler.router, tags=["reporting"])

    # COMPLIANCE
    compliance_repo = ComplianceRepo(pool=pool)
    compliance_svc = ComplianceSvc(repo=compliance_repo, identity_client=identity_svc)
    compliance_handler = ComplianceHandler(
        svc=compliance_svc,
        auth_middleware=auth_middleware,
    )
    app.include_router(compliance_handler.router, tags=["compliance"])

    config = uvicorn.Config(app, host="0.0.0.0", port=3001)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
