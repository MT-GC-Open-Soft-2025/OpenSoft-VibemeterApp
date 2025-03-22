import torch
import os
from dotenv import load_dotenv
from transformers import pipeline
from transformers import BartForConditionalGeneration, BartTokenizer
import google.generativeai as genai

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")

genai.configure(api_key=GEMINI_KEY)
chatmodel = genai.GenerativeModel("gemini-1.5-flash")

# Load the sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
model_name = "facebook/bart-large-cnn"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)


def analyze_response(question: str, answer: str):
    """Formats question and answer into a structured sentence, 
    feeds it to the sentiment model, and returns the sentiment result."""
    
    formatted_text = f"When the bot asked '{question}', the user replied '{answer}'."
    result = sentiment_pipeline(formatted_text)[0]  # Extracting the first result
    
    # Convert to dictionary with label as key and score as value
    return {result["label"]: result["score"]}


# generates a response and returns it 
def generate_response(user_input:str) -> str:
    response = chatmodel.generate_content(user_input)
    return response.text


def summarize_text(text, max_length=130, min_length=30, length_penalty=2.0):
    inputs = tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(inputs, max_length=max_length, min_length=min_length, length_penalty=length_penalty, num_beams=4)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    return summary

if __name__=="__main__":
    print(generate_response("I am feeling stressed"))
