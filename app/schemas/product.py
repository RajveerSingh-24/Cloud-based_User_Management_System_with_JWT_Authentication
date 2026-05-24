from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    category: Optional[str] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Wireless Mouse",
                "description": "Ergonomic wireless mouse with 2.4GHz receiver",
                "price": 29.99,
                "category": "Accessories",
                "image_url": "/uploads/mouse.jpg"
            }
        }
    )


class ProductResponse(ProductBase):
    id: int
    owner_id: int

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Wireless Mouse",
                "description": "Ergonomic wireless mouse with 2.4GHz receiver",
                "price": 29.99,
                "category": "Accessories",
                "image_url": "/uploads/mouse.jpg",
                "owner_id": 1,
            }
        },
    )
