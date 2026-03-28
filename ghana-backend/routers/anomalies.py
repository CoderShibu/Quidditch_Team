from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter()

def _gen_anomalies():
    services = ["EC2", "Lambda", "RDS", "S3", "CloudFront", "EBS"]
    types = [
        {"title": "Idle EC2 Instance Detected", "type": "idle-instance", "description": "Instance i-0a1b2c3d has been running at <2% CPU for 72+ hours with no active connections."},
        {"title": "Lambda Runaway Execution", "type": "runaway-lambda", "description": "fn-process-orders invoked 847,000 times in 6 hours — 340% above baseline concurrency."},
        {"title": "Unused EBS Volume", "type": "unused-ebs", "description": "400GB gp2 volume vol-0x9f unattached for 18 days, accruing $32/day with zero utilization."},
        {"title": "S3 Egress Spike", "type": "egress-spike", "description": "Cross-region data transfer from us-east-1 to eu-west-1 jumped 1,200% today."},
        {"title": "RDS Over-Provisioned", "type": "over-provisioned", "description": "db.r5.2xlarge running at 8% CPU average. A db.t3.medium would handle current load."},
        {"title": "Elastic IP Not Attached", "type": "idle-eip", "description": "3 Elastic IPs allocated but not associated to any instance, costing $3.65/IP/month."},
        {"title": "NAT Gateway Spike", "type": "nat-spike", "description": "NAT Gateway data processed jumped from 40GB to 680GB in last 24h — potential misconfiguration."},
    ]
    severities = ["critical", "high", "medium", "low"]
    statuses = ["open", "investigating", "resolved"]
    regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
    
    anomalies = []
    for i, t in enumerate(types):
        sev = severities[i % len(severities)]
        anomalies.append({
            "id": i + 1,
            "title": t["title"],
            "type": t["type"],
            "description": t["description"],
            "service": services[i % len(services)],
            "resourceId": f"{'i' if i%3==0 else 'vol' if i%3==1 else 'fn'}-{random.randint(10000,99999):05x}",
            "region": regions[i % len(regions)],
            "severity": sev,
            "status": statuses[i % len(statuses)],
            "costImpact": round(random.uniform(8, 95), 2),
            "detectedAt": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
            "cascade": []
        })
    return anomalies

ANOMALIES = _gen_anomalies()

@router.get("/")
async def get_anomalies(severity: str = "", service: str = "", status: str = ""):
    data = ANOMALIES.copy()
    if severity:
        data = [a for a in data if a["severity"] == severity]
    if service:
        data = [a for a in data if a["service"] == service]
    if status:
        data = [a for a in data if a["status"] == status]
    return {"success": True, "data": data}

@router.post("/{anomaly_id}/resolve")
async def resolve_anomaly(anomaly_id: int):
    for a in ANOMALIES:
        if a["id"] == anomaly_id:
            a["status"] = "resolved"
            return {"success": True, "data": a}
    return {"success": False, "data": None}

@router.get("/trend")
async def get_trend():
    trend = []
    for i in range(14, 0, -1):
        date = (datetime.now() - timedelta(days=i)).strftime("%b %d")
        trend.append({
            "date": date,
            "count": random.randint(2, 8),
            "critical": random.randint(0, 2),
            "high": random.randint(1, 3)
        })
    return {"success": True, "data": trend}
