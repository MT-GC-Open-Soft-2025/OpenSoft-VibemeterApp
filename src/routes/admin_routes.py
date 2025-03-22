from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Any, Dict
from src.controllers.admin_controller import (
    get_all_employees,
    get_employee_detail,
    get_employee_conversation
)

security = HTTPBearer()
admin_router = APIRouter()

@admin_router.get("/test")
def test_route() -> Dict[str, Any]:
    return {"message": "Admin Route is Active"}

@admin_router.get("/get_details")
async def employee_data_route(
    token: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    return await get_all_employees()



@admin_router.get("/get_detail/{employee_id}")
async def employee_data_detail_route(
    employee_id:str, token: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    print(employee_id)
    if not employee_id:
        raise HTTPException(status_code=404, detail="Employee id not found")
    return await get_employee_detail(employee_id)

# @admin_router.get("/get_conversation/{item_id}")
# async def employee_convo_route(
#     item_id: str, token: HTTPAuthorizationCredentials = Depends(security)
# ) -> Dict[str, Any]:
    # return await get_employee_conversation(item_id)
