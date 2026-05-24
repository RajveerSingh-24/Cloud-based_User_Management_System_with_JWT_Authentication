from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate


def get_orders_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Retrieve orders specific to a customer, with user info eagerly loaded."""
    return (
        db.query(Order)
        .options(joinedload(Order.user))
        .filter(Order.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_orders_by_seller(db: Session, seller_id: int, skip: int = 0, limit: int = 100):
    """Retrieve orders for products owned by a seller, with user info eagerly loaded."""
    return (
        db.query(Order)
        .options(joinedload(Order.user))
        .join(Product, Order.product_id == Product.id)
        .filter(Product.owner_id == seller_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_order(db: Session, order_in: OrderCreate, user_id: int):
    """Create a new order, verifying product existence."""
    product = db.query(Product).filter(Product.id == order_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    order = Order(user_id=user_id, product_id=order_in.product_id, status="pending")
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all orders in the system (Admin only), with user info eagerly loaded."""
    return (
        db.query(Order)
        .options(joinedload(Order.user))
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_order_status(db: Session, order_id: int, new_status: str, current_user_id: int, role: str):
    """Update the status of an order. Sellers can only update orders for their own products."""
    allowed_statuses = ["pending", "shipped", "completed", "cancelled"]
    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(allowed_statuses)}"
        )

    query = db.query(Order).filter(Order.id == order_id)

    if role == "seller":
        # Seller can only update orders for their own products
        query = query.join(Product, Order.product_id == Product.id).filter(
            Product.owner_id == current_user_id
        )

    order = query.first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or you do not have permission to update it."
        )

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
