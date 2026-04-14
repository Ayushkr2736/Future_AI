"""Shared utility functions used across services."""

import uuid
from datetime import datetime, timezone


def generate_id() -> str:
    """Generate a unique identifier string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return utc_now().isoformat()


def format_duration(seconds: int) -> str:
    """Convert seconds to a human-readable duration string.

    Examples:
        format_duration(0)   -> "0s"
        format_duration(65)  -> "1m 5s"
        format_duration(3661) -> "1h 1m 1s"
    """
    if seconds < 0:
        seconds = 0

    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)

    parts: list[str] = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")

    return " ".join(parts)
