# print("test.py is running...")

# # import jwt
# # import os
# # from dotenv import load_dotenv


# import os
# from dotenv import load_dotenv

# load_dotenv()

# print("JWT_SECRET:", os.getenv("JWT_SECRET"))  # Check if .env variables are loading
# print("JWT_ALGORITHM:", os.getenv("JWT_ALGORITHM"))


# # load_dotenv()

# # JWT_SECRET = os.getenv("JWT_SECRET")
# # JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

# # token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBfaWQiOiJTYWFrc2hpIiwiaWF0IjoxNzQyNjU4OTgzLCJleHAiOjE3NDUyNTA5ODN9.KMc-ycczqd2gcQZ1YRvrr2TyLCXk2g_HGLyCaGOmXao"  # Replace this with the token you are using in Postman

# # try:
# #     decoded_payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
# #     print("Decoded Token:", decoded_payload)
# # except jwt.ExpiredSignatureError:
# #     print("Error: Token has expired")
# # except jwt.InvalidTokenError:
# #     print("Error: Invalid token")
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

token = "your_actual_token_here"  # Replace this with the token you are using in Postman

try:
    decoded_payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    print("Decoded Token:", decoded_payload)
except jwt.ExpiredSignatureError:
    print("Error: Token has expired")
except jwt.InvalidTokenError:
    print("Error: Invalid token")
