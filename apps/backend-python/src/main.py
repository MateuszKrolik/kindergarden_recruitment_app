import asyncio
import os
from asyncpg import create_pool
from fastapi import FastAPI
from src.modules.property_management.handler import PropertyManagementHandler
from src.modules.property_management.repo import PropertyManagementRepo
from src.modules.property_management.svc import PropertyManagementSvc
from src.shared.middlewares.auth import auth_middleware
import uvicorn


async def main():
    app = FastAPI()

    pool = await create_pool(
        os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/auth")
    )

    # PROPERTY MANAGEMENT
    property_repo = PropertyManagementRepo(pool=pool)
    property_svc = PropertyManagementSvc(repo=property_repo)
    property_handler = PropertyManagementHandler(
        svc=property_svc, auth_middleware=auth_middleware
    )
    app.include_router(property_handler.router)
    # TODO: rest of modules

    config = uvicorn.Config(app, host="0.0.0.0", port=3001)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
