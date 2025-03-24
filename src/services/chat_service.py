from src.services.ai_services import analyze_response, generate_response


counter=-1
factor_in_sorted_order= user.factors_in_sorted_order
que = f"Are you upset about ${factor_in_sorted_order[counter+1]}"

async def send_response(user:any, msg:str, convid:str, chatObj):
    
    #Assume that previous chat history exists
    
        while (counter < len(user.factors_in_sorted_order)): 
        #Retrive Employee priority order list
          
          sem_analyzer_response = await analyze_response(que, msg)
        
          if sem_analyzer_response:
            counter = counter+1
            que = f"Are you upset about ${factor_in_sorted_order[counter]}"
            return que
          else:
            gen_ai_response= await generate_response(msg,chatObj)
            que = gen_ai_response
            return gen_ai_response

