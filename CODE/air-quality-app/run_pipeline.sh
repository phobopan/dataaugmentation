#!/bin/bash

echo "Starting Machine Learning Model Trainer Website..."

# Navigate to backend
cd backend

# Ensure virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# source venv/Scripts/activate  # Windows (if using Git Bash)

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Remove old distribution plots
echo "Cleaning old plots..."
rm -rf static/plots/*.png

# Start Flask server
echo "Starting Flask server..."
python app.py 

sleep 3

open http://127.0.0.1:5000/

