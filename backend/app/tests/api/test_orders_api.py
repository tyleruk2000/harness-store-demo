"""Order API."""

from __future__ import annotations

from app.tests.factories import make_product, order_payload


def test_create_order_201_with_server_totals(client, db_session):
    product = make_product(db_session, price="40.00", stock_quantity=10)
    db_session.flush()
    res = client.post("/orders", json=order_payload(product.id, quantity=2))
    assert res.status_code == 201
    body = res.json()
    assert body["order_number"].startswith("CRX-")
    assert body["subtotal"] == 80.0
    assert body["status"] == "paid"
    assert len(body["items"]) == 1
    assert body["items"][0]["line_total"] == 80.0


def test_create_order_ignores_client_supplied_price(client, db_session):
    product = make_product(db_session, price="40.00", stock_quantity=10)
    db_session.flush()
    payload = order_payload(product.id, quantity=1)
    payload["items"][0]["price"] = 1  # attacker tries to set price; must be ignored
    payload["total"] = 1
    res = client.post("/orders", json=payload)
    assert res.status_code == 201
    assert res.json()["subtotal"] == 40.0  # server price wins


def test_create_order_insufficient_stock_409(client, db_session):
    product = make_product(db_session, stock_quantity=1)
    db_session.flush()
    res = client.post("/orders", json=order_payload(product.id, quantity=5))
    assert res.status_code == 409
    assert res.json()["detail"]["product_id"] == product.id


def test_create_order_unknown_product_422(client, db_session):
    make_product(db_session)
    db_session.flush()
    res = client.post("/orders", json=order_payload(999999, quantity=1))
    assert res.status_code == 422


def test_create_order_validation_errors(client, db_session):
    product = make_product(db_session)
    db_session.flush()
    # empty items
    bad = order_payload(product.id)
    bad["items"] = []
    assert client.post("/orders", json=bad).status_code == 422
    # bad email
    bad_email = order_payload(product.id)
    bad_email["customer_email"] = "not-an-email"
    assert client.post("/orders", json=bad_email).status_code == 422
    # qty 0
    bad_qty = order_payload(product.id)
    bad_qty["items"] = [{"product_id": product.id, "quantity": 0}]
    assert client.post("/orders", json=bad_qty).status_code == 422


def test_get_order_by_id_and_404(client, db_session):
    product = make_product(db_session, stock_quantity=5)
    db_session.flush()
    created = client.post("/orders", json=order_payload(product.id)).json()
    res = client.get(f"/orders/{created['id']}")
    assert res.status_code == 200
    assert res.json()["order_number"] == created["order_number"]
    assert client.get("/orders/999999").status_code == 404


def test_orders_by_email(client, db_session):
    product = make_product(db_session, stock_quantity=10)
    db_session.flush()
    client.post("/orders", json=order_payload(product.id, customer_email="a@example.com"))
    client.post("/orders", json=order_payload(product.id, customer_email="b@example.com"))

    a_orders = client.get("/orders/by-email/a@example.com").json()
    assert len(a_orders) == 1 and a_orders[0]["customer_email"] == "a@example.com"
    # case-insensitive
    assert len(client.get("/orders/by-email/A@EXAMPLE.COM").json()) == 1
    # unknown email → empty list
    assert client.get("/orders/by-email/nobody@example.com").json() == []


def test_list_orders(client, db_session):
    product = make_product(db_session, stock_quantity=10)
    db_session.flush()
    client.post("/orders", json=order_payload(product.id))
    assert len(client.get("/orders").json()) >= 1
