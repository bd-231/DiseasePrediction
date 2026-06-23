# Deployment Guide: HealthAI Decision Support System

This guide will walk you through deploying your full-stack application to the internet for **free** so you can share the link with your friends and colleagues.

We will use two popular, free developer platforms:
1. **Render** (for the Python FastAPI Backend)
2. **Vercel** (for the React Frontend)

---

## Pre-requisites
1. Push your entire `DiseaseReco` project to a free **GitHub repository**.
2. Make sure you have accounts on [Render](https://render.com) and [Vercel](https://vercel.com) (you can sign in with your GitHub account).

---

## Part 1: Deploy the Backend (Render)

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub account and select your `DiseaseReco` repository.
3. Fill out the configuration exactly like this:
   - **Name**: `healthai-backend` (or whatever you prefer)
   - **Environment**: `Python 3`
   - **Region**: Select whatever is closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Crucial!)*
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Select the **Free** instance type.
5. Click **Create Web Service**.

> **Note**: The first deployment might take 2-4 minutes while it installs the machine learning libraries (like scikit-learn).
> **Database Note**: The free tier of Render spins down when inactive and wipes local files. This means your SQLite database will reset if the server sleeps. For a quick showcase, this is perfectly fine (it will just recreate the default admin account).

**When it finishes, copy your new backend URL!** It will look something like `https://healthai-backend-xxxx.onrender.com`.

---

## Part 2: Deploy the Frontend (Vercel)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Import your `DiseaseReco` GitHub repository.
3. In the "Configure Project" screen, fill it out like this:
   - **Project Name**: `healthai` (or similar)
   - **Framework Preset**: Vercel should automatically detect `Vite`.
   - **Root Directory**: Click "Edit" and select the `frontend` folder! *(Crucial!)*
4. Open the **Environment Variables** section and add the following:
   - **Name**: `VITE_API_URL`
   - **Value**: `[Paste your Render Backend URL here]` *(e.g., https://healthai-backend-xxxx.onrender.com)*
5. Click **Deploy**.

Vercel will build the React app in about 30 seconds.

---

## Part 3: Share with your friends!

Once Vercel finishes deploying, they will give you a live public URL (e.g., `https://healthai-abcd.vercel.app`). 

1. Click the Vercel link to open your live frontend.
2. The frontend will automatically talk to your live Render backend!
3. **Log in with the default admin credentials** (`admin@healthcare.com` / `Admin@123`) to ensure everything is working.
4. Share the Vercel link with your friends and colleagues!
