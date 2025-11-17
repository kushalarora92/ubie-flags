# 🚀 UbieFlags — Feature Flag MVP

*A lightweight, explainable feature flag platform (MVP)*

This repository contains a **full-stack monorepo** implementing the MVP for a feature flag management system inspired by LaunchDarkly — with two core differentiators:

1. **Explainable feature flag evaluations**
2. **Lifecycle & hygiene visibility (e.g., last evaluated, stale flags)**

The project includes:

* **Backend:** NestJS + TypeORM + PostgreSQL
* **Frontend:** Next.js admin UI
* **Dev Environment:** Docker & Docker Compose
* **Monorepo Layout:** npm workspaces

---

## 📁 Project Structure

```
.
├── apps/
│   ├── api/        # NestJS backend (feature flag API)
│   └── web/        # Next.js frontend (admin UI)
├── docker-compose.yml
├── Makefile
├── package.json    # npm workspaces definition
└── README.md
```

---

# 🧠 Core Concepts

### 🟢 1. Feature Flags

Each flag is scoped by **environment** (`dev`, `staging`, `prod`) and includes:

* `key`
* `name / description`
* `state` (draft | live | deprecated)
* `default_value`
* `rules` (JSON logic: conditions + value)
* `last_evaluated_at`

Flags are uniquely identified by:
➡️ **(`key`, `environment`)**

### 🟡 2. Explainable Evaluation

`POST /evaluate` returns:

* evaluated value (true/false)
* matched rule
* fallback usage
* environment
* full human-readable explanation

### 🔵 3. Lifecycle & Hygiene

* `last_evaluated_at` automatically updated
* UI can surface “stale” flags (no evaluations for N days)

---

# 🐳 Running the App (Dev Mode)

The development environment uses **Docker Compose** to run:

* Postgres (db)
* Nest API (hot reload)
* Next Web (optional: can run locally or in Docker)

### 🔥 Start everything:

```bash
make up
```

This:

* Builds missing images (only on first run)
* Installs dependencies inside containers (if needed)
* Starts API with `npm run start:dev`
* Starts Web with `npm run dev` (if enabled)
* Starts Postgres with a persistent volume

Access web app:
👉 [http://localhost:3000](http://localhost:3000)

Access API (example):
👉 [http://localhost:3001/flags](http://localhost:3001/flags)

### 🛑 Stop everything:

```bash
make down
```

---

# ⚙️ Environment Variables

Dev uses environment variables injected via Docker Compose:

### API

```
DB_HOST=db
DB_PORT=5432
DB_USER=ubie
DB_PASSWORD=ubie
DB_NAME=ubieflags
NODE_ENV=development
```

### Web

```
NEXT_PUBLIC_API_URL=http://api:3000
```

(Next.js uses `NEXT_PUBLIC_` prefix for client-visible envs.)

---

# 🧱 Database Schema (Feature Flags)

Key columns:

| Column              | Type        | Description             |
| ------------------- | ----------- | ----------------------- |
| `id`                | uuid        | primary key             |
| `key`               | text        | flag key                |
| `environment`       | text        | dev/staging/prod        |
| `default_value`     | boolean     | fallback                |
| `rules`             | jsonb       | conditions + rule value |
| `state`             | enum        | draft/live/deprecated   |
| `last_evaluated_at` | timestamptz | tracking usage          |

Unique constraint:

```
UNIQUE(key, environment)
```

---

# 🔍 Evaluation Logic (MVP)

Pseudo-logic for `/evaluate`:

```
load flag by key + environment

for each rule in rules:
    if all rule.conditions match context:
        return rule.value (ON/OFF) with explanation

return default_value with fallback explanation
```

The API also updates `last_evaluated_at`.

---

# 🧪 Testing the API

Example request:

```json
POST /evaluate
{
  "flagKey": "new_onboarding",
  "environment": "prod",
  "context": { "country": "CA" }
}
```

Example response:

```json
{
  "result": true,
  "explanation": {
    "environment": "prod",
    "matchedRule": "country == 'CA'",
    "fallbackUsed": false
  }
}
```

### 📬 Postman Collection

A full feature-wise Postman collections are included under:

```
/postman-collections/
```

It provides ready-made requests for:

* Creating feature flags
* Listing flags
* Fetching a single flag
* Evaluating flags (`/evaluate`)
* Testing rule-matching scenarios
* Inspecting explanation objects

Import the JSON file into Postman to get started immediately.

---

# 🛠 Tech Stack

### Backend

* 🚀 NestJS
* 🟦 TypeScript
* 🗄️ PostgreSQL
* 🔗 TypeORM
* 📦 Docker

### Frontend

* ⚛️ Next.js
* 🟦 TypeScript

---

# 🧭 Development Philosophy (MVP)

We intentionally *did not* implement:

* Real-time flag propagation
* SDKs
* Custom environments
* RBAC/SSO
* Multivariate experiments
* Polished UI

The MVP exists to validate:

* Explainability improves debugging
* Lifecycle metadata helps flag hygiene

---

# 📌 Commands Summary

### Start dev stack

```bash
make up
```

### Stop dev stack

```bash
make down
```

---

# 📣 Notes

* This is a **demo MVP**, not production-ready.
* Compose setup is optimized for **hot reload** and rapid iteration.
* Dockerfiles are included but not used in the dev compose (optimized for local development).
