"""Case submission orchestration service."""
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.user import User, PatientProfile
from app.models.case import Case
from app.models.notification import Notification
from app.services.triage_service import (
    calculate_severity_index,
    detect_dangerous_combinations,
    assign_priority,
)
from app.services.prediction_service import (
    predict_disease,
    recommend_medicines,
    get_symptom_list,
)

def _calculate_age(dob: date | None) -> int | None:
    if dob is None:
        return None
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

def submit_case(db: Session, patient_user: User, symptoms: list[str]) -> Case:
    """Full case submission pipeline: triage -> prediction -> recommendation -> save."""
    # Validate symptoms
    valid_symptoms = set(get_symptom_list())
    validated = [s for s in symptoms if s in valid_symptoms]
    if not validated:
        raise ValueError("No valid symptoms provided")

    # Get patient profile
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == patient_user.id
    ).first()

    age = _calculate_age(profile.date_of_birth) if profile else None
    gender = profile.gender if profile else None
    allergies = (profile.allergies or []) if profile else []
    current_medications = (profile.current_medications or []) if profile else []

    # Run triage
    severity_index = calculate_severity_index(validated)
    dangerous = detect_dangerous_combinations(validated)
    priority = assign_priority(severity_index, dangerous)

    # Run disease prediction
    disease, confidence = predict_disease(validated)

    # Run medicine recommendation
    medicines = recommend_medicines(
        predicted_disease=disease,
        allergies=allergies,
        current_medications=current_medications,
        top_n=5,
    )

    # Create case
    case = Case(
        patient_id=patient_user.id,
        symptoms_selected=validated,
        severity_index=severity_index,
        priority_level=priority,
        dangerous_combination_detected=dangerous,
        age_at_submission=age,
        gender_at_submission=gender,
        predicted_disease=disease,
        prediction_confidence=confidence,
        medicine_recommendations=medicines,
        doctor_action="pending",
        status="pending",
    )
    db.add(case)
    db.flush()

    # Notify all doctors
    doctors = db.query(User).filter(User.role == "doctor", User.is_active == True).all()
    for doctor in doctors:
        notification = Notification(
            user_id=doctor.id,
            case_id=case.id,
            message=f"New case submitted by {patient_user.full_name} - Priority: {priority.upper()}",
        )
        db.add(notification)

    db.commit()
    db.refresh(case)
    return case
