from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.user_service import create_user
from app.schemas.user import UserCreate

db = SessionLocal()
try:
    user_in = UserCreate(email="test2@test.com", password="123", role="admin")
    create_user(db, user_in)
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
