from beanie import Document
from typing import List,Optional,Dict

class Employee(Document):
   
    emp_id: str    
    vibe_score: Optional[float] = None
    total_work_hours: Optional[float] = None
    leave_days: Optional[float] = None
    types_of_leaves: Optional[Dict[str, int]] = None  
    feedback: Optional[float] = None
    weighted_performance: Optional[float] = None
    reward_points: Optional[int] = None
    award_list: Optional[List[str]] = None  
    factors_in_sorted_order: Optional[List[str]] = None

    class Settings:
        
        name = "employees"
