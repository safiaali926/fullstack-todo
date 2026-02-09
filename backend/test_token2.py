"""Generate a second test JWT token for user isolation testing"""
import jwt
from datetime import datetime, timedelta
import uuid

# Use the same secret from .env
SECRET = "change-this-to-match-better-auth-secret"

# Create a different test user ID
test_user_id_2 = str(uuid.uuid4())
print(f"Test User 2 ID: {test_user_id_2}")

# Create JWT payload for second user
payload = {
    "id": test_user_id_2,
    "email": "test2@example.com",
    "exp": datetime.utcnow() + timedelta(hours=24)
}

# Generate token
token = jwt.encode(payload, SECRET, algorithm="HS256")
print(f"\nJWT Token for User 2:\n{token}")
print(f"\nAuthorization Header:\nBearer {token}")
