from src.models.employee import Employee
from fastapi import HTTPException, status

# ✅ Fetch User Details from Database
async def get_user_details(emp_id: str):
    user = await Employee.find(Employee.emp_id == emp_id).first_or_none()

    if user:
        return {
            
            "emp_id": user.emp_id,
            "emotion_score" : user.emotion_score,
            "vibe_score" : user.vibe_score,
            "factors_in_sorted_order" : user.factors_in_sorted_order,
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )














# import jwt
# from fastapi import HTTPException, status
# import os
# from dotenv import load_dotenv

# from src.models.employee import Employee

# load_dotenv()

# JWT_SECRET = os.getenv("JWT_SECRET")
# JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

# print("JWT_SECRET:", JWT_SECRET)  # Debugging
# print("JWT_ALGORITHM:", JWT_ALGORITHM)  # Debugging


# # ✅ Validate Token & Get User Data
# async def get_user_from_token(token: str):
#     print(token)
#     try:
#         decoded_payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
#         # emp_id = decoded_payload.get("emp_id")
#         emp_id = decoded_payload.get("emp_id")

#         if not emp_id:
#             raise HTTPException(status_code=401, detail="Invalid token")

#         user = await Employee.find(Employee.emp_id == emp_id).first_or_none()

#         if user:
#             return {
#                 "_id": user._id,
#                 "emp_id": user.emp_id
#                 # "name": user.name,
#                 # "email": user.email,
#                 # "role": user.role
#             }
#         else:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="User not found"
#             )

#     except jwt.ExpiredSignatureError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token expired"
#         )
#     except jwt.InvalidTokenError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="#Invalid token"
#         )
