# Inventory & Order Management System

Full-stack inventory and order management system with FastAPI, PostgreSQL, and Vite + React + Tailwind.

## Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: Vite + React + Tailwind CSS + Recharts
- **Infrastructure**: Docker + Docker Compose

## Quick start (Docker)

```bash
cp .env.example .env
make up
```

- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- Frontend: http://localhost:3000

## Seed demo data

After starting, run:

```bash
make seed
```

## Available commands

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `make up`            | Build and start all services          |
| `make down`          | Stop all services                     |
| `make build`         | Build Docker images                   |
| `make logs`          | Tail logs for all services            |
| `make seed`          | Seed the database with demo data      |
| `make backend-shell` | Open a shell in the backend container |
