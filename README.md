# Popup Verbal Reasoning Challenge (VRC)

- [Final Report](https://drive.google.com/file/d/1nbuqH8wYpg-6U3Qz0ALbijlJ3hJPbgKE/view?usp=drive_link)
- [Presentation Slides](https://drive.google.com/file/d/1wj81NPRFcBv_nLUEZNqyYxDf9rqrhoun/view?usp=sharing)

---

## Overview
An AI-powered platform for practising 11+ verbal reasoning. Parents create child profiles, launch tailored or quick‑start practice sessions, and monitor progress with analytics. Administrators manage and approve LLM‑generated questions via a dedicated dashboard.

---

## Prerequisites

- **Docker**: For running the MySQL database container.  
- **Node.js**: Version 16+ (for backend and frontend).  
- **npm**: Comes bundled with Node.js.  

---

## Local Development

### 1. Database (MySQL)

Initialization scripts live in `database/init/init.sql`.

```bash
# From project root:
docker-compose up -d
```

This will start a MySQL container with the VRC schema and seed data.

### 2. Backend (Express)

```bash
cd backend         # Navigate into backend folder
npm install        # Install dependencies
cp .env.example .env  # Copy sample environment file
# Add your OpenAI API key:
# OPEN_AI_KEY=<your-key-here>
node server.js
```

- The server listens on `http://localhost:3000` by default.

### 3. Frontend (Vite + React)

```bash
cd frontend        # Navigate into frontend folder
npm install        # Install dependencies
npm run dev        # Start Vite development server
```

- The app runs at `http://localhost:5173`.

---

## Environment Variables
Ensure you create a `.env` in the **backend** directory with:

```ini
# OpenAI API Key (must be set for question generation)
OPEN_AI_KEY=
```

---

## Default Admin Account
To access the Admin Dashboard (question management and approval), use:

- **Email:** `parent3@example.com`  
- **Password:** `test`


---

## Project Structure

```
/backend
  ├─ config/            # App and role settings
  ├─ controllers/       # Express route handlers
  ├─ services/          # Business logic (including LLM integration)
  ├─ llm_prompts/       # YAML prompts + Python validators
  ├─ routes/            # Route definitions
  └─ server.js          # Entry point

/frontend
  ├─ public/            # Static assets
  ├─ src/
  │   ├─ api/           # TypeScript API clients
  │   ├─ components/    # Reusable UI components
  │   ├─ context/       # React contexts
  │   ├─ hooks/         # Custom hooks
  │   └─ pages/         # Route views
  └─ vite.config.ts     # Vite configuration

/database
  └─ init/              # SQL schema & seed scripts

docker-compose.yml     # Database service definition

```
