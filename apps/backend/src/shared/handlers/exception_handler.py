from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

from src.shared.exceptions.domain import DomainException
from src.shared.types.response import HTTPError


async def domain_exception_handler(request: Request, exc: DomainException):
    if exc.code < 500:
        logging.error(exc)
    else:
        # print stack traces only for 500+ domain codes
        logging.error("Domain exception occurred", exc_info=exc)
    return JSONResponse(
        status_code=exc.code,
        content=HTTPError(code=exc.code, message=exc.message).model_dump(),
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    logging.error("HTTP exception occurred", exc_info=exc)
    return JSONResponse(
        status_code=exc.status_code,
        content=HTTPError(code=exc.status_code, message=str(exc.detail)).model_dump(),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error("Validation exception occurred", exc_info=exc)
    return JSONResponse(
        status_code=422,
        content=HTTPError(
            code=422,
            message=f"Validation failed:\n{exc.errors()}",
        ).model_dump(),
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.error("Unhandled exception occurred", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=HTTPError(
            code=500, message=f"Unhandled exception occurred:\n{str(exc)}"
        ).model_dump(),
    )
