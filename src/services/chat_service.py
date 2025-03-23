import time, os
from fastapi import HTTPException,status
from dotenv import load_dotenv
from src.services.ai_services import analyze_response, generate_response



counter=-1
async def send_response(user:str, msg:str, convid:str)
    
    #Assume that previous chat history exists
    
        while (counter < len(user.factors_in_sorted_order)): 
        #Retrive Employee priority order list
          factor_in_sorted_order= user.factors_in_sorted_order
          sem_analyzer_response = await analyze_response(msg: str)
        
            if sem_analyzer_response:
              counter = counter+1
              return "Are you upset about ${factor_in_sorted_order[counter]}"
    
        
            else 
               gen_ai_response= await generate_response(msg)
               return gen_ai_response

