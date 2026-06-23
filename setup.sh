#!/usr/bin/env bash
set -e

if [ -d .venv ]; then
  echo ".venv already exists. Skipping virtual environment creation."
else
  python3 -m venv .venv
fi

# Activate venv for this script
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install

echo "Setup complete. Run 'npm start' from the project root to launch the app."
