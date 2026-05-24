from typing import Optional

from pydantic import BaseModel, ConfigDict


class CustomerInfo(BaseModel):
    id: int
    name: Optional[str] = None
    email: str

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    product_id: int


class OrderCreate(OrderBase):
    model_config = ConfigDict(json_schema_extra={"example": {"product_id": 1}})


class OrderStatusUpdate(BaseModel):
    status: str

    model_config = ConfigDict(json_schema_extra={"example": {"status": "shipped"}})


class OrderResponse(OrderBase):
    id: int
    user_id: int
    status: str
    user: Optional[CustomerInfo] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "product_id": 1,
                "user_id": 2,
                "status": "pending",
                "user": {"id": 2, "name": "Jane Doe", "email": "jane@example.com"},
            }
        },
    )
