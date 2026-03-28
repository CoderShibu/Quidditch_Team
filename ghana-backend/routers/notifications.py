from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter()

NOTIFICATIONS = [
    {"id": 1, "title": "Critical anomaly detected", "message": "Idle EC2 instance i-04ab7c2f has been running at <1% CPU for 72 hours.", "type": "anomaly", "severity": "critical", "read": False, "createdAt": (datetime.now() - timedelta(hours=1)).isoformat()},
    {"id": 2, "title": "Budget threshold warning", "message": "Monthly spend has crossed 75% of your $15,000 budget.", "type": "budget", "severity": "warning", "read": False, "createdAt": (datetime.now() - timedelta(hours=3)).isoformat()},
    {"id": 3, "title": "Optimization applied successfully", "message": "Staged database stopped. $120.00 saved this month.", "type": "optimization", "severity": "success", "read": True, "createdAt": (datetime.now() - timedelta(hours=5)).isoformat()},
    {"id": 4, "title": "Lambda concurrency spike", "message": "fn-orders-handler exceeded concurrency limit — 892 concurrent executions.", "type": "anomaly", "severity": "high", "read": False, "createdAt": (datetime.now() - timedelta(hours=8)).isoformat()},
    {"id": 5, "title": "Weekly report generated", "message": "Your Ghana Cloud Guard weekly summary is ready to download.", "type": "report", "severity": "info", "read": True, "createdAt": (datetime.now() - timedelta(days=1)).isoformat()},
]

@router.get("/")
async def get_notifications():
    return {"success": True, "data": NOTIFICATIONS}

@router.post("/{notif_id}/read")
async def mark_read(notif_id: int):
    for n in NOTIFICATIONS:
        if n["id"] == notif_id:
            n["read"] = True
            return {"success": True, "data": n}
    return {"success": False, "data": None}

@router.post("/read-all")
async def mark_all_read():
    for n in NOTIFICATIONS:
        n["read"] = True
    return {"success": True, "data": NOTIFICATIONS}

@router.get("/unread-count")
async def unread_count():
    count = len([n for n in NOTIFICATIONS if not n["read"]])
    return {"success": True, "data": {"count": count}}
