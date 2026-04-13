# Multi-Tenant Inventory & Order Management SaaS

A production-ready, full-stack Multi-Tenant software system designed to isolate and process complex B2B inventory operations. Features a scalable FastAPI backend with strictly-decoupled PostgreSQL tenancy, and an interactive React/Vite web application that pairs an admin dashboard with a Point-of-Sale (eCommerce storefront) interface.

## 🚀 Key Features

* **Strict Data Tenancy**: Complete database isolation using context-vars through the entire Pydantic and SQLAlchemy mapping pipelines.
* **Point-of-Sale Storefront**: Real-time checkout cart seamlessly interacting with the `Orders` database logic and synchronously applying Stock quantity subtraction.
* **Premium Client Application**: Fast, glassmorphic UI executed via React, Vite, and pure CSS variables.
* **Secure Authentication**: Advanced token hashing using standard `bcrypt` packages with seamless custom Axios UI routing intercepts.
* **Background Process Framework**: Configured natively with Redis and Celery to process heavy data extraction without choking the FastAPI Event Loop.

## 💻 Tech Stack
- **Backend Architecture:** Python, FastAPI, SQLAlchemy, Alembic, Celery, Redis.
- **Frontend Architecture:** TypeScript, React, Vite, Lucide-React.
- **Database Architecture:** PostgreSQL (Dockerized instances).

## 🛠️ Quick Start

**1. Spin up the Database Container**
```bash
docker-compose up -d
```
*(Runs persistent PostgreSQL on local port 5433 mapped via `inventory_db`)*

**2. Initialize the Backend API**
```bash
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```
*(The backend serves traffic over `http://127.0.0.1:8000/api/v1` and autogenerates Swagger docs at `/docs`)*

**3. Initialize the React UI**
```bash
cd frontend
npm install
npm run dev
```
*(The frontend application bridges seamlessly to backend operations and serves natively on `http://localhost:5173`)*
