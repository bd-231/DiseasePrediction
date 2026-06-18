from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date


class CreateDoctorRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    department: Optional[str] = None


class CreatePatientRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    new_password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    is_active: bool
    created_at: str
    profile: Optional[dict] = None

    class Config:
        from_attributes = True


class PatientProfileUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    medical_history: Optional[str] = None
