
from fastapi import HTTPException, status
from typing import Dict, Any


from ai_services import generate_response as generate_service
from ai_services import initialize as initi

def chat_controller(user_input,chatObj):
    result = generate_service(user_input,chatObj)
    # print(result)
    return result

if __name__=="__main__":
    chatObj = initi()

    print(chat_controller("Hi I am feeling sad, very very sad, help meeeee!",chatObj))
    res = chat_controller("Hi I am feeling happy",chatObj)

    print(res)
    print("PRINTING CHAT---------------------")
    
    print("-------------START----------------")
    for message in chatObj.get_history():
        print(message.parts[0].text)

