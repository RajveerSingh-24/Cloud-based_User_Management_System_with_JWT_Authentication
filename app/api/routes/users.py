from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import (get_admin_user, get_current_active_user,
                                  get_seller_user)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.services import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile. (Authenticated users only)
    """
    return current_user


@router.get("/admin/dashboard", response_model=dict)
def admin_only_route(current_user: User = Depends(get_admin_user)):
    """
    Admin only dashboard route.
    """
    return {"message": f"Welcome Admin {current_user.email}", "role": current_user.role}


@router.get("/seller/dashboard", response_model=dict)
def seller_only_route(current_user: User = Depends(get_seller_user)):
    """
    Seller and Admin dashboard route.
    """
    return {
        "message": f"Welcome Seller {current_user.email}",
        "role": current_user.role,
    }


@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Retrieve all users. (Admin only)
    """
    return user_service.get_users(db, skip=skip, limit=limit)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Delete a user. (Admin only)
    """
    user_service.delete_user(db, user_id=user_id)
    return None
