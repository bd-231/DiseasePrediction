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

## Setup

### Backend

1. From the project root:
   ```bash
   cd backend
   python3 -m venv ../venv
   source ../venv/bin/activate
   pip install -r requirements.txt
   ```

2. Run the backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. API docs:
   - `http://localhost:8000/docs`

> Note: `backend/healthcare.db` is not included in source control and will be created automatically.

### Frontend

1. From the project root:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open:
   - `http://localhost:5173`

## Default Admin Credentials

- Email: `admin@healthcare.com`
- Password: `Admin@123`

## Important Notes

- `models/drug_rf_regressor.pkl` is not included in this GitHub push because it exceeds GitHub's single-file size limit.
- The following files are included to run the backend:
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

If you need the full model artifact, please transfer `models/drug_rf_regressor.pkl` by alternative means and place it inside `models/`.

## Running the App

1. Start the backend.
2. Start the frontend.
3. Login as admin and create test users.
4. Submit cases from a patient account and approve them from a doctor account.
