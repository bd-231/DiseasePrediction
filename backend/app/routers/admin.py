from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, PatientProfile, DoctorProfile
from app.models.case import Case
from app.schemas.user import CreateDoctorRequest, CreatePatientRequest, ResetPasswordRequest
from app.services.auth_service import hash_password
from app.middleware.auth_middleware import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/users/doctor")
def create_doctor(req: CreateDoctorRequest, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        role="doctor",
        full_name=req.full_name,
        created_by_admin_id=admin.id,
    )
    db.add(user)
    db.flush()
    profile = DoctorProfile(
        user_id=user.id,
        specialization=req.specialization,
        license_number=req.license_number,
        department=req.department,
    )
    db.add(profile)
    db.commit()
    return {"message": "Doctor created", "user_id": user.id}

@router.post("/users/patient")
def create_patient(req: CreatePatientRequest, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        role="patient",
        full_name=req.full_name,
        created_by_admin_id=admin.id,
    )
    db.add(user)
    db.flush()
    profile = PatientProfile(
        user_id=user.id,
        date_of_birth=req.date_of_birth,
        gender=req.gender,
    )
    db.add(profile)
    db.commit()
    return {"message": "Patient created", "user_id": user.id}

@router.get("/users")
def list_users(role: str = Query(None), db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        user_data = {
            "id": u.id, "email": u.email, "role": u.role,
            "full_name": u.full_name, "is_active": u.is_active,
            "created_at": str(u.created_at), "profile": None,
        }
        if u.role == "doctor":
            p = db.query(DoctorProfile).filter(DoctorProfile.user_id == u.id).first()
            if p:
                user_data["profile"] = {"specialization": p.specialization, "license_number": p.license_number, "department": p.department}
        elif u.role == "patient":
            p = db.query(PatientProfile).filter(PatientProfile.user_id == u.id).first()
            if p:
                user_data["profile"] = {
                    "date_of_birth": str(p.date_of_birth) if p.date_of_birth else None,
                    "gender": p.gender, "blood_group": p.blood_group,
                    "allergies": p.allergies or [], "existing_conditions": p.existing_conditions or [],
                    "current_medications": p.current_medications or [],
                }
        result.append(user_data)
    return result

@router.patch("/users/{user_id}/toggle")
def toggle_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own account")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin accounts")
    # Delete profile first to avoid FK constraint errors
    if user.role == "doctor":
        db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).delete()
    elif user.role == "patient":
        db.query(PatientProfile).filter(PatientProfile.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.post("/users/{user_id}/reset-password")
def reset_password(user_id: str, req: ResetPasswordRequest, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"message": "Password reset successfully"}

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    total_patients = db.query(User).filter(User.role == "patient").count()
    total_doctors = db.query(User).filter(User.role == "doctor").count()
    total_cases = db.query(Case).count()
    pending_reviews = db.query(Case).filter(Case.doctor_action == "pending").count()

    reviewed = db.query(Case).filter(Case.doctor_action != "pending").count()
    approved = db.query(Case).filter(Case.doctor_action == "approved").count()
    modified = db.query(Case).filter(Case.doctor_action == "modified").count()
    rejected = db.query(Case).filter(Case.doctor_action == "rejected").count()

    approval_rate = round(approved / reviewed, 2) if reviewed > 0 else 0.0
    modification_rate = round(modified / reviewed, 2) if reviewed > 0 else 0.0
    rejection_rate = round(rejected / reviewed, 2) if reviewed > 0 else 0.0

    # Priority distribution
    priority_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for level, count in db.query(Case.priority_level, func.count()).group_by(Case.priority_level).all():
        if level in priority_dist:
            priority_dist[level] = count

    # Top diseases
    top_diseases = []
    for disease, count in (
        db.query(Case.predicted_disease, func.count())
        .group_by(Case.predicted_disease)
        .order_by(func.count().desc())
        .limit(10)
        .all()
    ):
        if disease:
            top_diseases.append({"disease": disease, "count": count})

    # Cases per day (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    cases_per_day = []
    for dt, count in (
        db.query(func.date(Case.submitted_at), func.count())
        .filter(Case.submitted_at >= thirty_days_ago)
        .group_by(func.date(Case.submitted_at))
        .order_by(func.date(Case.submitted_at))
        .all()
    ):
        cases_per_day.append({"date": str(dt), "count": count})

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_cases": total_cases,
        "pending_reviews": pending_reviews,
        "approval_rate": approval_rate,
        "modification_rate": modification_rate,
        "rejection_rate": rejection_rate,
        "action_breakdown": {
            "approved": approved,
            "modified": modified,
            "rejected": rejected
        },
        "priority_distribution": priority_dist,
        "top_diseases": top_diseases,
        "cases_per_day": cases_per_day,
    }
