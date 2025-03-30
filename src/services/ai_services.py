import torch
import os
from dotenv import load_dotenv
from transformers import pipeline
from transformers import BartForConditionalGeneration, BartTokenizer

import google.generativeai as genai
from google import genai


load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")
client = genai.Client(api_key=GEMINI_KEY)
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


def analyze_response(question: str, answer: str):
    """Formats question and answer into a structured sentence, 
    feeds it to the sentiment model, and returns the sentiment result."""    
    formatted_text = f"When the bot asked '{question}', the user replied '{answer}'."
    result = sentiment_pipeline(formatted_text)[0]      
    return {result["label"]: result["score"]}


def initialize():
    print("Inside initialize")
    try: 
        print("Inside try")
        
        chat = client.chats.create(model="gemini-2.0-flash")
        print  ("Chat",type(chat))
        return chat
    except Exception as e:
        print ("Error",e)
        return {"error": str(e)}
 
def generate_response(user_input:str,chat1) -> str:
    response = chat1.send_message(user_input)
    return response.text    



def summarize_text(text,chatObj): 
    prompt = f"Based on current conversation between bot and user, summarize it in points in concise and clear manner highlighting the problems faced by user and how bot helps him and in the end give the main issue in 1,2 lines why you think user is sad, in case he admits that he is sad.Also analyse sentiment on scale of 0-1 as to how intense is his situattion and say whether HR needs to intervene or not. \n\n{text}"
    response = chatObj.send_message(prompt)
    return response.text

