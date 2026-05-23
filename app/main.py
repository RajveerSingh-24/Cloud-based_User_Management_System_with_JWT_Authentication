from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError
from starlette.exceptions import HTTPException as StarletteHTTPException

import app.models
from app.api.routes import api_router
from app.core.config import settings
from app.core.exceptions import (global_exception_handler,
                                 http_exception_handler, jwt_exception_handler,
                                 validation_exception_handler)
from app.core.middleware import RequestLoggingMiddleware
from app.db.base import Base
from app.db.session import engine

# Create tables based on metadata (For production, use Alembic)
Base.metadata.create_all(bind=engine)

# Seed an admin user if not present
from app.db.session import SessionLocal
from app.services import user_service
from app.schemas.user import UserCreate

db = SessionLocal()
try:
    admin_user = user_service.get_user_by_email(db, email="admin@test.com")
    if not admin_user:
        user_in = UserCreate(email="admin@test.com", password="123", role="admin")
        user_service.create_user(db, user_in=user_in)
        print("Admin user seeded successfully!")
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# --- MIDDLEWARE ---
# 1. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Request Logging
app.add_middleware(RequestLoggingMiddleware)


# --- EXCEPTION HANDLERS ---
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(JWTError, jwt_exception_handler)


# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to the FastAPI Backend!",
        "version": settings.VERSION,
        "docs": "/docs",
    }
