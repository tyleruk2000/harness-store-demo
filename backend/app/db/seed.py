"""Canonical, idempotent product seed.

``PRODUCT_CATALOG`` is the single source of truth for demo data. ``seed()`` only
inserts when the table is empty, so it's safe to run on every startup. Run with
``--dump-sql`` to regenerate ``database/seed.sql`` (a derived snapshot for manual
``psql`` loading — never auto-run).

    python -m app.db.seed              # seed the DB if empty
    python -m app.db.seed --dump-sql   # print INSERT statements to stdout
"""

from __future__ import annotations

import sys
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.product import Product

# image_url points at frontend-served local assets (public/images/products/<slug>.webp);
# a per-product branded SVG fallback renders if an asset is ever missing.
PRODUCT_CATALOG: list[dict[str, object]] = [
    # ---------------- Harnesses ----------------
    dict(
        name="Cloudloop Sport Harness", category="harnesses", use_case="sport",
        price=Decimal("89.00"), stock_quantity=42, weight=Decimal("320"),
        colour="Chalk Blue", rating=Decimal("4.7"), featured=True,
        image_url="/images/products/cloudloop-sport-harness.webp",
        short_description="Featherlight all-day sport harness with cloud-soft leg loops.",
        long_description=(
            "The Cloudloop is built for long days clipping bolts. A breathable "
            "waistbelt spreads load evenly while you hang and project, and the "
            "pre-threaded buckle means you're tied in and climbing in seconds. "
            "Four pre-shaped gear loops keep your rack tidy and reachable."
        ),
    ),
    dict(
        name="Alpine Gecko Harness", category="harnesses", use_case="alpine",
        price=Decimal("119.00"), stock_quantity=23, weight=Decimal("280"),
        colour="Moss Green", rating=Decimal("4.8"), featured=True,
        image_url="/images/products/alpine-gecko-harness.webp",
        short_description="Stripped-back alpine harness that packs down to a fist.",
        long_description=(
            "When every gram counts, the Alpine Gecko delivers. Ice-clipper slots, "
            "adjustable leg loops to fit over big boots, and a packable profile make "
            "it the harness you forget you're wearing on the approach."
        ),
    ),
    dict(
        name="Big Wall Badger Harness", category="harnesses", use_case="big wall",
        price=Decimal("139.00"), stock_quantity=15, weight=Decimal("540"),
        colour="Granite Grey", rating=Decimal("4.6"), featured=False,
        image_url="/images/products/big-wall-badger-harness.webp",
        short_description="Plush, load-hauling harness for days that turn into nights.",
        long_description=(
            "Padded like an armchair because you'll be in it for a while. The Big "
            "Wall Badger carries a monster rack, takes a haul line without complaint, "
            "and keeps you comfortable through every belay on the route."
        ),
    ),
    dict(
        name="Indoor Otter Harness", category="harnesses", use_case="indoor",
        price=Decimal("55.00"), stock_quantity=64, weight=Decimal("360"),
        colour="Sunset Orange", rating=Decimal("4.5"), featured=False,
        image_url="/images/products/indoor-otter-harness.webp",
        short_description="Friendly, hard-wearing harness for gym sessions and first leads.",
        long_description=(
            "The Otter is the perfect first harness: easy double-back buckles, a "
            "comfy fixed-leg fit, and bright colours so you spot your kit in the "
            "gear pile. Tough enough to survive years of top-rope laps."
        ),
    ),
    dict(
        name="Trad Yeti Harness", category="harnesses", use_case="trad",
        price=Decimal("109.00"), stock_quantity=19, weight=Decimal("430"),
        colour="Ochre", rating=Decimal("4.7"), featured=False,
        image_url="/images/products/trad-yeti-harness.webp",
        short_description="Five-gear-loop workhorse built to carry a full trad rack.",
        long_description=(
            "Racks of cams, nuts, slings and screwgates — the Trad Yeti swallows it "
            "all across five reinforced gear loops, with a supportive waistbelt that "
            "stays comfy on long multi-pitch belays."
        ),
    ),
    # ---------------- Helmets ----------------
    dict(
        name="CragGuard Helmet", category="helmets", use_case="sport",
        price=Decimal("64.00"), stock_quantity=37, weight=Decimal("240"),
        colour="Cloud White", rating=Decimal("4.6"), featured=True,
        image_url="/images/products/cragguard-helmet.webp",
        short_description="Vented hardshell helmet that shrugs off rockfall and clumsy belayers.",
        long_description=(
            "A tough ABS shell over an EPS liner soaks up impacts from above and "
            "below. Big side vents keep your head cool on sunny pitches, and the "
            "dial-fit cradle adjusts one-handed mid-route."
        ),
    ),
    dict(
        name="Summit Shell Helmet", category="helmets", use_case="alpine",
        price=Decimal("79.00"), stock_quantity=21, weight=Decimal("195"),
        colour="Glacier Blue", rating=Decimal("4.8"), featured=False,
        image_url="/images/products/summit-shell-helmet.webp",
        short_description="Ultralight foam helmet for big alpine days and long approaches.",
        long_description=(
            "At 195g you'll barely notice it on the walk-in, but the co-moulded "
            "foam construction is serious about protection. Four headlamp clips and "
            "a low-profile fit make it the choice for dawn starts."
        ),
    ),
    dict(
        name="PebbleLite Helmet", category="helmets", use_case="indoor",
        price=Decimal("49.00"), stock_quantity=53, weight=Decimal("260"),
        colour="Slate", rating=Decimal("4.3"), featured=False,
        image_url="/images/products/pebblelite-helmet.webp",
        short_description="Budget-friendly all-rounder that's happy indoors or at the crag.",
        long_description=(
            "Everything you need and nothing you don't. The PebbleLite is a "
            "comfortable, well-vented hardshell that takes a knock without fuss — "
            "ideal as a first lid or a loaner for new partners."
        ),
    ),
    # ---------------- Ropes ----------------
    dict(
        name="Sunset 9.8mm Rope", category="ropes", use_case="sport",
        price=Decimal("159.00"), stock_quantity=28, weight=Decimal("4100"),
        colour="Sunset Fade", rating=Decimal("4.9"), featured=True,
        image_url="/images/products/sunset-98mm-rope.webp",
        short_description="60m all-rounder single rope with a grippy, durable sheath.",
        long_description=(
            "A 9.8mm diameter hits the sweet spot between durability and handling — "
            "thick enough to project on, supple enough to clip fast. The bi-pattern "
            "weave marks the middle so you always find it at the lower-off."
        ),
    ),
    dict(
        name="Drycore 9.2mm Alpine Rope", category="ropes", use_case="alpine",
        price=Decimal("199.00"), stock_quantity=12, weight=Decimal("3500"),
        colour="Ice White", rating=Decimal("4.8"), featured=False,
        image_url="/images/products/drycore-92mm-alpine-rope.webp",
        short_description="70m dry-treated skinny single for fast-and-light missions.",
        long_description=(
            "A full dry treatment on core and sheath sheds water and resists freezing "
            "on snowy routes. At 9.2mm it's light on the rack and feeds smoothly "
            "through alpine belay devices when speed matters."
        ),
    ),
    dict(
        name="Gym Rat 10.2mm Rope", category="ropes", use_case="indoor",
        price=Decimal("109.00"), stock_quantity=34, weight=Decimal("4600"),
        colour="Volt Yellow", rating=Decimal("4.5"), featured=False,
        image_url="/images/products/gym-rat-102mm-rope.webp",
        short_description="Burly 35m gym rope built to survive endless top-rope laps.",
        long_description=(
            "A thick, hard-wearing 10.2mm sheath laughs off the wear of indoor "
            "lowering and auto-belay abuse. The 35m length is perfect for most "
            "walls, and the high-vis colour is easy to flake under gym lights."
        ),
    ),
    # ---------------- Carabiners ----------------
    dict(
        name="Featherlock Screwgate", category="carabiners", use_case="trad",
        price=Decimal("14.50"), stock_quantity=120, weight=Decimal("48"),
        colour="Anodised Violet", rating=Decimal("4.7"), featured=True,
        image_url="/images/products/featherlock-screwgate.webp",
        short_description="Featherweight screwgate locker for belays and anchors.",
        long_description=(
            "A keylock nose means no snagging on slings or bolts, and the smooth "
            "screwgate sleeve locks with a confident click. At just 48g it's the "
            "carabiner you'll want a dozen of on your rack."
        ),
    ),
    dict(
        name="TwistLock Belay Biner", category="carabiners", use_case="sport",
        price=Decimal("19.00"), stock_quantity=88, weight=Decimal("72"),
        colour="Jet Black", rating=Decimal("4.6"), featured=False,
        image_url="/images/products/twistlock-belay-biner.webp",
        short_description="Auto-locking HMS pear biner with an anti-cross-load keeper.",
        long_description=(
            "The twist-lock gate snaps shut automatically so you're never caught "
            "with an open locker. A captive bar keeps the belay device aligned and "
            "stops the dreaded cross-load on the gate."
        ),
    ),
    dict(
        name="WireGate Quickdraw Set", category="carabiners", use_case="sport",
        price=Decimal("74.00"), stock_quantity=40, weight=Decimal("570"),
        colour="Mixed Anodised", rating=Decimal("4.8"), featured=False,
        image_url="/images/products/wiregate-quickdraw-set.webp",
        short_description="Six wiregate quickdraws — light, snag-free, ready to send.",
        long_description=(
            "Wiregate carabiners cut weight and resist gate-flutter on hard clips. "
            "This set of six comes with grippy 12cm dogbones and a colour-coded "
            "bolt-end biner so you always clip the rope the right way."
        ),
    ),
    dict(
        name="BombProof HMS Screwgate", category="carabiners", use_case="alpine",
        price=Decimal("21.50"), stock_quantity=76, weight=Decimal("82"),
        colour="Steel Blue", rating=Decimal("4.7"), featured=False,
        image_url="/images/products/bombproof-hms-screwgate.webp",
        short_description="Big, burly pear locker for guide-mode belays and rescue rigs.",
        long_description=(
            "A large basket and high cross-section make the BombProof ideal for "
            "Munter hitches, guide-mode belays, and any time you want a locker you "
            "can grab with gloves on. Built to outlast the route."
        ),
    ),
]


