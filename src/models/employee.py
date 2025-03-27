

from beanie import Document
from typing import List,Optional

class Employee(Document):
    #id: Optional[PyObjectId] = Field(alias="_id", default=None)
    emp_id: str 
    #make all other optional
    
    #emotion_score: Optional[float]=None
    vibe_score: Optional[float]=None
    factors_in_sorted_order: Optional[List[str]]=None
    
    

    class Settings:
        
        name = "employees"
