from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables, SessionLocal
from app.seed import seed_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Creating database tables...")
    create_tables()
    print("Seeding admin user...")
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()
    print("Loading ML models...")
    from app.services.prediction_service import load_models
    load_models()
    print("Application ready!")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="Healthcare Decision Support API",
    description="AI-powered disease prediction and medicine recommendation with doctor validation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, admin, patient, doctor
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(patient.router)
app.include_router(doctor.router)

@app.get("/")
def root():
    return {"message": "Healthcare Decision Support API", "status": "running"}
