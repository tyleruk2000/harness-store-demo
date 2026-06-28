"""Admin passcode guard on POST /products."""

from __future__ import annotations

from app.core.config import settings

_PAYLOAD = {
    "name": "Guarded", "category": "harnesses",
    "short_description": "x", "price": 10, "use_case": "sport",
}


def test_missing_header_401(client):
    assert client.post("/products", json=_PAYLOAD).status_code == 401


def test_empty_header_401(client):
    res = client.post("/products", json=_PAYLOAD, headers={"X-Admin-Passcode": ""})
    assert res.status_code == 401


def test_wrong_passcode_401(client):
    res = client.post("/products", json=_PAYLOAD, headers={"X-Admin-Passcode": "nope"})
    assert res.status_code == 401


def test_correct_passcode_passes(client):
    res = client.post(
        "/products", json=_PAYLOAD, headers={"X-Admin-Passcode": settings.ADMIN_PASSCODE}
    )
    assert res.status_code == 201


def test_admin_verify_rejects_and_accepts(client):
    assert client.get("/admin/verify").status_code == 401
    assert client.get("/admin/verify", headers={"X-Admin-Passcode": "wrong"}).status_code == 401
    ok = client.get("/admin/verify", headers={"X-Admin-Passcode": settings.ADMIN_PASSCODE})
    assert ok.status_code == 200 and ok.json() == {"ok": True}
