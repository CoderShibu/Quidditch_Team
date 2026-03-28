from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.groq_service import get_ai_insights, analyze_anomaly_groq
from services.gemini_service import chat_with_ai, generate_report_summary
from ml.cost_optimizer import cost_optimizer

router = APIRouter()

class InsightRequest(BaseModel):
    totalCost: float = 11750
    dailyBurn: float = 391.67
    budget: float = 15000
    budgetUsed: float = 78.3
    ec2: float = 4821
    lambda_: float = Field(1893, alias="lambda")
    rds: float = 1240
    s3: float = 642
    anomalies: int = 7
    saved: float = 5210

    model_config = {"populate_by_name": True}

class AnomalyAnalysisRequest(BaseModel):
    type: str
    service: str
    resourceId: str
    costImpact: float
    cascade: list = []

class ChatRequest(BaseModel):
    message: str
    history: list = []
    costContext: dict = {}

class ReportRequest(BaseModel):
    selectedSections: list
    costData: dict

@router.post("/insight")
async def ai_insight(req: InsightRequest):
    result = await get_ai_insights(req.model_dump())
    return {"success": True, "data": result}

@router.post("/analyze-anomaly")
async def analyze_anomaly(req: AnomalyAnalysisRequest):
    result = await analyze_anomaly_groq(req.model_dump())
    return {"success": True, "data": result}

@router.post("/chat")
async def chat(req: ChatRequest):
    result = await chat_with_ai(
        req.message, req.history, req.costContext
    )
    return {"success": True, "data": result}

@router.post("/generate-report-summary")
async def report_summary(req: ReportRequest):
    summary = await generate_report_summary(req.costData)
    return {"success": True, "data": {"summary": summary}}

@router.post("/optimize")
async def optimize(anomalies: list):
    recommendations = cost_optimizer.analyze_optimizations(anomalies)
    return {"success": True, "data": recommendations}
