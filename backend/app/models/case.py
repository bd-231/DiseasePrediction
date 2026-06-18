from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Integer
from app.database import Base


class Case(Base):
    __tablename__ = "cases"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=True)
    symptoms_selected = Column(JSON, nullable=False)
    severity_index = Column(Float, nullable=True)
    priority_level = Column(String, nullable=True)
    dangerous_combination_detected = Column(Boolean, default=False)
    age_at_submission = Column(Integer, nullable=True)
    gender_at_submission = Column(String, nullable=True)
    predicted_disease = Column(String, nullable=True)
    prediction_confidence = Column(Float, nullable=True)
    medicine_recommendations = Column(JSON, nullable=True)
    doctor_action = Column(String, default="pending")
    doctor_modified_disease = Column(String, nullable=True)
    doctor_modified_medicines = Column(JSON, nullable=True)
    doctor_comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")
