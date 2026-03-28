from fastapi import APIRouter, Query
from utils.mock_data import generate_cost_data
from ml.cost_predictor import cost_predictor
from ml.anomaly_detector import anomaly_detector
import asyncio

router = APIRouter()

@router.get("/")
async def get_costs(range: int = Query(30, ge=1, le=365)):
    data = generate_cost_data(range)
    predictions, anomaly_check = await asyncio.gather(
        cost_predictor.predict_next_days(data, 7),
        anomaly_detector.detect(data[-1])
    )
    total = sum(
        d['EC2']+d['Lambda']+d['S3']+d['RDS']+d['CloudFront'] 
        for d in data
    )
    return {
        "success": True,
        "data": data,
        "predictions": predictions,
        "totalCost": round(total, 2),
        "moneySaved": 5210.60,
        "budget": 15000,
        "mlAnomaly": anomaly_check
    }

@router.get("/summary")
async def get_summary():
    return {
        "success": True,
        "data": {
            "totalThisMonth": 11750,
            "moneySaved": 5210.60,
            "totalAnomalies": 34,
            "optimizationsExecuted": 28,
            "savingsPercentage": 30.7,
            "budgetUsed": 78.3
        }
    }

@router.get("/burn-rate")
async def get_burn_rate():
    return {
        "success": True,
        "data": {
            "dailyBurn": 391.67,
            "avgDaily": 391.67,
            "projectedMonth": 12141,
            "daysRemaining": 3,
            "velocity": [342,378,401,356,389,412,391],
            "velocityChange": 4.2,
            "byService": [
                {"service":"EC2","spent":4821,"budget":6000},
                {"service":"Lambda","spent":1893,"budget":3000},
                {"service":"RDS","spent":1240,"budget":2000},
                {"service":"S3","spent":642,"budget":1500}
            ]
        }
    }
