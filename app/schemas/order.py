from pydantic import BaseModel, ConfigDict


class OrderBase(BaseModel):
    product_id: int


class OrderCreate(OrderBase):
    model_config = ConfigDict(json_schema_extra={"example": {"product_id": 1}})


class OrderResponse(OrderBase):
    id: int
    user_id: int
    status: str

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {"id": 1, "product_id": 1, "user_id": 2, "status": "pending"}
        },
    )
