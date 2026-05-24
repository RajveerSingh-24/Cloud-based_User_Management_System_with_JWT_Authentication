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
        image_url=product_in.image_url,
        category=product_in.category,
        owner_id=owner_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product_by_id(db: Session, product_id: int):
    """Retrieve a single product by ID."""
    return db.query(Product).filter(Product.id == product_id).first()


def delete_product(db: Session, product_id: int, owner_id: int, user_role: str):
    """Delete a product. Sellers can only delete their own; Admins can delete any."""
    query = db.query(Product).filter(Product.id == product_id)
    if user_role != "admin":
        query = query.filter(Product.owner_id == owner_id)
    
    product = query.first()
    if product:
        db.delete(product)
        db.commit()
        return True
    return False
