import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("api_logger")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()

        # Process the request
        response = await call_next(request)

        process_time = time.time() - start_time
        logger.info(
            f"Method: {request.method} Path: {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Completed in: {process_time:.4f}s"
        )
        return response
