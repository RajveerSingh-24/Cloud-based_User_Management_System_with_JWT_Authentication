from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate


def get_products(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve multiple products from the database."""
    return db.query(Product).offset(skip).limit(limit).all()


def create_product(db: Session, product_in: ProductCreate, owner_id: int):
    """Create a new product linked to a seller/admin owner."""
    product = Product(
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        owner_id=owner_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
