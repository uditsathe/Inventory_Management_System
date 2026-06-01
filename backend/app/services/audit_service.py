from sqlalchemy.orm import Session
from ..models.audit_log import AuditLog


def log_action(
    db: Session,
    *,
    entity_type: str,
    entity_id: str,
    action: str,
    before: dict | None = None,
    after: dict | None = None,
    actor: str = "system",
) -> AuditLog:
    log = AuditLog(
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        before=before,
        after=after,
        actor=actor,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
