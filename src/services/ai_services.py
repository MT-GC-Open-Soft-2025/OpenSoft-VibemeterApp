import transformers
import torch
import os
from huggingface_hub import login
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
if HF_TOKEN:
    login(token=HF_TOKEN)
else:
    raise ValueError("Hugging Face token not found. Set the HF_TOKEN environment variable.")

model_id = "meta-llama/Llama-3.3-70B-Instruct"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
)

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

if __name__=="__main__":
    user_inp = input("Enter question")
    print(generate_response(user_inp))

