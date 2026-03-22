# 🦙 OllamaGate — Ollama Deploy Platform

> A full-stack personal deployment platform for managing, monitoring, and serving [Ollama](https://ollama.com/) models across multiple cloud providers — with a sleek dashboard, API key management, and real-time usage tracking.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Roadmap](#roadmap)

---

## 🔍 Overview

**OllamaGate** is a self-hosted platform for deploying and managing Ollama LLM instances across multiple cloud providers (RunPod, AWS, GCP, Azure, Modal). It provides a unified dashboard to:

- Deploy Ollama to various compute backends
- Monitor real-time model usage and token stats
- Manage API keys scoped per model
- Estimate and track cloud compute costs

This project is designed for **personal use** — authentication is intentionally simplified (no JWT, no password verification) and can be hardened for production as needed.

---

## ✨ Features

- 🚀 **Multi-Provider Deployment** — Deploy Ollama to RunPod, AWS Lambda, GCP Cloud Run, Azure, or Modal
- 📊 **Live Dashboard** — Real-time stats (requests, tokens, latency, cost) via interactive charts (Recharts)
- 🔑 **API Key Management** — Create, manage, and revoke model-scoped API keys
- 🤖 **Model Management** — View available models, pull new ones, and track their cache status
- 💰 **Cost Estimation** — Per-provider GPU/compute cost tracking with configurable pricing overrides
- 🌐 **Landing Page** — Public-facing entry page with routing to the login and app dashboard
- 📦 **MongoDB Backend** — Async MongoDB via `motor` for high-throughput, document-native storage
- ⚡ **Redis Caching** — Session and response caching via Redis

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                      Browser                         │
│           React (Vite + TypeScript + TW)             │
│  LandingPage → LoginPage → Dashboard / Models / Keys │
└────────────────────┬─────────────────────────────────┘
                     │ HTTP (Axios)
┌────────────────────▼─────────────────────────────────┐
│               FastAPI Backend                        │
│   /auth   /models   /keys   /deploy   /usage         │
└──────┬──────────────────────┬───────────────────────-┘
       │                      │
┌──────▼──────┐       ┌───────▼──────┐
│  MongoDB    │       │   Redis      │
│ (motor)     │       │  (caching)   │
└─────────────┘       └──────────────┘
                              │
              ┌───────────────▼──────────────────┐
              │           Ollama Instance         │
              │   (local or cloud-deployed)       │
              └──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Layer       | Technology                              |
|-------------|------------------------------------------|
| Framework   | [FastAPI](https://fastapi.tiangolo.com/) |
| Database    | [MongoDB](https://www.mongodb.com/) via [Motor](https://motor.readthedocs.io/) (async) |
| Caching     | [Redis](https://redis.io/)               |
| Validation  | [Pydantic v2](https://docs.pydantic.dev/) + `pydantic-settings` |
| HTTP Client | [HTTPX](https://www.python-httpx.org/)   |
| Server      | [Uvicorn](https://www.uvicorn.org/)      |

### Frontend
| Layer        | Technology                                          |
|--------------|------------------------------------------------------|
| Framework    | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool   | [Vite 8](https://vitejs.dev/)                        |
| Styling      | [Tailwind CSS v4](https://tailwindcss.com/)          |
| Routing      | [React Router v7](https://reactrouter.com/)          |
| Data Fetching| [TanStack Query v5](https://tanstack.com/query)      |
| HTTP Client  | [Axios](https://axios-http.com/)                     |
| Charts       | [Recharts](https://recharts.org/)                    |
| Icons        | [Lucide React](https://lucide.dev/)                  |
| Forms        | [React Hook Form](https://react-hook-form.com/)      |
| Mocking      | [MSW (Mock Service Worker)](https://mswjs.io/)       |

---

## 📁 Project Structure

```
ollamma-dev/
├── backend/                     # FastAPI application
│   ├── core/
│   │   ├── config.py            # App settings (Pydantic BaseSettings)
│   │   ├── database.py          # MongoDB connection lifecycle
│   │   └── security.py         # Auth helpers (get_current_user)
│   ├── db/
│   │   └── models.py            # Pydantic DB models (User, ApiKey, Usage, etc.)
│   ├── routers/
│   │   └── auth.py              # /auth endpoints (login, logout, me)
│   ├── schemas/                 # Request/Response Pydantic schemas
│   ├── services/
│   │   └── providers/           # Cloud provider deployment logic
│   ├── main.py                  # FastAPI app entrypoint with MongoDB lifespan
│   └── requirements.txt         # Python dependencies
│
└── Frontend/                    # React application
    ├── src/
    │   ├── api/                 # Axios API client setup
    │   ├── components/          # Reusable components
    │   │   ├── Layout.tsx       # App shell with sidebar navigation
    │   │   ├── PrivateRoute.tsx # Protected route guard
    │   │   ├── StatCard.tsx     # Memoized KPI stat card
    │   │   └── Spinner.tsx      # Loading indicator
    │   ├── hooks/               # Custom React hooks
    │   ├── lib/                 # Shared utilities / query client
    │   ├── mocks/               # MSW mock handlers
    │   ├── pages/
    │   │   ├── LandingPage.tsx  # Public landing page
    │   │   ├── LoginPage.tsx    # Authentication page
    │   │   ├── DashboardPage.tsx# Main stats dashboard
    │   │   ├── ModelsPage.tsx   # Ollama model browser & pull
    │   │   ├── KeysPage.tsx     # API key management
    │   │   └── NotFoundPage.tsx # 404 fallback
    │   ├── types/               # TypeScript type definitions
    │   ├── App.tsx              # Router configuration
    │   └── main.tsx             # React entry point
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11+ with `pip`
- **Node.js** 18+ with `npm`
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Redis** running locally (or a Redis Cloud URL)
- **Ollama** installed and running (`http://127.0.0.1:11434` by default)

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (see [Configuration](#configuration) below).

5. **Run the development server:**
   ```bash
   uvicorn backend.main:app --reload
   ```

   The API will be available at `http://localhost:8000`.
   Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the environment:**
   ```bash
   # .env.development already exists — update VITE_API_URL if needed
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

---

## ⚙️ Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# ── Required ──────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/ollamagate
REDIS_URL=redis://localhost:6379

# ── Ollama ────────────────────────────────────────────
OLLAMA_BASE_URL=http://127.0.0.1:11434

# ── Cloud Provider Credentials (optional) ─────────────
RUNPOD_API_KEY=your_runpod_key
AWS_REGION=us-east-1
GCP_PROJECT=your-gcp-project
AZURE_SUBSCRIPTION=your-azure-subscription-id

# ── Pricing Overrides (optional) ──────────────────────
MODAL_GPU_COST_PER_SECOND=0.000533
RUNPOD_GPU_COST_PER_SECOND=0.00022
AWS_LAMBDA_COST_PER_GB_SECOND=0.0000166667
GCP_RUN_CPU_COST_PER_SECOND=0.00002400
AZURE_CPU_COST_PER_SECOND=0.000024
```

---

## 📡 API Reference

| Method | Endpoint      | Description                              |
|--------|---------------|------------------------------------------|
| `GET`  | `/`           | Health check — returns backend status    |
| `POST` | `/auth/login` | Login (personal mode — auth bypassed)    |
| `POST` | `/auth/logout`| Logout                                   |
| `GET`  | `/auth/me`    | Returns current user info                |

> 📘 Full interactive API docs are available at `/docs` (Swagger UI) and `/redoc` when the backend is running.

---

## 🗄️ Data Models

| Model                 | Description                                      |
|-----------------------|--------------------------------------------------|
| `UserDB`              | User account with email and hashed password      |
| `ApiKeyDB`            | API key scoped to a specific model               |
| `UsageLogDB`          | Token and latency usage per API call             |
| `ModelCacheDB`        | Tracks pulled Ollama models and their status     |
| `ProviderDeploymentDB`| Cloud provider deployment records                |
| `CostEstimateLogDB`   | Estimated cost breakdowns per provider/model     |

---

## 🗺️ Roadmap

- [ ] Full JWT-based authentication for multi-user support
- [ ] Live WebSocket streaming for model responses
- [ ] Provider deployment automation (RunPod, AWS, GCP, Azure, Modal)
- [ ] Model benchmarking and comparison view
- [ ] Docker Compose setup for one-command local deployment
- [ ] Rate limiting and quota enforcement per API key

---

## 📄 License

This project is for personal use. All rights reserved.
