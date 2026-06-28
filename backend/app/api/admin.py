"""Admin session helpers."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import require_admin

router = APIRouter(tags=["admin"])


@router.get("/admin/verify", dependencies=[Depends(require_admin)])
def verify_admin() -> dict[str, bool]:
    """Return 200 if the X-Admin-Passcode header is valid, else 401.

    Lets the admin page gate the UI without a separate auth system.
    """
    return {"ok": True}
