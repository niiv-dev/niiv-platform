# NIIV

The foundation for Node and Vite applications.

NIIV is an interactive scaffolding engine that generates production-ready:

* Node.js backend
* Vite + React frontend
* Simple HTML frontend
* Fullstack applications (separate or unified)

It now also supports database integration and generates a working CRUD system with a simple UI.

---

# What Problem NIIV Solves

Every time you start a project, you usually:

* Create backend structure
* Setup Express
* Add routes
* Configure database
* Setup frontend
* Configure Vite
* Setup proxy
* Connect frontend to backend

NIIV automates this entire foundation layer.

You can start building actual features immediately.

---

# How to Use

## Run directly (recommended)

```
npx niiv create
```

---

## Install globally

```
npm install -g niiv
```

Then:

```
niiv create
```

---

# CLI Commands

```
niiv create       Create a new project
niiv --version    Show CLI version
niiv --help       Show help
```

---

# What NIIV Can Generate

## Project Types

| Type      | Options Available  |
| --------- | ------------------ |
| Backend   | Basic / Structured |
| Frontend  | React / Simple     |
| Fullstack | Separate / Unified |

---

# Backend Structures

## Basic

```
backend/
  server.js
  .env
```

Includes:

* Express
* CORS
* JSON middleware
* `/api/health`
* `/api/demo`

---

## Structured

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

* Logger middleware
* Config layer
* Modular routing
* Clean separation of concerns

---

# Database Support

NIIV supports:

* MongoDB
* PostgreSQL

When enabled, it automatically:

* Creates DB connection
* Updates environment variables
* Injects connection into server

---

# CRUD Generation

If database + CRUD is enabled:

## Backend

Generates full CRUD APIs:

```
POST   /api/items
GET    /api/items
PUT    /api/items/:id
DELETE /api/items/:id
```

---

## Frontend (React)

Generates a working UI:

* Add item
* View items
* Edit item
* Delete item

Everything is connected out of the box.

---

# Frontend Types

## 1. Vite + React

```
frontend/
  src/
    pages/
    components/
    api/
```

Options:

* React Router (optional)
* Axios or Fetch (optional)
* Proxy auto-configured
* Environment support

---

## 2. Simple HTML

```
frontend/
  index.html
```

No build setup required.
Runs instantly.

---

# Fullstack Modes

## 1. Separate Mode

```
project/
  backend/
  frontend/
```

### Run backend

```
cd backend
npm install
npm start
```

### Run frontend

```
cd frontend
npm install
npm run dev
```

---

## 2. Unified Mode

```
project/
  server.js
  frontend/
```

Single deployable app.

### Development

```
npm install
npm run dev
```

### Production

```
npm run build
npm start
```

---

# API Connection

If backend exists:

Frontend automatically connects to:

```
/api
```

React projects include automatic proxy configuration.

---

# Environment Variables

## Backend

```
.env
PORT=5000
```

## MongoDB

```
MONGO_URI=mongodb://localhost:27017/niiv_db
```

## PostgreSQL

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=niiv_db
DB_PORT=5432
```

## Frontend

```
.env
VITE_API_BASE=/api
```

---

# Deployment

## Separate

1. Deploy backend
2. Build frontend
3. Update API base URL if needed

---

## Unified

```
npm run build
npm start
```

Single server handles everything.

---

# Supported Combinations

NIIV supports all combinations:

### Backend

* Basic
* Structured

### Frontend

* React
* Simple

### Fullstack

* Separate
* Unified

With or without:

* Database
* CRUD
* Router
* Axios

---

# What NIIV Does Not Include

* Authentication
* Authorization
* Advanced state management
* Business logic

NIIV focuses on the foundation layer.

---

# Version

v0.2.0

---

NIIV is built to remove repetitive setup and give you a working starting point instantly.
