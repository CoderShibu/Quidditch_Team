from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter()

ALERTS = [
    {"id": 1, "title": "Budget threshold reached", "message": "Monthly spend has crossed 75% of $15,000 budget. Projected to exceed by Mar 31.", "severity": "critical", "status": "active", "service": "Billing", "createdAt": (datetime.now() - timedelta(hours=2)).isoformat(), "cost": None},
    {"id": 2, "title": "EC2 idle instance", "message": "i-04ab7c2f running at <1% CPU for 72 hours. Estimated waste: $21.60/day.", "severity": "high", "status": "active", "service": "EC2", "createdAt": (datetime.now() - timedelta(hours=5)).isoformat(), "cost": 21.60},
    {"id": 3, "title": "Lambda concurrency spike", "message": "fn-orders-handler hit 892 concurrent executions — 3x configured limit.", "severity": "high", "status": "investigating", "service": "Lambda", "createdAt": (datetime.now() - timedelta(hours=7)).isoformat(), "cost": 58.40},
    {"id": 4, "title": "S3 cross-region transfer", "message": "Unexpected 450GB transfer from us-east-1 to eu-west-1.", "severity": "medium", "status": "active", "service": "S3", "createdAt": (datetime.now() - timedelta(days=1)).isoformat(), "cost": 40.50},
    {"id": 5, "title": "RDS backup retention expired", "message": "Automated backups for prod-db are older than 7 days.", "severity": "low", "status": "resolved", "service": "RDS", "createdAt": (datetime.now() - timedelta(days=2)).isoformat(), "cost": None},
    {"id": 6, "title": "CloudFront cache hit rate low", "message": "Cache hit ratio dropped to 42% — increase TTL to reduce origin load.", "severity": "medium", "status": "active", "service": "CloudFront", "createdAt": (datetime.now() - timedelta(hours=14)).isoformat(), "cost": 12.80},
]

ALERT_SETTINGS = {
    "emailAlerts": True,
    "slackAlerts": False,
    "budgetThreshold": 80,
    "anomalyAutoResolve": True,
    "criticalOnly": False
}

class AlertSnooze(BaseModel):
    hours: int = 4

class AlertSettings(BaseModel):
    emailAlerts: bool = True
    slackAlerts: bool = False
    budgetThreshold: int = 80
    anomalyAutoResolve: bool = True
    criticalOnly: bool = False

@router.get("/")
async def get_alerts(severity: str = "", status: str = ""):
    data = ALERTS.copy()
    if severity:
        data = [a for a in data if a["severity"] == severity]
    if status:
        data = [a for a in data if a["status"] == status]
    return {"success": True, "data": data}

@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: int):
    for a in ALERTS:
        if a["id"] == alert_id:
            a["status"] = "resolved"
            return {"success": True, "data": a}
    return {"success": False, "data": None}

@router.post("/{alert_id}/snooze")
async def snooze_alert(alert_id: int, body: AlertSnooze):
    for a in ALERTS:
        if a["id"] == alert_id:
            a["status"] = "snoozed"
            a["snoozedUntil"] = (datetime.now() + timedelta(hours=body.hours)).isoformat()
            return {"success": True, "data": a}
    return {"success": False, "data": None}

@router.get("/settings")
async def get_alert_settings():
    return {"success": True, "data": ALERT_SETTINGS}

@router.post("/settings")
async def save_alert_settings(settings: AlertSettings):
    ALERT_SETTINGS.update(settings.dict())
    return {"success": True, "data": ALERT_SETTINGS}

@router.get("/summary")
async def get_alert_summary():
    active = len([a for a in ALERTS if a["status"] == "active"])
    critical = len([a for a in ALERTS if a["severity"] == "critical"])
    resolved = len([a for a in ALERTS if a["status"] == "resolved"])
    return {"success": True, "data": {"active": active, "critical": critical, "resolved": resolved, "total": len(ALERTS)}}
