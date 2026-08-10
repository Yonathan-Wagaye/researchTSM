import logging

from fastapi import Request
from fastapi.responses import JSONResponse

from app.exceptions.base import TSMException

logger = logging.getLogger(__name__)


async def tsm_expception_handler(request: Request, exc: TSMException) -> JSONResponse:
    logger.warning(
        "Handled application error: method=%s path=%s status=%s code=%s",
        request.method,
        request.url.path,
        exc.status_code,
        exc.error_code,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
            }
        },
    )


async def unexpected_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.error(
        "Unhandled exception: method=%s path=%s",
        request.method,
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "internal_error",
                "message": "An unexpected error occurred",
            }
        },
    )
