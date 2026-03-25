# test-fullstack-voltaire

A full-stack application with React, Node.js/Express, JWT authentication, and MongoDB — all orchestrated with Docker Compose.

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + React Router v6 |
| Backend   | Node.js + Express 4               |
| Auth      | JWT (jsonwebtoken) + bcryptjs     |
| Database  | MongoDB 7 (Mongoose ODM)          |
| Container | Docker + Docker Compose           |

## Getting started

```bash
# 1 — Clone and enter the project
git clone <repo-url>
cd test-fullstack-voltaire

# 2 — (Optional) override defaults via an env file
cp .env.example .env   # then edit JWT_SECRET

# 3 — Build and start every service
docker compose up --build
```

The application will be available at **http://localhost**.

## Environment variables (backend)

| Variable       | Default                             | Description                |
|----------------|-------------------------------------|----------------------------|
| PORT           | `5000`                              | Backend HTTP port          |
| MONGO_URI      | `mongodb://mongo:27017/voltaire`    | MongoDB connection string  |
| JWT_SECRET     | `change-me-in-production`           | Secret used to sign tokens |
| JWT_EXPIRES_IN | `7d`                                | Token lifetime             |
| CORS_ORIGIN    | `http://localhost:80`               | Allowed CORS origin        |

## API endpoints

| Method | Path                  | Auth required | Description              |
|--------|-----------------------|---------------|--------------------------|
| POST   | `/api/auth/register`  | No            | Register a new user      |
| POST   | `/api/auth/login`     | No            | Login, receive JWT token |
| GET    | `/api/me`             | Yes (Bearer)  | Get current user info    |
| GET    | `/health`             | No            | Backend health check     |

## Project structure

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── server.js          # Express app entry point
│   ├── middleware/
│   │   └── auth.js        # JWT verify + sign helpers
│   ├── models/
│   │   └── User.js        # Mongoose User model
│   └── routes/
│       ├── auth.js        # /api/auth/register, /api/auth/login
│       └── protected.js   # /api/me (requires token)
└── frontend/
    ├── Dockerfile         # Multi-stage: Vite build → nginx
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── context/
        │   └── AuthContext.jsx   # React auth context + hooks
        ├── services/
        │   └── auth.js           # Axios calls + token helpers
        ├── components/
        │   └── PrivateRoute.jsx  # Route guard
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            └── Dashboard.jsx
```
