from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """Retrieve a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    """Hash password and create a new user."""
    hashed_password = get_password_hash(user_in.password)
    db_obj = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password,
        role=user_in.role or "customer",
        is_active=True,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve multiple users from the database."""
    return db.query(User).offset(skip).limit(limit).all()


def delete_user(db: Session, user_id: int) -> None:
    """Delete a user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    db.delete(user)
    db.commit()
