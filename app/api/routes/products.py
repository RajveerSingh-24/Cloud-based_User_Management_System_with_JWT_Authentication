from typing import List

from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
import uuid

from app.api.dependencies import get_seller_user, get_current_user
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


@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_seller_user),
):
    """
    Upload an image for a product. Returns the URL. (Seller or Admin only)
    """
    # Create unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = f"uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"/uploads/{filename}"}


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get a single product by ID.
    """
    product = product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a product. Sellers can delete their own; Admins can delete any.
    """
    success = product_service.delete_product(
        db, product_id=product_id, owner_id=current_user.id, user_role=current_user.role
    )
    if not success:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions or product not found"
        )
