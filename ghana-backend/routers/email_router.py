from fastapi import APIRouter
from pydantic import BaseModel
from services.email_service import send_report_email
from services.gemini_service import generate_report_summary

router = APIRouter()

class EmailRequest(BaseModel):
    recipientEmail: str = ""
    selectedSections: list
    reportData: dict
    pdfBase64: str = ""

@router.post("/send-report")
async def send_report(req: EmailRequest):
    summary = await generate_report_summary(req.reportData)
    pdf_bytes = None
    if req.pdfBase64:
        import base64
        pdf_bytes = base64.b64decode(req.pdfBase64)

    result = await send_report_email(
        req.recipientEmail,
        req.selectedSections,
        req.reportData,
        summary,
        pdf_bytes
    )
    return {"success": result["success"], "data": result}
