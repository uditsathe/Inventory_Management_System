# Inventory & Order Management System

A production-oriented, containerized full-stack application for managing products, customers, orders, and inventory. Built with **FastAPI**, **PostgreSQL**, and **Vite + React**, orchestrated via **Docker Compose** and deployable to **Render** (backend) and **Vercel** (frontend).

---

## Additions to Observe Beyond the Assessment Brief

The core assessment specifies CRUD APIs, a dashboard with summary KPIs, Docker, and live deployment. The following additions were implemented to improve usability, operability, and presentation without changing the fundamental scope of the system.

| Addition                                                                                                                                                   | Value                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Analytics dashboard** — orders-over-time line chart, best-sellers table, total revenue KPI, and interactive category/status breakdown modals (pie + bar) | Surfaces trends and composition at a glance; breakdown modals turn aggregate KPIs into actionable drill-down views |
| **Production hardening** — `/health` endpoint, CORS configuration for Vercel, `vercel.json` SPA rewrites, seed script for demo data                        | Supports deployment verification, cross-origin frontend hosting, deep-link refreshes, and realistic demos          |
| **Product detail page** with inline edit, single delete, bulk delete (checkbox selection), category filter, and sort (price / newest / oldest)             | Reduces friction for inventory managers working with large catalogues                                              |
| **Order detail page** with customer context, line-item table, and in-place status updates                                                                  | Fulfils order-inspection workflows beyond a flat list; links orders to customers and products                      |
| **Extended data model** — product category, supplier, unit, reorder level; customer address fields; order line items persisted with unit price snapshots   | Supports realistic business scenarios and accurate historical pricing on orders                                    |
| **Collapsible sidebar** with route-aware defaults (expanded on Dashboard, collapsed elsewhere)                                                             | Maximises content area on data-heavy pages while keeping navigation one click away on the overview                 |
| **Responsive layouts** — breakpoint-aware grids, stacked toolbars, and horizontally scrollable tables                                                      | Meets the assessment mobile/desktop requirement with layouts that remain usable on narrow viewports                |

---

## Frontend

**Stack:** Vite 5 · React 18 · React Router 6 · Tailwind CSS 3 · TanStack React Query · Axios · Recharts

### Application shell

| Component   | Path                       | Responsibility                                                                                     |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| `AppLayout` | `src/layout/AppLayout.jsx` | Two-column shell; manages sidebar collapse state per route                                         |
| `Sidebar`   | `src/layout/Sidebar.jsx`   | Primary navigation (Dashboard, Products, Customers, Orders); collapsible with persisted affordance |
| `Topbar`    | `src/layout/Topbar.jsx`    | Contextual page title derived from the active route                                                |

Global styles and design tokens live in `src/styles/base.css` (buttons, inputs, cards, KPI glow animations, `.figure` mono numerics) and `tailwind.config.cjs` (ocean blue palette, warm paper canvas, muted status ramps).

### Pages

| Route           | Page                | Capabilities                                                                                                                      |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`    | `DashboardPage`     | KPI tiles, 14-day orders volume chart, low-stock table, best-sellers table; clickable Products/Orders KPIs open breakdown overlay |
| `/products`     | `ProductsPage`      | Product list with category filter and sort; add form; bulk delete; links to detail                                                |
| `/products/:id` | `ProductDetailPage` | Read view, inline edit, delete                                                                                                    |
| `/customers`    | `CustomersPage`     | Customer list, inline add form, delete                                                                                            |
| `/orders`       | `OrdersPage`        | Order list with status dropdown, view/delete actions                                                                              |
| `/orders/new`   | `CreateOrderPage`   | Multi-line order creation with live total preview                                                                                 |
| `/orders/:id`   | `OrderDetailPage`   | Order summary, customer block, line items, status update, delete                                                                  |

### Shared components

| Component            | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `KpiCard`            | Compact metric tile with optional click handler and colour-coded icon   |
| `Table`              | Reusable data table with optional row selection; mono uppercase headers |
| `BreakdownOverlay`   | Modal with Recharts pie/bar charts for category or status distribution  |
| `ProductForm`        | Validated create/edit form for products                                 |
| `CustomerForm`       | Validated create form with address fields                               |
| `OrderLineItemsForm` | Dynamic line-item rows with per-line total calculation                  |

### Data layer

- `src/api/client.js` — Axios instance; base URL from `VITE_API_BASE_URL`
- `src/api/products.js`, `customers.js`, `orders.js`, `dashboard.js` — typed fetch/mutation helpers
- React Query manages caching, loading states, and post-mutation invalidation across all pages

---

## Backend

**Stack:** FastAPI · SQLAlchemy · Pydantic · psycopg2 · Uvicorn

### Architecture

```
backend/app/
├── main.py              # App factory, CORS, router registration, schema bootstrap
├── config.py            # Settings (DATABASE_URL, BACKEND_CORS_ORIGINS)
├── db.py                # Engine, session factory, Base
├── models/              # SQLAlchemy ORM — Product, Customer, Order, OrderItem, AuditLog
├── schemas/             # Pydantic request/response models
├── routers/             # HTTP endpoints grouped by resource
├── services/            # Business logic, validation, audit hooks
└── seed/seed_data.py    # Idempotent demo data loader
```

### API surface

| Group     | Endpoints                                                | Notes                                                                   |
| --------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Health    | `GET /`, `GET /health`                                   | Root returns API pointers; health for uptime checks                     |
| Products  | `POST/GET/PUT/DELETE /products`, `GET /products/{id}`    | Unique SKU enforcement; non-negative stock                              |
| Customers | `POST/GET/PUT/DELETE /customers`, `GET /customers/{id}`  | Unique email enforcement                                                |
| Orders    | `POST/GET/PUT/DELETE /orders`, `GET /orders/{id}`        | Multi-item orders; backend-calculated totals; stock decrement on create |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/orders_volume` | Aggregates for KPIs, low stock, best sellers, and chart data            |

