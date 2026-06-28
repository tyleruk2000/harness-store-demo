"""Demo admin guard.

Not real auth — a single shared passcode sent in the ``X-Admin-Passcode`` header
gates write endpoints so the demo admin page can't be used by anyone who hasn't
been given the passcode. Compared in constant time.
"""

from __future__ import annotations

import secrets

from fastapi import Header, HTTPException, status

from app.core.config import settings


def require_admin(x_admin_passcode: str | None = Header(default=None)) -> None:
    """FastAPI dependency: 401 unless the correct admin passcode is supplied."""
    if not x_admin_passcode or not secrets.compare_digest(
        x_admin_passcode, settings.ADMIN_PASSCODE
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin passcode.",
            headers={"WWW-Authenticate": "X-Admin-Passcode"},
        )
