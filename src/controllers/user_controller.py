from typing import Dict, Any
from src.services.user_service import get_user_details

# ✅ Controller to Fetch User Details using Authenticated User Data
async def user_controller(user: Dict[str, Any]) -> Dict[str, Any]:
    return await get_user_details(user["emp_id"])








# from fastapi import HTTPException, status, Header, Depends
# from typing import Dict, Any, Optional

# # from src.services.user_service import get_user_from_token
# from src.services.user_service import get_user_from_token


# # ✅ Controller to Extract and Verify Token, then Fetch User Details
# async def user_controller(authorization: str = Header(None)) -> Dict[str, Any]:
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Missing or invalid Authorization header"
#         )
#     # print("authorisation", authorization)
    

#     token = authorization.split(" ")[1]  # Extract token
#     # print("token", token)

#     user = await get_user_from_token(token)

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired token"
#         )

#     return user
