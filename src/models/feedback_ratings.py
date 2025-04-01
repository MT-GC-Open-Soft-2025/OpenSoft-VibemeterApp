from beanie import Document
from pydantic import BaseModel
from typing import List
from datetime import datetime

class Feedback_ratings(Document):
    
    Q1: int
    Q2: int
    Q3: int
    Q4: int
    Q5: int
    
    class Settings:   
        name = "feedback_ratings"
        
        
    
    
    
