from src.services.ai_services import analyze_response, generate_response
from src.models.employee import Employee
from src.models.chats import Chat, Message
import datetime
from ai_services import initialize as initi


counter=0

que=""
chatObj= None
flag=0

chatObj = initi()
que= generate_response("This is employee 123. He has factors in sorted order as: [rewards, leaves, performance ,activity].The first factor is affecting him most maybe then next and so on.Start talking to him about his first problem. If at any point you feel he isnt interested to talk about it move to next topic. Start your response greeting him. Also remember you are a company councellor. So act like one formal yet friendly. Also remember the factors have been decided from user and company data. So employee doesnt know there is something like the sorted list and he shouldnt know. So move topics swiftly when needed.",chatObj)
#chat_record.append for initaite
async def send_response(user:any, msg:str, convid:str):
    
    user_record= await Employee.find(Employee.emp_id == user['emp_id']).first_or_none()
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    #factor_in_sorted_order= user_record.factors_in_sorted_order
    
    dict_user= Message(sender="user", timestamp=datetime.datetime.now(), message=msg)  
    chat_record.messages.append(dict_user)
    que= generate_response(msg,chatObj)
    dict_bot= Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    chat_record.messages.append(dict_bot)
    chat_record.save()
    return que

    
    
    
        
    # if (counter < len(factor_in_sorted_order)):       
          
        
            
        
    #       if flag==0 and msg.lower() == "yes":
    #         counter = counter+1
    #         que = f"Alright. Then are you upset about ${factor_in_sorted_order[counter]}"
    #         #Append the mssg to chat_record.mssgs as sender, timestamp, mssg
    #         #chat_record.messages.append(dict_user)
    #         dict_bot= Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    #         chat_record.messages.append(dict_bot)
    #         chat_record.save() 
    #         flag=0 
    #         #return dictionary of qs is this and flag is this
    #         dict_reply= {"question": que, "flag": flag}
    #         return dict_reply
        
        
    #       if msg.lower() == "skip":
    #         counter= counter+1
    #         que = f"Alright. Then are you upset about ${factor_in_sorted_order[counter]}"            
    #         dict_bot= Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    #         chat_record.messages.append(dict_bot)
    #         chat_record.save() 
    #         flag=0 
    #         #return dictionary of qs is this and flag is this
    #         dict_reply= {"question": que, "flag": flag}
    #         return dict_reply          
               
            
        
    #       else:
    #         gen_ai_response= await generate_response(msg,chatObj)
    #         que = gen_ai_response
    #         dict_bot= Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    #         chat_record.messages.append(dict_bot)
    #         chat_record.save() 
    #         flag=1
    #         dict_reply= {"question": que, "flag": flag}
    #         return dict_reply
            
        

