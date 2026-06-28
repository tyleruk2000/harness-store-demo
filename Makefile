# Crux — common tasks. Run `make help` for the list.
.DEFAULT_GOAL := help
.PHONY: help up up-d build down clean logs test test-backend test-frontend test-e2e seed-sql backend-shell

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## Build and start the full stack (foreground)
	docker compose up --build

up-d: ## Build and start the full stack (detached)
	docker compose up --build -d

build: ## Build all images
	docker compose build

down: ## Stop the stack (keep data)
	docker compose down

clean: ## Stop the stack and delete the database volume
	docker compose down -v

logs: ## Tail logs from all services
	docker compose logs -f

test: ## Run the FULL test suite in Docker (backend + frontend + e2e)
	./scripts/test.sh

test-backend: ## Run backend pytest in Docker
	docker compose -f docker-compose.test.yml run --build --rm backend-tests

test-frontend: ## Run frontend unit tests in Docker
	docker compose -f docker-compose.test.yml run --build --rm frontend-unit

test-e2e: ## Run Playwright E2E against a throwaway stack in Docker
	docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from e2e postgres-e2e backend-e2e frontend-e2e e2e

seed-sql: ## Regenerate database/seed.sql from the Python seed
	cd backend && python -m app.db.seed --dump-sql > ../database/seed.sql

backend-shell: ## Open a shell in the running backend container
	docker compose exec backend sh
