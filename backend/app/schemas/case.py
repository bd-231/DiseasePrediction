from pydantic import BaseModel
from typing import Optional, List


class CaseSubmitRequest(BaseModel):
    symptoms_selected: List[str]


class CaseModifyRequest(BaseModel):
    disease: Optional[str] = None
    medicines: Optional[List[dict]] = None
    comments: Optional[str] = None


class CaseRejectRequest(BaseModel):
    comments: str
