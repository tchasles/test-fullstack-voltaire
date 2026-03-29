# Explication du developpeur des choix techniques et technologique

Dans un premier temps j'ai utilisé Copilot, pour la génération du code, car vu lors de l'entretien précédent j'ai bien compris votre volonté et votre façon de travailler via la génération de code en IA. j'ai donc utilisé Copilot pour la génération du code en controllant la production par incrémentation de petits prompts. J'ai choisi Copilot étant donné que c'est celui que j'utilise déjà et qu'il est permet le setup du projet directement depuis github.

Le cas du projet demandé, ne nécéssite pas une énorme architecture et un build rapide et simple donc j'ai opté pour React + Vite (frontend), Node.JS + Express (backend) avec une bdd utilisant mongoDB + mongoose:

    - Javascript/Typescript: pour avoir une stack cohérente entre backend et front-end surtout car le backend n'est utilisé que par le backoffice
    
    -Une architecture full-stack pour permettre un débug plus simple et un projet plus lisible (a ce niveau de complexité)
    
    -(mongoDB + mongoose) Simple et rapide à modifié ou évoluer + vu la taille de la donnée pas besoin de plus complexe

    -(Node.js + Express) adapté pour une API REST, simple au développement et middleware robuste et fourni

    -(JWt + bcryptjs) a été un choix de Copilot. Un choix que je n'ai pas vu la nécéssité de changer étant une techno déjà utilisé sur un autre projet sur lequel je travaille, bcryptjs est une librairie bien rodée et JWT est simple d'utilisation pour un projet de cette taille.

Pour les tests unitaires j'ai laisser le choix a Copilot pour les librairies. Je ne pourrais pas évaluer la qualité de ses choix, n'ayant jamais travaillé sur des test unitaires sur mes projets.

Pour les tests unitaires je les ai intégré au build Docker pour que si le test échoue le build échoue par la même occasion, ce qui me permet une meilleure garantie de qualité avant déploiement

Finalement le déploiment unique comme demandé, j'ai utilisé Docker pour ce projet, première fois que je l'utilise et très satisfait de son fonctionnement.

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
