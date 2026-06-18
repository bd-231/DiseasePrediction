from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import case as sql_case
from datetime import datetime
from app.database import get_db
from app.models.user import User, PatientProfile
from app.models.case import Case
from app.models.notification import Notification
from app.schemas.case import CaseModifyRequest, CaseRejectRequest
from app.middleware.auth_middleware import require_role

router = APIRouter(prefix="/doctor", tags=["Doctor"])

PRIORITY_ORDER = sql_case(
    (Case.priority_level == "critical", 1),
    (Case.priority_level == "high", 2),
    (Case.priority_level == "medium", 3),
    (Case.priority_level == "low", 4),
    else_=5,
)

@router.get("/queue")
def get_queue(db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    cases = (
        db.query(Case)
        .filter(Case.doctor_action == "pending")
        .order_by(PRIORITY_ORDER, Case.submitted_at.asc())
        .all()
    )
    result = []
    for c in cases:
        patient = db.query(User).filter(User.id == c.patient_id).first()
        symptoms_preview = c.symptoms_selected[:3] if c.symptoms_selected else []
        result.append({
            "id": c.id,
            "patient_name": patient.full_name if patient else "Unknown",
            "patient_id": c.patient_id,
            "age": c.age_at_submission,
            "gender": c.gender_at_submission,
            "symptoms_preview": symptoms_preview,
            "symptoms_count": len(c.symptoms_selected) if c.symptoms_selected else 0,
            "priority_level": c.priority_level,
            "severity_index": c.severity_index,
            "dangerous_combination_detected": c.dangerous_combination_detected,
            "submitted_at": str(c.submitted_at),
        })
    return result

@router.get("/reviewed")
def get_reviewed(db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    cases = (
        db.query(Case)
        .filter(Case.doctor_id == doctor.id, Case.doctor_action != "pending")
        .order_by(Case.reviewed_at.desc())
        .all()
    )
    result = []
    for c in cases:
        patient = db.query(User).filter(User.id == c.patient_id).first()
        result.append({
            "id": c.id,
            "patient_name": patient.full_name if patient else "Unknown",
            "patient_id": c.patient_id,
            "symptoms_count": len(c.symptoms_selected) if c.symptoms_selected else 0,
            "symptoms_preview": (c.symptoms_selected or [])[:3],
            "priority_level": c.priority_level,
            "doctor_action": c.doctor_action,
            "status": c.status,
            "reviewed_at": str(c.reviewed_at) if c.reviewed_at else None,
            "submitted_at": str(c.submitted_at),
        })
    return result


@router.get("/cases/{case_id}")
def get_case_detail(case_id: str, db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    patient = db.query(User).filter(User.id == case.patient_id).first()
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == case.patient_id).first()

    return {
        "id": case.id,
        "patient": {
            "id": patient.id if patient else None,
            "name": patient.full_name if patient else "Unknown",
            "email": patient.email if patient else None,
            "age": case.age_at_submission,
            "gender": case.gender_at_submission,
            "blood_group": profile.blood_group if profile else None,
            "allergies": (profile.allergies or []) if profile else [],
            "existing_conditions": (profile.existing_conditions or []) if profile else [],
            "current_medications": (profile.current_medications or []) if profile else [],
            "medical_history": profile.medical_history if profile else None,
        },
        "symptoms_selected": case.symptoms_selected,
        "severity_index": case.severity_index,
        "priority_level": case.priority_level,
        "dangerous_combination_detected": case.dangerous_combination_detected,
        "predicted_disease": case.predicted_disease,
        "prediction_confidence": case.prediction_confidence,
        "medicine_recommendations": case.medicine_recommendations,
        "doctor_action": case.doctor_action,
        "doctor_modified_disease": case.doctor_modified_disease,
        "doctor_modified_medicines": case.doctor_modified_medicines,
        "doctor_comments": case.doctor_comments,
        "submitted_at": str(case.submitted_at),
        "reviewed_at": str(case.reviewed_at) if case.reviewed_at else None,
        "status": case.status,
    }

@router.post("/cases/{case_id}/approve")
def approve_case(case_id: str, db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.doctor_action != "pending":
        raise HTTPException(status_code=400, detail="Case already reviewed")

    case.doctor_action = "approved"
    case.status = "approved"
    case.doctor_id = doctor.id
    case.reviewed_at = datetime.utcnow()

    notification = Notification(
        user_id=case.patient_id,
        case_id=case.id,
        message="Your case has been reviewed and approved by a doctor. You can now view the results.",
    )
    db.add(notification)
    db.commit()
    return {"message": "Case approved"}

@router.post("/cases/{case_id}/modify")
def modify_case(case_id: str, req: CaseModifyRequest, db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.doctor_action != "pending":
        raise HTTPException(status_code=400, detail="Case already reviewed")

    case.doctor_action = "modified"
    case.status = "modified"
    case.doctor_id = doctor.id
    case.doctor_modified_disease = req.disease
    case.doctor_modified_medicines = req.medicines
    case.doctor_comments = req.comments
    case.reviewed_at = datetime.utcnow()

    notification = Notification(
        user_id=case.patient_id,
        case_id=case.id,
        message="Your case has been reviewed by a doctor with modifications. You can now view the results.",
    )
    db.add(notification)
    db.commit()
    return {"message": "Case modified"}

@router.post("/cases/{case_id}/reject")
def reject_case(case_id: str, req: CaseRejectRequest, db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.doctor_action != "pending":
        raise HTTPException(status_code=400, detail="Case already reviewed")

    case.doctor_action = "rejected"
    case.status = "rejected"
    case.doctor_id = doctor.id
    case.doctor_comments = req.comments
    case.reviewed_at = datetime.utcnow()

    notification = Notification(
        user_id=case.patient_id,
        case_id=case.id,
        message="Your case has been reviewed. The doctor requires additional information.",
    )
    db.add(notification)
    db.commit()
    return {"message": "Case rejected"}

@router.get("/patients/{patient_id}/history")
def get_patient_history(patient_id: str, db: Session = Depends(get_db), doctor: User = Depends(require_role("doctor"))):
    cases = db.query(Case).filter(Case.patient_id == patient_id).order_by(Case.submitted_at.desc()).all()
    return [
        {
            "id": c.id,
            "submitted_at": str(c.submitted_at),
            "priority_level": c.priority_level,
            "predicted_disease": c.predicted_disease,
            "doctor_action": c.doctor_action,
            "status": c.status,
        }
        for c in cases
    ]
