from src.services.chat_service import send_message
from src.models.employee import Employee
from src.models.chats.py import Chat
from pydantic import BaseModel

class Chat_frontend(BaseModel):
    convid: str
    message: str


async def response_controller(payload,user) -> Dict[str, Any]:

convid= payload.convid
message= payload.message

    chat_record = await Chat.find(Chat.convid== convid).first_or_none()
      if not chat_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not retrive chat session"
        )

    # Send to semantic analyzer, await for a response if response is true then move to next(With hardcoded values) else send message to gen_ai_resp, return response
    response= await send_message(user,mssg,convid)
    return message