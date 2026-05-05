import uuid
from datetime import datetime, timezone


def build_audit_event(
    source: str,
    event_id: str,
    event_type: str,
    status: str,
    subject_id: str,
    details: dict
) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "audit_id": str(uuid.uuid4()),
        "source": source,
        "event_id": event_id,
        "event_type": event_type,
        "status": status,
        "subject_id": subject_id,
        "details": details,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
