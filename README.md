# Telegram Bot with Admin Panel — Starter

A starter template for building a Telegram bot with a web-based admin panel.

**Stack:**
- **Backend:** NestJS, TypeORM, PostgreSQL, Grammy (Telegram Bot)
- **Frontend:** React, Vite, Mantine UI
- **Infrastructure:** Docker Compose

## Getting Started

### 1. Set up environment

```bash
cp .env.example .env
# Edit .env with your values (database credentials, Telegram bot token, etc.)
```

### 2. Run with Docker (development)

```bash
docker compose -f compose.dev.yml up -d
```

### 3. Create super admin

```bash
docker exec -it ${PROJECT_NAME}_back sh
pnpm console admin create {username} {email}
```

### 4. Run frontend (development)

```bash
cd front
npm install
npm run dev
```

### 5. Run migrations

Migrations are run automatically on container start. To run manually:

```bash
cd back
pnpm migration:run
```

### Create a new migration

```bash
cd back
pnpm migration:generate --name=my-migration-name
```

## Project Structure

```
├── back/                # NestJS backend
│   └── src/
│       ├── admin-console/   # CLI commands (create admin)
│       ├── admins/          # Admin user management
│       ├── auth/            # JWT authentication
│       ├── bot/             # Telegram bot service
│       ├── common/          # Shared utilities, decorators, entities
│       ├── config/          # Environment validation
│       └── database/        # TypeORM setup & migrations
├── front/               # React admin panel
│   └── src/
│       ├── api/             # API client (axios, react-query)
│       ├── components/      # Reusable UI components
│       ├── guards/          # Auth & guest route guards
│       ├── hooks/           # Custom hooks (auth, API)
│       ├── layouts/         # Auth & dashboard layouts
│       ├── pages/           # Page components
│       ├── providers/       # Context providers
│       ├── routes/          # Routing configuration
│       └── theme/           # Mantine theme customization
├── compose.yml          # Docker Compose (production)
├── compose.dev.yml      # Docker Compose (development)
└── backup.sh            # Database & uploads backup script
```

## Features

- JWT-based admin authentication
- Admin CRUD with role management (superadmin / admin)
- Telegram bot skeleton with Grammy
- Data table with pagination, sorting, filtering
- Dark/light theme
- Docker-based development & production setup
- Database backup with Telegram notification
