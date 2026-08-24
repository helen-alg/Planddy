# Planddy

A full-stack plant care tracker — manage your personal plant collection, log watering, and keep a shared species care wiki.

**Live demo:** [helen-planddy.vercel.app](https://helen-planddy.vercel.app)
> First backend request may take up to a minute (free-tier server spins down when idle).

---

## What it does

- **Auth** — register/login with JWT-based authentication, passwords hashed with BCrypt
- **Personal plant collection** — each user has their own private set of plants, tied to a shared species wiki
- **Dashboard** — see at a glance which plants are overdue or due soon for watering, based on species defaults or per-plant custom intervals
- **Species wiki** — a shared database of plant species with care info (watering interval, light, temperature), searchable and reusable across users
- **Watering log** — track actual watering events per plant

## Tech stack

**Backend**
- Kotlin + [Ktor](https://ktor.io/) (REST API)
- [Exposed](https://github.com/JetBrains/Exposed) ORM over PostgreSQL
- JWT authentication (`java-jwt`) + BCrypt password hashing
- Hosted on [Supabase](https://supabase.com/) (Postgres) via HikariCP connection pooling
- Deployed on [Render](https://render.com/) (Docker)

**Frontend**
- React + TypeScript, built with [Vite](https://vitejs.dev/)
- Tailwind CSS v4
- React Router
- Deployed on [Vercel](https://vercel.com/)

## Project structure

```
Planddy/
├── backend/          # Ktor API
│   ├── src/main/kotlin/
│   └── Dockerfile
└── webapp/           # React frontend
    └── src/
        ├── pages/
        └── lib/       # API client, auth context
```

## Running locally

You'll need two terminals — backend and frontend run as separate processes.

### Backend
```bash
cd backend
```
Create a `.env` file in `backend/` with:
```
DATABASE_URL=jdbc:postgresql://<your-supabase-pooler-url>:6543/postgres?user=<user>&password=<password>
JWT_SECRET=<a-long-random-string>
```
Then run via IntelliJ (open the `backend/` folder as the project root) or:
```bash
./gradlew run
```
Server starts on `http://localhost:8080`.

### Frontend
```bash
cd webapp
npm install
```
Create a `.env` file in `webapp/` with:
```
VITE_API_URL=http://localhost:8080
```
Then:
```bash
npm run dev
```
App runs on `http://localhost:5173`.

## API overview

| Route | Auth required | Description |
|---|---|---|
| `POST /auth/register` | No | Create an account |
| `POST /auth/login` | No | Get a JWT |
| `GET/POST /species` | No | Shared species wiki |
| `GET/POST/DELETE /plants` | Yes | Your personal plants |
| `GET/POST/DELETE /locations` | Yes | Your plant locations |
| `GET/POST /plants/{id}/watering-events` | Yes | Watering log per plant |

## Roadmap

- [ ] Location picker in the plant creation flow
- [ ] Fertilizing tracking (schema exists, routes pending)
- [ ] Plant photos via Supabase Storage
- [ ] Daily email digest for overdue plants

---

Built as a portfolio project to explore a Kotlin/Ktor backend paired with a React frontend.
