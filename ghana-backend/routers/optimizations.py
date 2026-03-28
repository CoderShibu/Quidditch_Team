from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter()

OPTIMIZATIONS = [
    {"id": 1, "title": "Stopped idle staging database", "service": "RDS", "resourceId": "db-staging-01", "savedAmount": 120.00, "savedPerDay": 4.00, "appliedAt": (datetime.now() - timedelta(hours=2)).isoformat(), "status": "applied", "type": "stop-idle"},
    {"id": 2, "title": "Downsized overprovisioned EC2", "service": "EC2", "resourceId": "i-04ab2c3d", "savedAmount": 45.50, "savedPerDay": 1.52, "appliedAt": (datetime.now() - timedelta(days=1)).isoformat(), "status": "applied", "type": "downsize"},
    {"id": 3, "title": "Deleted 3 unattached Elastic IPs", "service": "EC2", "resourceId": "eip-multiple", "savedAmount": 12.00, "savedPerDay": 0.40, "appliedAt": (datetime.now() - timedelta(days=3)).isoformat(), "status": "applied", "type": "cleanup"},
    {"id": 4, "title": "Applied S3 lifecycle policy", "service": "S3", "resourceId": "bucket-prod-logs", "savedAmount": 67.20, "savedPerDay": 2.24, "appliedAt": (datetime.now() - timedelta(days=5)).isoformat(), "status": "applied", "type": "policy"},
    {"id": 5, "title": "Reserved instance recommendation", "service": "RDS", "resourceId": "db-prod-01", "savedAmount": 340.00, "savedPerDay": 11.33, "appliedAt": None, "status": "pending", "type": "reserved"},
    {"id": 6, "title": "Right-size Lambda memory", "service": "Lambda", "resourceId": "fn-orders-handler", "savedAmount": 28.80, "savedPerDay": 0.96, "appliedAt": (datetime.now() - timedelta(days=2)).isoformat(), "status": "applied", "type": "tuning"},
]

@router.get("/")
async def get_optimizations():
    return {"success": True, "data": OPTIMIZATIONS}

@router.get("/summary")
async def get_optimization_summary():
    applied = [o for o in OPTIMIZATIONS if o["status"] == "applied"]
    total_saved = sum(o["savedAmount"] for o in applied)
    return {
        "success": True,
        "data": {
            "totalSaved": round(total_saved, 2),
            "executedCount": len(applied),
            "pendingCount": len(OPTIMIZATIONS) - len(applied),
            "successRate": round((len(applied) / len(OPTIMIZATIONS)) * 100, 1)
        }
    }

@router.post("/{opt_id}/apply")
async def apply_optimization(opt_id: int):
    for o in OPTIMIZATIONS:
        if o["id"] == opt_id:
            o["status"] = "applied"
            o["appliedAt"] = datetime.now().isoformat()
            return {"success": True, "data": o}
    return {"success": False, "data": None}
