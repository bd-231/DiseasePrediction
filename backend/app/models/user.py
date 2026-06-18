from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Boolean, DateTime, Date, Text, ForeignKey, JSON
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_admin_id = Column(String, ForeignKey("users.id"), nullable=True)


class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    allergies = Column(JSON, default=list)
    existing_conditions = Column(JSON, default=list)
    current_medications = Column(JSON, default=list)
    medical_history = Column(Text, nullable=True)


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    specialization = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    department = Column(String, nullable=True)
