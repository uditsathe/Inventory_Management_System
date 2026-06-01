.PHONY: up down build logs seed backend-shell dev

up:
	docker compose up --build

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

backend-shell:
	docker compose exec backend /bin/bash || docker compose exec backend /bin/sh

seed:
	docker compose exec backend python -m app.seed.seed_data
