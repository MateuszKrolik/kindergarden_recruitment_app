from uuid import uuid4
from datetime import datetime, timezone
from typing import TypeVar

from src.shared.types.event import EventEnvelope

T = TypeVar("T")


def create_event(
    type: str,
    source: str,
    version: str,
    payload: T,
) -> EventEnvelope[T]:
    return EventEnvelope(
        id=uuid4(),
        type=type,
        timestamp=datetime.now(timezone.utc),
        payload=payload,
        source=source,
        version=version,
    )