Interactive OpenAPI docs: `/docs`

### Business logic (assessment rules + extensions)

- SKU and customer email uniqueness enforced at the service layer with `400` responses
- Order creation validates stock availability per line item; insufficient inventory returns `400` with product context
- Line totals and order total computed server-side from current product prices; persisted on `OrderItem` for history
- Stock quantities decremented atomically within the same transaction as order creation
- Audit entries written on create, update, and delete for products, customers, and orders

### Configuration

| Variable               | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string (`postgresql+psycopg2://…`) |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed frontend origins                 |

---

## Infrastructure & Operations

### Repository layout

```
├── backend/                 # FastAPI application + Dockerfile
├── frontend/                # Vite React application + Dockerfile + vercel.json
├── docker-compose.yml       # Production-like local stack (db, backend, frontend)
├── docker-compose.dev.yml   # Dev overrides — hot reload, port 3001
├── .env.example             # Environment variable template
├── Makefile                 # Convenience targets (up, dev, seed, logs)
├── dev.ps1 / dev.bat        # Windows entry points for dev compose
```

### Docker Compose services

| Service    | Image / build           | Port | Notes                                                   |
| ---------- | ----------------------- | ---- | ------------------------------------------------------- |
| `db`       | `postgres:16`           | 5432 | Named volume `postgres_data`; healthcheck gated startup |
| `backend`  | `./backend` Dockerfile  | 8000 | `python:3.11-slim-bookworm`; Uvicorn ASGI server        |
| `frontend` | `./frontend` Dockerfile | 3000 | `node:20-alpine`; Vite dev server in local compose      |

Credentials are injected via environment variables — nothing sensitive is hardcoded in source.

### Local development

**Full stack (Docker):**

```bash
cp .env.example .env
make up          # or: docker compose up --build
make seed        # populate demo products, customers, orders
```

| URL                        | Service     |
| -------------------------- | ----------- |
| http://localhost:3000      | Frontend    |
| http://localhost:8000      | Backend API |
| http://localhost:8000/docs | Swagger UI  |

**Hot reload (Windows):**

```powershell
.\dev.ps1        # frontend on http://localhost:3001 with volume mounts
```

### Deployment

| Tier                       | Platform                             | Configuration highlights                                                                                |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Backend + PostgreSQL       | [Render](https://render.com)         | Root dir `backend`; Docker runtime; Internal `DATABASE_URL`; `BACKEND_CORS_ORIGINS` includes Vercel URL |
| Frontend                   | [Vercel](https://vercel.com)         | Root dir `frontend`; build `npm run build`; output `dist`; `VITE_API_BASE_URL` → Render backend URL     |
| Backend image (submission) | [Docker Hub](https://hub.docker.com) | `docker build -t <user>/inventory-backend ./backend && docker push …`                                   |

**Production seeding (Render free tier has no shell):** run `python -m app.seed.seed_data` locally against the Postgres **External** URL with `DATABASE_URL` set.

### Live URLs

| Environment | URL                                                    |
| ----------- | ------------------------------------------------------ |
| Frontend    | _https://your-app.vercel.app_                          |
| Backend API | _https://your-backend.onrender.com_                    |
| API Docs    | _https://your-backend.onrender.com/docs_               |
| Docker Hub  | _https://hub.docker.com/r/your-user/inventory-backend_ |

Replace placeholders with your deployed endpoints for submission.

### Makefile reference

| Command     | Description                            |
| ----------- | -------------------------------------- |
| `make up`   | Build and start all services           |
| `make dev`  | Start with hot-reload overrides        |
| `make down` | Stop all services                      |
| `make seed` | Seed database inside backend container |
| `make logs` | Tail combined service logs             |

---

## Assessment compliance

This project satisfies the assessment requirements for: React + FastAPI + PostgreSQL stack; full product/customer/order CRUD with specified business rules; responsive dashboard; Dockerfiles, `.dockerignore`, `docker-compose.yml`, named Postgres volume; and deployment to Render + Vercel with public URLs.
