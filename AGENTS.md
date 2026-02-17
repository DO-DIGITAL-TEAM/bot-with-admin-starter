# Architecture Guide for AI Agents

This document provides comprehensive architecture information to help AI assistants understand and work with this codebase effectively.

## System Architecture

### High-Level Overview
```
┌─────────────┐      HTTP/REST      ┌─────────────┐
│   Frontend  │ ◄─────────────────► │   Backend   │
│   (React)   │                      │  (NestJS)   │
└─────────────┘                      └──────┬──────┘
                                            │
                                            │ Grammy API
                                            ▼
                                    ┌─────────────┐
                                    │  Telegram   │
                                    │     Bot     │
                                    └─────────────┘
                                            │
                                            │ PostgreSQL
                                            ▼
                                    ┌─────────────┐
                                    │  Database   │
                                    └─────────────┘
```

## Backend Architecture (NestJS)

### Module Structure
Each feature follows NestJS module pattern:
- **Module**: Registers providers, imports dependencies
- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic
- **Entity**: TypeORM database model
- **DTO**: Data Transfer Objects for validation

### Key Modules

#### `AppModule` (Root Module)
- Imports all feature modules
- Configures global modules (Config, Database)
- Entry point: `main.ts`

#### `DatabaseModule`
- Configures TypeORM with PostgreSQL
- Registers all entities
- Handles migrations

#### `AuthModule`
- JWT-based authentication
- Login/Register endpoints
- Token verification
- Guards for route protection

#### `AdminsModule`
- Admin user CRUD operations
- Role management (superadmin/admin)
- Pagination, sorting, filtering support

#### `BotModule`
- Telegram bot integration via Grammy
- Command handlers
- Message sending utilities

#### `CommonModule`
- Shared utilities
- Custom decorators (pagination, filtering, sorting)
- Base entities
- Interceptors

### Request Flow
```
HTTP Request
  ↓
Controller (validates DTO)
  ↓
Guard (AuthGuard - checks JWT)
  ↓
Service (business logic)
  ↓
Repository/TypeORM (database)
  ↓
Response Interceptor (formats response)
  ↓
HTTP Response
```

### Response Format
All API responses follow this structure:
```typescript
{
  statusCode: number;
  message: string;
  data: T; // Actual response data
}
```

### Pagination
- Query params: `page` (1-indexed), `size` (default: 25)
- Response includes `totalCount` and `items[]`

### Sorting
- Query params: `sortBy` (field name), `sortOrder` (asc/desc)
- Controller specifies allowed fields: `@SortingParams(['id', 'created_at'])`

### Filtering
- Query param: `filters[]` array
- Format: `field:rule:value` (e.g., `username:like:john`)
- Rules: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `nlike`, `in`, `nin`, `isnull`, `isnotnull`, `between`
- Controller specifies allowed fields: `@FilteringParams(['username', 'role'])`

## Frontend Architecture (React)

### Structure
```
src/
├── api/              # API client setup, helpers, DTOs
├── components/       # Reusable UI components
├── guards/           # Route guards (auth, guest)
├── hooks/            # Custom hooks (auth, API queries)
├── layouts/          # Page layouts (auth, dashboard)
├── pages/            # Page components
├── providers/        # Context providers
├── routes/           # React Router configuration
└── theme/            # Mantine theme customization
```

### API Integration
- Uses Axios for HTTP requests
- React Query for data fetching/caching
- Zod schemas for runtime validation
- Custom hooks generated via `createGetQueryHook`, `createPostMutationHook`, etc.

### State Management
- React Query for server state
- Zustand for client state (if needed)
- Context API for auth state

### Routing
- React Router v6
- Protected routes via guards
- Lazy loading for code splitting

## Database Schema

### Entities

#### `Admin`
- `id`: number (PK, auto-increment)
- `username`: string (255)
- `email`: string (255)
- `image`: string | null
- `is_active`: boolean (default: true)
- `role`: enum ('superadmin' | 'admin')
- `created_at`: Date
- `updated_at`: Date
- Relations: `OneToOne` with `Password`

#### `Password`
- `id`: number (PK)
- `admin_id`: number (FK)
- `hash`: string (bcrypt hash)
- Relations: `OneToOne` with `Admin`

### Abstract Entity
All entities extend `AbstractEntity`:
- `id`: Primary key
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

## Telegram Bot Integration

### Grammy Framework
- Bot instance created in `BotService`
- Commands registered in `onModuleInit()`
- Context types from Grammy for type safety

### Common Patterns
```typescript
// Register command
this.bot.command('command', this.handler.bind(this));

// Send message
await this.bot.api.sendMessage(chatId, message, options);

// Keyboard
const keyboard = new Keyboard().text('Button').row();
```

## Environment Variables

### Backend
- `PORT`: Server port (default: 4000)
- `JWT_SECRET`: Secret for JWT signing
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `NODE_ENV`: Environment (development/production)

### Frontend
- `API_URL`: Backend API URL
- `PORT`: Dev server port (default: 3000)

## Development Workflow

### Adding a New Feature

1. **Backend**:
   - Create entity: `back/src/feature/entities/feature.entity.ts`
   - Create DTOs: `back/src/feature/dto/*.dto.ts`
   - Create service: `back/src/feature/feature.service.ts`
   - Create controller: `back/src/feature/feature.controller.ts`
   - Create module: `back/src/feature/feature.module.ts`
   - Register in `AppModule`
   - Generate migration: `pnpm migration:generate --name=create-feature`

2. **Frontend**:
   - Create Zod schemas: `front/src/api/dtos/feature.ts`
   - Create API hooks: `front/src/hooks/api/feature.ts`
   - Create page component: `front/src/pages/feature/`
   - Add route: `front/src/routes/index.tsx`

### Testing
- Backend: Jest (unit + e2e)
- Frontend: Vitest + React Testing Library

## Common Code Patterns

### Backend Controller Example
```typescript
@Controller('resource')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @UseGuards(AuthGuard)
  @Get()
  findChunk(
    @PaginationParams() pagination: IPagination,
    @SortingParams(['id', 'name']) sorting: ISorting,
    @FilteringParams(['name', 'status']) filtering: IFiltering,
  ) {
    return this.service.findChunk(pagination, sorting, filtering);
  }
}
```

### Frontend Hook Example
```typescript
const useGetResource = createPaginationQueryHook({
  endpoint: '/api/resource',
  dataSchema: resourceSchema,
  rQueryParams: { queryKey: ['getResource'] },
});
```

## Important Conventions

1. **Naming**: Use descriptive names, follow camelCase for variables, PascalCase for classes
2. **Error Handling**: Use NestJS exceptions, handle in interceptors
3. **Validation**: Always validate input with DTOs and class-validator
4. **Type Safety**: Use TypeScript strictly, avoid `any`
5. **Comments**: Add JSDoc for public APIs
6. **Security**: Never expose secrets, validate all inputs, use guards
