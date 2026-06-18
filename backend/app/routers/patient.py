from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, PatientProfile
from app.models.case import Case
from app.models.notification import Notification
from app.schemas.case import CaseSubmitRequest
from app.schemas.user import PatientProfileUpdate
from app.services.case_service import submit_case
from app.services.prediction_service import get_symptom_list
from app.middleware.auth_middleware import require_role

router = APIRouter(prefix="/patient", tags=["Patient"])

@router.get("/symptoms")
def list_symptoms(current_user: User = Depends(require_role("patient"))):
    return get_symptom_list()

@router.post("/cases")
def create_case(req: CaseSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(require_role("patient"))):
    try:
        case = submit_case(db, current_user, req.symptoms_selected)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "id": case.id,
        "submitted_at": str(case.submitted_at),
        "priority_level": case.priority_level,
        "severity_index": case.severity_index,
        "dangerous_combination_detected": case.dangerous_combination_detected,
        "status": case.status,
        "doctor_action": case.doctor_action,
    }

@router.get("/cases")
def list_cases(db: Session = Depends(get_db), current_user: User = Depends(require_role("patient"))):
    cases = db.query(Case).filter(Case.patient_id == current_user.id).order_by(Case.submitted_at.desc()).all()
    return [
        {
            "id": c.id,
            "submitted_at": str(c.submitted_at),
            "priority_level": c.priority_level,
            "status": c.status,
            "doctor_action": c.doctor_action,
            "severity_index": c.severity_index,
            "symptoms_count": len(c.symptoms_selected) if c.symptoms_selected else 0,
        }
        for c in cases
    ]

@router.get("/cases/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("patient"))):
    case = db.query(Case).filter(Case.id == case_id, Case.patient_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    result = {
        "id": case.id,
        "submitted_at": str(case.submitted_at),
        "priority_level": case.priority_level,
        "severity_index": case.severity_index,
        "dangerous_combination_detected": case.dangerous_combination_detected,
        "symptoms_selected": case.symptoms_selected,
        "status": case.status,
        "doctor_action": case.doctor_action,
        "reviewed_at": str(case.reviewed_at) if case.reviewed_at else None,
    }

    # CRITICAL: Only show doctor-approved data, NEVER raw AI predictions
    if case.doctor_action in ("approved", "modified"):
        if case.doctor_action == "modified":
            result["final_disease"] = case.doctor_modified_disease or case.predicted_disease
            result["final_medicines"] = case.doctor_modified_medicines or case.medicine_recommendations
        else:
            result["final_disease"] = case.predicted_disease
            result["final_medicines"] = case.medicine_recommendations
        result["doctor_comments"] = case.doctor_comments
    elif case.doctor_action == "rejected":
        result["doctor_comments"] = case.doctor_comments

    return result

@router.get("/profile")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(require_role("patient"))):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        return {"message": "No profile found"}
    return {
        "date_of_birth": str(profile.date_of_birth) if profile.date_of_birth else None,
        "gender": profile.gender,
        "blood_group": profile.blood_group,
        "allergies": profile.allergies or [],
        "existing_conditions": profile.existing_conditions or [],
        "current_medications": profile.current_medications or [],
        "medical_history": profile.medical_history,
    }

@router.patch("/profile")
def update_profile(req: PatientProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role("patient"))):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        profile = PatientProfile(user_id=current_user.id)
        db.add(profile)
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    db.commit()
    return {"message": "Profile updated"}

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(require_role("patient"))):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": n.id,
            "case_id": n.case_id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": str(n.created_at),
        }
        for n in notifications
    ]
