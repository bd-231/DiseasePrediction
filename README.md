# DiseaseReco

A full-stack disease diagnosis and medication recommendation web application with doctor review and validation.

## Overview

- **Backend**: FastAPI + SQLAlchemy.
- **Frontend**: React + Vite + Tailwind CSS.
- **AI**: Disease classifier and drug recommendation models generated from notebooks.
- **Database**: SQLite backend file is created automatically at runtime.

## Project Structure

- `backend/`: FastAPI API server and database models.
- `frontend/`: React application and UI.
- `models/`: Generated model files used by the backend.
- `data/processed/`: Generated runtime data files required by the backend.
- `notebooks/`: Data processing and model training notebooks.

## Prerequisites

- Python 3.11
- Node.js 18+ and npm

## Initial Setup

1. From the project root:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install -r backend/requirements.txt
   ```

2. Generate processed data and model artifacts by running the notebooks:
   ```bash
   jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=0 notebooks/*.ipynb
   ```

   This will regenerate the following directories:
   - `data/processed/`
   - `models/`

   > These files are not stored in source control. Run the notebooks whenever you need fresh generated data or model files.

## Backend

1. Activate the virtual environment (if not already active):
   ```bash
   source venv/bin/activate
   ```

2. Start the backend from the project root:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```

3. Open API docs:
   - `http://localhost:8000/docs`

## Frontend

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open the app:
   - `http://localhost:5173`

## Default Admin Credentials

- Email: `admin@healthcare.com`
- Password: `Admin@123`

## Notes

- `data/processed/` and `models/` are generated outputs and are ignored by git.
- `models/drug_rf_regressor.pkl` is excluded from source control due to GitHub file size limits, but running the notebooks can recreate it.
- If you need to regenerate artifacts later, re-run the notebooks with:
  ```bash
  source venv/bin/activate
  jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=0 notebooks/*.ipynb
  ```

## Run Order Summary

1. `python3 -m venv venv`
2. `source venv/bin/activate`
3. `pip install -r requirements.txt -r backend/requirements.txt`
4. `jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=0 notebooks/*.ipynb`
5. `uvicorn backend.app.main:app --reload --port 8000`
6. `cd frontend && npm run dev`

## Using the app

1. Start backend and frontend.
2. Login with admin credentials.
3. Create doctor/patient accounts as needed.
4. Submit patient cases and review them via doctor workflows.
