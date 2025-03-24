from src.services.ai_services import analyze_response, generate_response
from src.models.chats import Chat, Message
from fastapi import HTTPException, status, Query

counter=-1
async def send_response(user:any, que: str, msg:str, convid:str, chatObj):
    
    #Assume that previous chat history exists
    
        while (counter < len(user.factors_in_sorted_order)): 
        #Retrive Employee priority order list
          factor_in_sorted_order= user.factors_in_sorted_order
          sem_analyzer_response = await analyze_response(que, msg)
        
          if sem_analyzer_response:
            counter = counter+1
            return f"Are you upset about ${factor_in_sorted_order[counter]}"
          else:
            gen_ai_response= await generate_response(msg,chatObj)
            return gen_ai_response
          
async def get_chat(conv_id: str): # e.g. /chat?conv_id=123
    chat_record = await Chat.find(Chat.convid == conv_id).first_or_none()
    if not chat_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chat not found"
        )
    
    return {
        "chat": chat_record.messages,
    }
    

