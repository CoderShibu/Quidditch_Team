from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

TRIGGERS = {
    "auto": {
        "enabled": False,
        "stopAfterHours": 2,
        "terminateAfterDays": 1,
        "action": "Stop Instance",
        "services": {"ec2": True, "lambda": True, "rds": False, "s3": False}
    },
    "manual": {
        "enabled": True,
        "alertMethod": "Both",
        "alertAfterHours": 1,
        "showCostInAlert": True,
        "requireConfirmation": True
    }
}

class TriggerRules(BaseModel):
    auto: dict = {}
    manual: dict = {}

@router.get("/")
async def get_triggers():
    return {"success": True, "data": TRIGGERS}

@router.post("/save")
async def save_triggers(rules: TriggerRules):
    if rules.auto:
        TRIGGERS["auto"].update(rules.auto)
    if rules.manual:
        TRIGGERS["manual"].update(rules.manual)
    return {"success": True, "data": TRIGGERS}
