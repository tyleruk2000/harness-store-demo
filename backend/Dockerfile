# syntax=docker/dockerfile:1
# Backend image. Build context is the REPO ROOT (so it can COPY database/seed.sql).
#   docker build -f backend/Dockerfile -t crux-backend:local .

# ---------- base ----------
FROM python:3.12-slim AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app

# ---------- deps (install into a relocatable prefix) ----------
FROM base AS deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --prefix=/install -r requirements.txt

# ---------- runtime (non-root) ----------
FROM base AS runtime
RUN useradd --create-home --uid 10001 appuser
COPY --from=deps /install /usr/local
COPY backend/ /app/
COPY database/seed.sql /app/database/seed.sql
RUN chmod +x /app/entrypoint.sh && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ---------- test (adds dev deps, runs pytest; bypasses migrate/seed entrypoint) ----------
FROM runtime AS test
USER root
COPY backend/requirements-dev.txt ./requirements-dev.txt
RUN pip install -r requirements-dev.txt
USER appuser
ENTRYPOINT []
CMD ["pytest"]
