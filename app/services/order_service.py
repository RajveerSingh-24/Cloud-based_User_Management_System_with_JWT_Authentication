from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate


def get_orders_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Retrieve orders specific to a customer."""
    return (
        db.query(Order).filter(Order.user_id == user_id).offset(skip).limit(limit).all()
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
