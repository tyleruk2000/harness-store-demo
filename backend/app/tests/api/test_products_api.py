"""Product + category API."""

from __future__ import annotations

from app.models.product import UseCase
from app.tests.factories import make_product


def test_list_products_empty(client):
    assert client.get("/products").json() == []


def test_list_and_filter_products(client, db_session):
    make_product(db_session, name="Sport Harness", category="harnesses", use_case=UseCase.sport, featured=True)
    make_product(db_session, name="Alpine Helmet", category="helmets", use_case=UseCase.alpine)
    db_session.flush()

    all_products = client.get("/products").json()
    assert len(all_products) == 2

    harnesses = client.get("/products", params={"category": "harnesses"}).json()
    assert len(harnesses) == 1 and harnesses[0]["name"] == "Sport Harness"

    alpine = client.get("/products", params={"use_case": "alpine"}).json()
    assert len(alpine) == 1 and alpine[0]["name"] == "Alpine Helmet"

    featured = client.get("/products", params={"featured": "true"}).json()
    assert len(featured) == 1 and featured[0]["featured"] is True

    found = client.get("/products", params={"search": "sport"}).json()
    assert len(found) == 1


def test_price_is_serialized_as_number(client, db_session):
    make_product(db_session, price="89.00")
    db_session.flush()
    product = client.get("/products").json()[0]
    assert isinstance(product["price"], (int, float))
    assert product["price"] == 89.0


def test_get_product_by_id(client, db_session):
    product = make_product(db_session, name="Detail Harness")
    db_session.flush()
    res = client.get(f"/products/{product.id}")
    assert res.status_code == 200
    assert res.json()["name"] == "Detail Harness"


def test_get_missing_product_404(client):
    assert client.get("/products/424242").status_code == 404


def test_featured_endpoint(client, db_session):
    make_product(db_session, name="Star", featured=True)
    make_product(db_session, name="Plain", featured=False)
    db_session.flush()
    featured = client.get("/products/featured").json()
    assert [p["name"] for p in featured] == ["Star"]


def test_related_endpoint(client, db_session):
    base = make_product(db_session, name="Base", category="ropes")
    make_product(db_session, name="Sibling", category="ropes")
    db_session.flush()
    related = client.get(f"/products/{base.id}/related").json()
    names = {p["name"] for p in related}
    assert "Sibling" in names and "Base" not in names


def test_categories_endpoint(client, db_session):
    make_product(db_session, category="harnesses")
    make_product(db_session, category="harnesses")
    make_product(db_session, category="ropes")
    db_session.flush()
    cats = {c["name"]: c["count"] for c in client.get("/categories").json()}
    assert cats == {"harnesses": 2, "ropes": 1}


def test_create_product_requires_admin(client):
    payload = {
        "name": "New Harness", "category": "harnesses",
        "short_description": "x", "price": 50, "use_case": "sport",
    }
    assert client.post("/products", json=payload).status_code == 401


def test_create_product_with_admin(client, admin_headers):
    payload = {
        "name": "New Harness", "category": "harnesses",
        "short_description": "Brand new", "long_description": "Details",
        "price": 50.0, "stock_quantity": 5, "use_case": "sport",
        "weight": 300, "colour": "Red", "rating": 4.2, "featured": True,
    }
    res = client.post("/products", json=payload, headers=admin_headers)
    assert res.status_code == 201
    body = res.json()
    assert body["id"] > 0 and body["name"] == "New Harness"
    # now visible in the catalogue
    assert any(p["name"] == "New Harness" for p in client.get("/products").json())


def test_update_product_requires_admin(client, db_session):
    product = make_product(db_session, featured=False)
    db_session.flush()
    assert client.patch(f"/products/{product.id}", json={"featured": True}).status_code == 401


def test_update_product_marks_featured_and_stock(client, db_session, admin_headers):
    product = make_product(db_session, featured=False, stock_quantity=5)
    db_session.flush()
    res = client.patch(
        f"/products/{product.id}",
        json={"featured": True, "stock_quantity": 12},
        headers=admin_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["featured"] is True
    assert body["stock_quantity"] == 12


def test_update_missing_product_404(client, admin_headers):
    assert client.patch("/products/999999", json={"featured": True}, headers=admin_headers).status_code == 404


def test_create_product_validation_error(client, admin_headers):
    bad = {"name": "Bad", "category": "x", "short_description": "y", "price": -1, "use_case": "sport"}
    assert client.post("/products", json=bad, headers=admin_headers).status_code == 422
    bad_use = {"name": "Bad", "category": "x", "short_description": "y", "price": 1, "use_case": "spaceflight"}
    assert client.post("/products", json=bad_use, headers=admin_headers).status_code == 422
