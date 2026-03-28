$ErrorActionPreference = "Stop"

Write-Host "Setting up Ghana Backend..."

if (-not (Test-Path -Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Activating virtual environment and installing dependencies..."
& "venv\Scripts\python.exe" -m pip install -r requirements.txt

Write-Host "Starting backend server..."
& "venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
