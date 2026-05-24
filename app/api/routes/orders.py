from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
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
    Retrieve orders.
    - Customers get their own orders.
    - Sellers get orders placed for their products.
    - Admins get all orders.
    """
    if current_user.role == "admin":
        return order_service.get_all_orders(db, skip=skip, limit=limit)
    if current_user.role == "seller":
        return order_service.get_orders_by_seller(db, seller_id=current_user.id, skip=skip, limit=limit)
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


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update the status of an order (shipped, completed, etc.).
    Sellers can only update orders for their own products.
    Admins can update any order.
    """
    return order_service.update_order_status(
        db,
        order_id=order_id,
        new_status=status_update.status,
        current_user_id=current_user.id,
        role=current_user.role,
    )
