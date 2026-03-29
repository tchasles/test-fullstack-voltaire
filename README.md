# Explication du developpeur des choix techniques et technologiques

Dans un premier temps, j'ai utilise Copilot pour la generation du code, car, vu lors de l'entretien precedent, j'ai bien compris votre volonte et votre facon de travailler via la generation de code en IA. J'ai donc utilise Copilot pour la generation du code en controlant la production par incrementation de petits prompts. J'ai choisi Copilot etant donne que c'est celui que j'utilise deja et qu'il permet le setup du projet directement depuis GitHub.

Le cas du projet demande ne necessite pas une enorme architecture et un build rapide et simple, donc j'ai opte pour React + Vite (frontend), Node.js + Express (backend) avec une BDD utilisant MongoDB + Mongoose :

    - Javascript/Typescript : pour avoir une stack coherente entre backend et front-end, surtout car le backend n'est utilise que par le backoffice
    
    - Une architecture full-stack pour permettre un debug plus simple et un projet plus lisible (a ce niveau de complexite)
    
    - (MongoDB + Mongoose) simple et rapide a modifier ou faire evoluer + vu la taille de la donnee, pas besoin de plus complexe

    - (Node.js + Express) adapte pour une API REST, simple au developpement et middleware robuste et fourni

    - (JWT + bcryptjs) a ete un choix de Copilot. Un choix dont je n'ai pas vu la necessite de changer, etant une techno deja utilisee sur un autre projet sur lequel je travaille. bcryptjs est une librairie bien rodee et JWT est simple d'utilisation pour un projet de cette taille.

Pour les tests unitaires, j'ai laisse le choix a Copilot pour les librairies. Je ne pourrais pas evaluer la qualite de ses choix, n'ayant jamais travaille sur des tests unitaires sur mes projets.

Pour les tests unitaires, je les ai integres au build Docker pour que, si le test echoue, le build echoue par la meme occasion, ce qui me permet une meilleure garantie de qualite avant deploiement.

Finalement, pour le deploiement unique comme demande, j'ai utilise Docker pour ce projet. C'est la premiere fois que je l'utilise et je suis tres satisfait de son fonctionnement.

Pour lancer l'app :
    - Docker Compose activé
    - docker compose up -d --build 




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

During image build, unit tests are executed for both backend and frontend.
If a test fails, `docker compose build` (or `docker compose up --build`) fails.

The application will be available at **http://localhost/login**.

## Run tests locally

```bash
# Backend unit tests
cd backend
npm test

# Frontend unit tests
cd ../frontend
npm test
```

## Seed produit data on first run

MongoDB can import initial `produit` documents from `mongo-init/seed.produit.json` the first time the `mongo_data` volume is created.

1. Put your records in `mongo-init/seed.produit.json`.
2. Start the stack with `docker compose up -d --build`.
3. If Mongo has already been initialized, rerun with a fresh volume: `docker compose down -v` then `docker compose up -d --build`.

Expected JSON format:

```json
[
    {
        "id": 1,
        "name": "Produit A",
        "category": "Informatique",
        "price": 99.99,
        "stock": 25,
        "created_at": "2026-03-25T00:00:00.000Z"
    }
]
```

The seed script inserts documents into the `produit` collection and creates a unique index on `id`.

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
| GET    | `/api/produit`        | No            | List products (optional `search`, `category`) |
| GET    | `/api/produit/:id`    | No            | Get a specific product by numeric id |
| GET    | `/api/produit/categories` | No        | Get all distinct product categories |
| POST   | `/api/produit`        | No            | Create a new product |
| PUT    | `/api/produit/:id`    | No            | Update an existing product |
| DELETE | `/api/produit/:id`    | No            | Delete a product |
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
