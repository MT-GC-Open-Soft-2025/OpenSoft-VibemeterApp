import torch
import os
from dotenv import load_dotenv
from transformers import pipeline
from transformers import BartForConditionalGeneration, BartTokenizer
from google import genai
import google.generativeai as genai


load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")

client = genai.Client(api_key=GEMINI_KEY)
# chat = client.chats.create(model="gemini-1.5-flash")

# Load the sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


def analyze_response(question: str, answer: str):
    """Formats question and answer into a structured sentence, 
    feeds it to the sentiment model, and returns the sentiment result."""
    
    formatted_text = f"When the bot asked '{question}', the user replied '{answer}'."
    result = sentiment_pipeline(formatted_text)[0]  # Extracting the first result
    
    # Convert to dictionary with label as key and score as value
    return {result["label"]: result["score"]}

def initialize():
    chat = client.chats.create(model="gemini-1.5-flash")
    return chat

# generates a response and returns it 
def generate_response(user_input:str,chat1) -> str:
    response = chat1.send_message(user_input)
    # print(response.text)
    # print(type(chat))
    return response.text 

    # for message in chat.get_history():
    #     print(message.parts[0].text)



#SUMMARIZER
genai.configure(api_key="GEMINI KEY")

model = genai.GenerativeModel("gemini-2.0-flash")

def summarize_text(text):
    prompt = f"This is a conversation between bot and user.Summarize the following text in points a concise and clear manner highlighting the problems faced by user and in very short how bot helps him and in the end give the main issue in 1,2 lines why you think user is sad.:\n\n{text}"
    response = model.generate_content(prompt)
    return response.text

# Example text to summarize
'''
input_text = """Bot said, 'Hello! How can I assist you today?'",
    "User said, 'Hey, I need help applying for leave. Honestly, I don’t even know why I’m asking because getting a leave approved in this company is a nightmare. It’s like they think I’m asking for a one-year vacation in the Bahamas when all I want is a few days to recover from the constant stress. Every time I bring it up, my manager sighs like I’ve personally let him down, my teammates start hinting that they’ll be ‘so swamped’ without me, and somehow, I always end up feeling guilty for even thinking about taking a break. I’m exhausted—mentally, physically, emotionally. I just need some time to breathe, but even asking for it feels like inviting another round of unnecessary drama.'",
    "Bot said, 'I understand how you feel. You definitely deserve a break. You can apply for leave through the HR portal. Would you like me to guide you through the steps?'",
    "User said, 'Yeah, sure, but the HR portal isn’t even loading for me. Maybe it’s a sign that I should just keep working until I drop. Honestly, even the system is against me at this point. I tried multiple times, refreshed the page, even restarted my computer, and nothing. It just keeps throwing an error, and I have no idea what to do now. Typical. The one time I actually try to take a break, everything works against me.'",
    "Bot said, 'That sounds frustrating. Are you facing a login issue, or is the portal not responding at all?'",
    "User said, 'Oh, I wish it was just a login issue. At least then I’d know what’s wrong. But no, the entire portal refuses to load. It’s like it just decided to take a break before I could. Maybe it knows I’m trying to apply for leave and is just laughing at me. I even tried different browsers, but nope, nothing works. If this isn’t a sign from the universe that I’m meant to suffer, I don’t know what is.'",
    "Bot said, 'I see. Have you tried resetting your password? Sometimes, login-related issues can be fixed that way.'",
    "User said, 'Yeah, I actually tried that already, but guess what? No reset email. Nothing. Nada. It’s like even the automated system doesn’t think I should get a break. I even checked my spam folder, hoping maybe it got lost in there, but no, it’s just not coming. Meanwhile, I bet if I was logging in to take on more work, the system would let me in instantly.'",
    "Bot said, 'That’s really inconvenient. I can escalate this to IT support for you. Would you like me to do that?'",
    "User said, 'Yes, please! At least someone is willing to help without making me feel bad about it. IT better not take forever, though, because I swear, if I have to wait days just to APPLY for a break, that’s just cruel. Honestly, I don’t even care at this point. If my manager gives me that disappointed look again, I might just walk out and take an unofficial leave of absence.'",
    "Bot said, 'Done! The IT team will get back to you in the next few hours. You’ll receive an email once they resolve the issue.'",
    "User said, 'Thanks. But while I’m waiting for them to fix this, is there any other way to apply for leave? Because I already know how this goes. I wait for IT, they take their sweet time, then my manager acts like I should’ve informed him sooner, and then the guilt-tripping begins. I’d rather avoid the whole circus.'",
    "Bot said, 'Yes, you can email your manager directly with your leave request.'",
    "User said, 'Alright, that sounds simple enough. But knowing my manager, he’ll ‘conveniently’ forget that I asked and then act all shocked when I remind him later. What exactly should I include in the email to make it official? Should I also attach proof that I’m on the verge of burnout, or would that be too much?'",
    "Bot said, 'Mention your leave dates, the reason for your leave, and whether any work handover is required. Attachments are only necessary if you’re applying for medical leave.'",
    "User said, 'Got it. I’ll make sure to include all of that. But wait, before I go through all this, how many leave days do I even have left? Because knowing my luck, I probably used them all without realizing.'",
    "Bot said, 'Let me check… You have 12 days of paid leave remaining for this year.'",
    "User said, 'Huh. That’s more than I expected. Feels weird knowing I actually have something left for myself. What about sick leave? Because at this point, I think I’m more mentally sick than anything else.'",
    "Bot said, 'You have 5 sick leave days available.'",
    "User said, 'And if I need more than that? Because let’s be honest, five days of sick leave isn’t nearly enough for how draining this job is.'",
    "Bot said, 'If you exceed your sick leave balance, extra days will be deducted from your paid leave. If you need additional time off, you may have to apply for unpaid leave.'",
    "User said, 'Of course. So basically, if I want to recover, I have to lose money. But if I keep working through the stress, I get to keep my paycheck but risk completely burning out. Wow, what an amazing system. Truly inspiring.'",
    "Bot said, 'I understand that this can feel unfair. Would you like to speak to HR about your workload and leave concerns?'",
    "User said, 'HR? Oh, you mean the same people who tell me to “prioritize my mental health” while also expecting me to take on extra work whenever someone else slacks off? Yeah, no thanks. They’ll probably just nod sympathetically and then do absolutely nothing to help.'",
    "Bot said, 'I see. If your workload feels overwhelming, maybe it would help to discuss task distribution with your manager?'",
    "User said, 'Oh, I’ve tried. Believe me, I’ve tried. I sat down, had a “serious conversation” about the workload, and you know what happened? He agreed with me, said he understood, and then somehow, I ended up with even MORE responsibilities. It’s like being responsible is a punishment in this place. Meanwhile, the people who do the bare minimum? They get away with everything. It’s just exhausting. But whatever, I’ll still apply for leave. At this point, I just need a break, even if it means temporarily escaping this madness.'",
    "Bot said, 'That sounds really tough. I hope you get the break you deserve soon.'"""


summary = summarize_text(input_text)
print("Summary:", summary)

'''







# if __name__=="__main__":
#     print(generate_response("I am feeling happy"))
#     print(generate_response("I am feeling sad"))
