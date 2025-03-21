import transformers
import torch

# Load the sentiment analysis pipeline
sentiment_pipeline = transformers.pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

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

