from typing import Callable
from uuid import UUID
from fastapi import APIRouter, Response, Depends, UploadFile, File
from fastapi.responses import JSONResponse

from src.modules.reporting.svc import IReportingSvc
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import ChildDocument, ParentDocument
from src.shared.types.response import AuthMiddlewareResponse, HTTPError


class ReportingHandler:
    def __init__(
        self,
        svc: IReportingSvc,
        auth_middleware: Callable[..., AuthMiddlewareResponse],
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/parents/{parent_id}/documents/{document_type}",
            responses={
                200: {"model": ParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_parent_document_by_type(
            parent_id: UUID,
            document_type,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ParentDocument:
            if document_type not in DOCUMENT_TYPE:
                return JSONResponse(
                    status_code=400,
                    content=HTTPError(
                        code=400,
                        message="Invalid document type!",
                    ).dict(),
                )
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_parent_document_by_type(
                user_id=parent_id, document_type=document_type
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/parent-documents/{doc_id}",
            responses={
                200: {"model": str},
                "default": {"model": HTTPError},
            },
        )
        async def get_parent_document_url_by_document_id(
            doc_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> str:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_parent_document_url_by_document_id(
                doc_id=doc_id
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/documents/{file_path:path}",
            responses={
                200: {"model": str},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_url_by_file_path(
            file_path: str,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> str:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_document_url_by_file_path(path=file_path)
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.post(
            "/parents/{parent_id}/documents/{document_type}",
            responses={
                201: {"model": ParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def save_parent_document(
            parent_id: UUID,
            document_type: DOCUMENT_TYPE,
            response: Response,
            file: UploadFile = File(...),
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ParentDocument:
            if document_type not in DOCUMENT_TYPE:
                return JSONResponse(
                    status_code=400,
                    content=HTTPError(
                        code=400,
                        message="Invalid document type!",
                    ).dict(),
                )
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.save_parent_document(
                user_id=parent_id, document_type=document_type, file=file
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 201
            assert data is not None
            return data

        @self.router.get(
            "/children/{child_id}/documents/{document_type}",
            responses={
                200: {"model": ChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_child_document_by_type(
            child_id: UUID,
            document_type: CHILD_DOCUMENT_TYPE,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ChildDocument:
            if document_type not in CHILD_DOCUMENT_TYPE:
                return JSONResponse(
                    status_code=400,
                    content=HTTPError(
                        code=400,
                        message="Invalid document type!",
                    ).dict(),
                )
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_child_document_by_type(
                child_id=child_id, document_type=document_type
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.post(
            "/children/{child_id}/documents/{document_type}",
            responses={
                201: {"model": ChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def save_child_document(
            child_id: UUID,
            document_type: CHILD_DOCUMENT_TYPE,
            response: Response,
            file: UploadFile = File(...),
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ChildDocument:
            if document_type not in CHILD_DOCUMENT_TYPE:
                return JSONResponse(
                    status_code=400,
                    content=HTTPError(
                        code=400,
                        message="Invalid document type!",
                    ).dict(),
                )
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.save_child_document(
                child_id=child_id, document_type=document_type, file=file
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 201
            assert data is not None
            return data

        @self.router.get(
            "/children-documents/{doc_id}",
            responses={
                200: {"model": str},
                "default": {"model": HTTPError},
            },
        )
        async def get_child_document_url_by_document_id(
            doc_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> str:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_child_document_url_by_document_id(
                doc_id=doc_id
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data
