"""Order number format + uniqueness."""

from __future__ import annotations

import re

from app.services.order_service import generate_order_number

PATTERN = re.compile(r"^CRX-\d{8}-[0-9A-F]{8}$")


def test_format_matches_pattern():
    assert PATTERN.match(generate_order_number())


def test_high_volume_uniqueness():
    numbers = {generate_order_number() for _ in range(10_000)}
    # 3 random bytes = 16.7M space; 10k draws should not collide in practice.
    assert len(numbers) == 10_000
