"""Generate a test JWT token for API testing"""
import jwt
from datetime import datetime, timedelta
import uuid

# Use the same secret from .env
SECRET = "change-this-to-match-better-auth-secret"

# Create a test user ID
test_user_id = str(uuid.uuid4())
print(f"Test User ID: {test_user_id}")

# Create JWT payload matching Better Auth structure
payload = {
    "id": test_user_id,
    "email": "test@example.com",
    "exp": datetime.utcnow() + timedelta(hours=24)
}

# Generate token
token = jwt.encode(payload, SECRET, algorithm="HS256")
print(f"\nJWT Token:\n{token}")
print(f"\nAuthorization Header:\nBearer {token}")
