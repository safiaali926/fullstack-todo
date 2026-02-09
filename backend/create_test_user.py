"""Create a test user in the database"""
from sqlmodel import Session, create_engine
from src.core.config import settings
from src.models.user import User
import uuid

# Create engine
engine = create_engine(settings.DATABASE_URL)

# Test user ID from our JWT token
test_user_id = uuid.UUID("0a3dc7a2-c5ec-4666-93f6-36f92fa86f90")

# Create user
with Session(engine) as session:
    # Check if user already exists
    existing_user = session.get(User, test_user_id)
    if existing_user:
        print(f"User already exists: {existing_user.email}")
    else:
        user = User(
            id=test_user_id,
            email="test@example.com"
        )
        session.add(user)
        session.commit()
        print(f"Created test user: {user.email} (ID: {user.id})")
