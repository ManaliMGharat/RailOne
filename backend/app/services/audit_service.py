from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_admin_action(
    db: Session,
    admin_id: Optional[int],
    action: str,
    entity: str,
    entity_id: Optional[str],
    description: str,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    log_entry = AuditLog(
        admin_id=admin_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        description=description,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
