import transformers
import torch

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

