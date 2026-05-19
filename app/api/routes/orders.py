from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter()


@router.get("/", response_model=List[OrderResponse])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve current user's orders.
    """
    return order_service.get_orders_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create new order for current user.
    """
    return order_service.create_order(db, order_in=order_in, user_id=current_user.id)
