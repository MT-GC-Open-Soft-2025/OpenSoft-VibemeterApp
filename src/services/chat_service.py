import transformers
import torch
from transformers import pipeline
from transformers import BartForConditionalGeneration, BartTokenizer

# Load the sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
model_name = "facebook/bart-large-cnn"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)

model_id = "meta-llama/Llama-3.3-70B-Instruct"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
)

def analyze_response(question: str, answer: str):
    """Formats question and answer into a structured sentence, 
    feeds it to the sentiment model, and returns the sentiment result."""
    
    formatted_text = f"When the bot asked '{question}', the user replied '{answer}'."
    result = sentiment_pipeline(formatted_text)[0]  # Extracting the first result
    
    # Convert to dictionary with label as key and score as value
    return {result["label"]: result["score"]}


# generates a response and returns it 
def generate_response(user_input:str) -> str:
    messages = [
        {"role": "system", "content": "You are a pirate chatbot who always responds in pirate speak!"},
        {"role": "user", "content": user_input},
    ]
    outputs = pipeline(
    messages,
    max_new_tokens=256,
    )
    response = outputs[0]["generated_text"][-1]

    return response


def summarize_text(text, max_length=130, min_length=30, length_penalty=2.0):
    inputs = tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(inputs, max_length=max_length, min_length=min_length, length_penalty=length_penalty, num_beams=4)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    return summary
