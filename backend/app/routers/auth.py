from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, PatientProfile, DoctorProfile
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth_service import verify_password, create_token
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    token = create_token(user.id, user.role, user.email)
    return LoginResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "role": user.role, "full_name": user.full_name},
    )

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "created_at": str(current_user.created_at),
    }
    if current_user.role == "patient":
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if profile:
            result["profile"] = {
                "date_of_birth": str(profile.date_of_birth) if profile.date_of_birth else None,
                "gender": profile.gender,
                "blood_group": profile.blood_group,
                "allergies": profile.allergies or [],
                "existing_conditions": profile.existing_conditions or [],
                "current_medications": profile.current_medications or [],
                "medical_history": profile.medical_history,
            }
    elif current_user.role == "doctor":
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if profile:
            result["profile"] = {
                "specialization": profile.specialization,
                "license_number": profile.license_number,
                "department": profile.department,
            }
    return result
