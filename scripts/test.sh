#!/usr/bin/env bash
# Run the full Crux test suite in Docker:
#   1. backend pytest (against an ephemeral Postgres)
#   2. frontend Vitest unit/component tests
#   3. Playwright E2E against a throwaway, seeded full stack
#
# Exits non-zero if any layer fails (CI-ready). Reports land in ./.test-output/.
set -euo pipefail

cd "$(dirname "$0")/.."
COMPOSE="docker compose -f docker-compose.test.yml"
mkdir -p .test-output/playwright-report

cleanup() {
  echo ""
  echo "==> Cleaning up test containers..."
  $COMPOSE down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "============================================================"
echo " 1/3  Backend tests (pytest + coverage)"
echo "============================================================"
$COMPOSE run --build --rm backend-tests

echo ""
echo "============================================================"
echo " 2/3  Frontend unit tests (Vitest)"
echo "============================================================"
$COMPOSE run --build --rm frontend-unit

echo ""
echo "============================================================"
echo " 3/3  End-to-end tests (Playwright vs a live seeded stack)"
echo "============================================================"
$COMPOSE up --build --abort-on-container-exit --exit-code-from e2e \
  postgres-e2e backend-e2e frontend-e2e e2e

echo ""
echo "============================================================"
echo " ✅  All test suites passed."
echo "     Reports: ./.test-output/ (backend-cov, backend-junit.xml, playwright-report)"
echo "============================================================"
