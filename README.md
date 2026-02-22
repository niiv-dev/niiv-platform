# NIIV

> The foundation for Node & Vite applications.

NIIV is an interactive scaffolding engine that generates production-ready:

- Node.js backend
- Vite + React frontend
- Simple HTML frontend
- Fullstack applications (separate or unified)

It gives you a working, deployable base in seconds.

---

# What Problem NIIV Solves

Every time you start a project, you:

- Create backend structure
- Setup Express
- Add routes
- Add proxy for frontend
- Configure Vite
- Setup environment files
- Connect frontend to backend

NIIV automates this entire foundation layer.

You start coding business logic immediately.

---

# What NIIV Can Generate

## Project Types

| Type        | Options Available |
|-------------|-------------------|
| Backend     | Basic / MVC       |
| Frontend    | React / Simple    |
| Fullstack   | Separate / Unified |

---

## Backend Structures

### Basic

```
backend/
  server.js
  .env
```

Includes:
- Express
- CORS
- JSON middleware
- `/api/health`
- `/api/demo`

Minimal and clean.

---

### Structured (MVC)

```
backend/
  src/
    models/
    controllers/
    routes/
    middlewares/
    config/
  server.js
  .env
```

Includes:
- Logger middleware
- Config layer
- Modular routing
- Clean separation of concerns

Recommended for scalable systems.

---

## Frontend Types

### 1. Vite + React (React 18)

Includes:

```
frontend/
  src/
    pages/
    components/
    api/
```

Options:
- React Router (optional)
- Axios (optional)
- Proxy auto-configured (if backend exists)
- `.env` support

---

### 2. Simple HTML

```
frontend/
  index.html
```

No build process.
No framework.
Works immediately.

---

# Fullstack Modes

## 1. Separate Mode

```
project/
  backend/
  frontend/
```

Backend and frontend run independently.

### Development

Backend:
```
cd backend
npm start
```

Frontend (React):
```
cd frontend
npm run dev
```

Simple frontend:
- Backend automatically serves static frontend

---

## 2. Unified Mode (Single Deployable App)

```
project/
  server.js
  frontend/
```

Single Node server.

### Development (React)

```
npm run dev
```

Runs backend + frontend concurrently.

### Production

```
npm run build
npm start
```

Express serves:

```
frontend/dist
```

Single deployment.

---

# Supported Combinations

NIIV supports ALL combinations below:

### Backend Only
- Basic
- MVC

### Frontend Only
- React
- Simple

### Fullstack (Separate)
- Basic + React
- Basic + Simple
- MVC + React
- MVC + Simple

### Fullstack (Unified)
- Basic + React
- Basic + Simple
- MVC + React
- MVC + Simple

All combinations are production-ready.

---

# How API Connection Works

If backend exists:

Frontend automatically calls:

```
/api/demo
```

If using React in fullstack mode:
- Vite proxy is configured automatically
- No manual setup required

---

# Environment Variables

Backend:
```
.env
PORT=5000
```

Frontend (React):
```
.env
VITE_API_BASE=/api
```

---

# Deployment Guide

## Separate

1. Deploy backend
2. Build frontend
3. Configure API URL

## Unified

```
npm run build
npm start
```

Single server deployment.

---

# What NIIV Does NOT Include

- Authentication
- Database integration
- Payment systems
- State management
- Opinionated architecture

NIIV provides the foundation.
You build the application logic.

---

# Version

v0.1.0  
Sprint 1 Complete.

---

NIIV is designed to remove repetitive setup so you can focus on real development.