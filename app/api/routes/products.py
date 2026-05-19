from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_seller_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse
from app.services import product_service

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve products. (Public)
    """
    return product_service.get_products(db, skip=skip, limit=limit)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_seller_user),
):
    """
    Create new product. (Seller or Admin only)
    """
    return product_service.create_product(
        db, product_in=product_in, owner_id=current_user.id
    )
