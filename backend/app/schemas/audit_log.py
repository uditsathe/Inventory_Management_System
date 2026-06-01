from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Any


class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    actor: str
    entity_type: str
    entity_id: str
    action: str
    before: Optional[Any] = None
    after: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)
