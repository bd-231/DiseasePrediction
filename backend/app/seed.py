from sqlalchemy.orm import Session
from app.models.user import User
from app.services.auth_service import hash_password


def seed_admin(db: Session):
    existing = db.query(User).filter(User.role == "admin").first()
    if existing:
        return
    admin = User(
        email="admin@healthcare.com",
        password_hash=hash_password("Admin@123"),
        role="admin",
        full_name="System Administrator",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("Default admin created: admin@healthcare.com / Admin@123")
