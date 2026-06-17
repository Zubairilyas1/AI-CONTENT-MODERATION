# AI Content Moderation Platform

A full-stack web application for automated AI-powered image content moderation. Users submit images for policy compliance screening via Google Gemini, file appeals on disputed verdicts, and admins manage policies, appeals, and analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| AI | Google Gemini API (`gemini-2.0-flash`) with vision |
| Auth | JWT + bcrypt |
| Uploads | Multer (local `/uploads`) |
| Containers | Docker + Docker Compose |

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Google Gemini API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. Configure environment

Copy the example env file and add your Gemini API key:

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and set:

```
GEMINI_API_KEY=your-google-api-key-here
```

### 2. Run with Docker

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| MongoDB | localhost:27017 |

### 3. Demo accounts (auto-seeded on first startup)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@platform.com | Admin123 |
| User | user@platform.com | User123 |

## Project Structure

```
├── docker-compose.yml
├── backend/          # Express API
│   ├── models/       # Mongoose schemas
│   ├── routes/       # REST route definitions
│   ├── controllers/  # Request handlers
│   ├── services/     # Gemini AI moderation
│   ├── middleware/   # JWT auth + role guard
│   └── uploads/      # Stored images
└── frontend/         # React SPA
    └── src/
        ├── pages/    # Route pages
        ├── components/
        ├── context/  # Auth state
        └── api/      # Axios client
```

## API Reference

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |

**Register/Login body:**
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret123" }
```

### Submissions (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submissions` | Upload images (`multipart/form-data`, field: `images`) |
| GET | `/submissions` | List user's submissions (filters: `outcome`, `category`, `startDate`, `endDate`) |
| GET | `/submissions/:id` | Get single submission with verdicts |

### Verdicts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/verdicts/:imageId` | Get verdict for an image |

### Appeals

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/appeals` | File appeal `{ submission_id, justification }` |
| GET | `/appeals/:id` | Get appeal status |

### Admin — Appeals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/appeals` | Appeals queue (filter: `?status=Pending`) |
| PATCH | `/admin/appeals/:id` | Resolve `{ status: "Accepted"\|"Rejected", admin_response }` |

### Admin — Policies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/policies` | List all policies |
| PATCH | `/admin/policies/:category` | Update policy settings |

**Policy update body (all optional):**
```json
{
  "is_enabled": true,
  "confidence_threshold": 70,
  "enforcement_behavior": "Flag for Review"
}
```

### Admin — Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Platform metrics dashboard data |

## Moderation Categories

1. Graphic Violence
2. Hate Symbols
3. Self-Harm
4. Extremist Propaganda
5. Weapons & Contraband
6. Harassment & Humiliation

## Key Business Rules

- **Policy snapshots** are captured before each submission — verdicts reference frozen policy state.
- **Policy changes are non-retroactive** — existing verdicts are never updated when policies change.
- **Appeal acceptance** overrides all image verdicts in the submission to `Approved`.
- **Auto-Block** policies produce `Blocked` outcomes; **Flag for Review** produces flagged outcomes.

## Local Development (without Docker)

### Backend

```bash
cd backend
npm install
# Set MONGO_URI=mongodb://localhost:27017/content-moderation in .env
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Health Check

```
GET http://localhost:5000/api/health
```

## License

MIT
