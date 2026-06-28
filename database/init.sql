-- Database bootstrap. Mounted to the Postgres image's
-- /docker-entrypoint-initdb.d, so it runs ONCE when the data volume is first
-- created — BEFORE Alembic creates any tables.
--
-- Keep this to database-level setup only (extensions, roles). It must NOT create
-- application tables (Alembic owns the schema) or insert seed rows (the backend
-- entrypoint seeds idempotently after migrations).

-- Case-insensitive text + trigram search are handy if the demo grows; harmless if unused.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