def seed(db: Session) -> int:
    """Insert the catalog only if the products table is empty. Returns rows added."""
    existing = db.scalar(select(func.count()).select_from(Product))
    if existing:
        print(f"Seed skipped — {existing} products already present.")
        return 0
    db.add_all(Product(**row) for row in PRODUCT_CATALOG)
    db.commit()
    print(f"Seeded {len(PRODUCT_CATALOG)} products.")
    return len(PRODUCT_CATALOG)


def _sql_literal(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, Decimal)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def dump_sql() -> str:
    """Render the catalog as INSERT statements (derived snapshot for psql)."""
    cols = [
        "name", "category", "short_description", "long_description", "price",
        "image_url", "stock_quantity", "weight", "colour", "use_case", "rating", "featured",
    ]
    lines = [
        "-- DERIVED from app/db/seed.py — regenerate with `python -m app.db.seed --dump-sql`.",
        "-- Not auto-run. Apply manually AFTER `alembic upgrade head` creates the schema.",
        "",
    ]
    for row in PRODUCT_CATALOG:
        values = ", ".join(_sql_literal(row.get(c)) for c in cols)
        lines.append(
            f"INSERT INTO products ({', '.join(cols)}) VALUES ({values})\n"
            f"    ON CONFLICT DO NOTHING;"
        )
    return "\n".join(lines) + "\n"


def main() -> None:
    if "--dump-sql" in sys.argv:
        sys.stdout.write(dump_sql())
        return
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
