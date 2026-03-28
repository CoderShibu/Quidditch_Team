from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
from dotenv import load_dotenv

load_dotenv()

from ml.model_trainer import train_all_models
from routers import (auth, costs, anomalies, alerts, 
                     optimizations, ai, notifications,
                     triggers, email_router, pdf_router)

scheduler = AsyncIOScheduler()

async def scan_for_anomalies():
    print("Ghana AI: Scanning for anomalies...")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Train ML models on startup in background
    asyncio.create_task(train_all_models())
    # Start background anomaly scanner every 60 seconds
    scheduler.add_job(scan_for_anomalies, 'interval', seconds=60)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(
    title="Ghana Cloud Intelligence API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(costs.router, prefix="/api/costs")
app.include_router(anomalies.router, prefix="/api/anomalies")
app.include_router(alerts.router, prefix="/api/alerts")
app.include_router(optimizations.router, prefix="/api/optimizations")
app.include_router(ai.router, prefix="/api/ai")
app.include_router(notifications.router, prefix="/api/notifications")
app.include_router(triggers.router, prefix="/api/triggers")
app.include_router(email_router.router, prefix="/api/email")
app.include_router(pdf_router.router, prefix="/api/pdf")

@app.get("/api/health")
async def health():
    return {"status": "Ghana AI is live", "version": "1.0.0"}
