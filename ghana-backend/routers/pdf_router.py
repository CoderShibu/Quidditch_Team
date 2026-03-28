from fastapi import APIRouter

router = APIRouter()

@router.post("/generate")
async def generate_pdf():
    return {"success": True, "message": "PDF generated via frontend jsPDF implementation"}
