
from fastapi import HTTPException, status
from typing import Dict, Any


from ai_services import generate_response as generate_service
from ai_services import initialize as initi

def chat_controller(user_input,chatObj):
    result = generate_service(user_input,chatObj)
    return result

if __name__=="__main__":
    chatObj = initi()

    print(chat_controller("Hi I am feeling sad, very very sad, help meeeee!",chatObj))
    res = chat_controller("Hi I am feeling happy",chatObj)

    print(res)
    print("---------PRINTING CHAT-------------")
    
    print("-------------START----------------")
    # print(chat_controller("Summarize our discussion from my perspective, focusing on key points, decisions, and unresolved questions.",chatObj))
    # print("The type of chatObj.get_history() is ",type(chatObj.get_history()))
    # for message in chatObj.get_history():
    #     print(message.parts[0].text)
    print(chatObj.get_history())

# For chat history
# Whenever user clicks on end chat, we will store whole chat object in database which is basically a list only, then we can retrieve info from it as required
# at the end, do parsing and convert it to the specific form of message model stored in database
# also, can keep some token or flag something which indicates that current chat object is still alive so, we can fetch from it using frontend
# if it is destroyed, then 
