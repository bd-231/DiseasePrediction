# DiseaseReco

A full-stack disease diagnosis and medication recommendation web application with doctor review and validation.

## Overview

- **Backend**: FastAPI + SQLAlchemy.
- **Frontend**: React + Vite + Tailwind CSS.
- **AI**: Disease classifier and drug recommendation models loaded from `models/`.
- **Database**: SQLite backend file is created automatically at runtime.

## Project Structure

- `backend/`: FastAPI API server and database models.
- `frontend/`: React application and UI.
- `models/`: Pretrained model files used by the backend.
- `data/processed/`: Runtime data files required by the backend.

## Prerequisites

- Python 3.11
- Node.js 18+ and npm
- Git

## Setup

### Backend (development)

1. Create a virtual environment and install dependencies (from project root):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
```

2. Environment variables (optional):

- `DATABASE_URL` — SQLAlchemy database URL (default: `sqlite:///backend/healthcare.db`)
- `JWT_SECRET` — secret key for signing JWTs (default provided; change in production)
- `JWT_EXPIRY_HOURS` — integer expiry for JWTs (default: `8`)
- `MODEL_DIR` — path to model directory (defaults to `models/` in project root)

Example:

```bash
export JWT_SECRET="change-this-secret"
export DATABASE_URL="sqlite:///./backend/healthcare.db"
```

3. Start the backend and frontend from the repo root:

```bash
npm start
```

The app's startup process will:
- create database tables (if missing)
- seed a default admin user (`admin@healthcare.com` / `Admin@123`) if none exists
- load ML models from the `models/` directory

You can confirm seeding by checking the server logs for:

```
Seeding admin user...
Default admin created: admin@healthcare.com / Admin@123
```

Manual seeding (if needed):

```bash
python -c "from backend.app.database import SessionLocal, create_tables; from backend.app.seed import seed_admin; create_tables(); db=SessionLocal(); seed_admin(db); db.close()"
```

4. API docs:

- `http://localhost:8000/docs`

### Frontend (development)

1. Install dependencies and run dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Default dev URL: `http://localhost:5173`

## Important Notes

- Large model files (for example `models/drug_rf_regressor.pkl`) are tracked with Git LFS in this repository.
- The repository includes these model artifacts needed at runtime:
  - `models/best_disease_model.pkl`
  - `models/cond_label_encoder.pkl`
  - `models/drug_label_encoder.pkl`
  - `models/feature_cols.pkl`
  - `models/model_meta.json`
  - `models/regressor_meta.json`
  - `data/processed/label_map.csv`
  - `data/processed/drug_stats.csv`
  - `data/processed/drug_stats_fallback.csv`
  - `data/processed/disease_condition_map.csv`

To fetch LFS objects after cloning or pulling the repo:

```bash
# macOS (Homebrew)
brew install git-lfs
git lfs install
# after cloning/pulling
git lfs pull
```

If you cannot use Git LFS, download the large model(s) separately (e.g., GitHub Releases, cloud storage) and place them into the `models/` directory.

## Running the App (quick checklist)

1. Create and activate Python venv
2. Install Python dependencies
3. Ensure `models/` contains required `.pkl` files (use `git lfs pull` if necessary)
4. Start backend: `cd backend && uvicorn app.main:app --reload --port 8000`
5. Start frontend: `cd frontend && npm run dev`
6. Open API docs and frontend UI, then login with admin credentials

## Troubleshooting

- Backend fails to find models: confirm `MODEL_DIR` or `models/` location and run `git lfs pull`.
- Database errors: ensure the venv is active and `DATABASE_URL` points to a writable location.
- Permissions: some macOS setups restrict file creation — ensure VS Code / shell has filesystem access.

## Default Admin Credentials

- Email: `admin@healthcare.com`
- Password: `Admin@123`

## Contributing / Collaborators

Please run `git lfs install` before cloning/pulling or instruct contributors to do so, otherwise large model files will not be downloaded.

---

If you'd like, I can also add a short `CONTRIBUTING.md` with these Git LFS and local dev notes.
