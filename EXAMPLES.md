# API Usage Examples

This document provides practical examples for using the API endpoints and common patterns.

## Authentication

### Login
```typescript
// Backend endpoint: POST /auth/login
// Request body:
{
  "email": "admin@example.com",
  "password": "password123"
}

// Response:
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Register (requires authentication)
```typescript
// Backend endpoint: POST /auth/register
// Headers: Authorization: Bearer <token>
// Request body:
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "securepassword",
  "role": "admin" // or "superadmin"
}
```

### Verify Token
```typescript
// Backend endpoint: GET /auth/verify-token
// Headers: Authorization: Bearer <token>
// Response: Admin object
```

## Admins CRUD

### Get All Admins (Paginated)
```typescript
// Backend endpoint: GET /admins
// Query params:
//   page=1
//   size=25
//   sortBy=created_at
//   sortOrder=desc
//   filters[]=username:like:john
//   filters[]=role:eq:admin

// Example URL:
GET /admins?page=1&size=10&sortBy=created_at&sortOrder=desc&filters[]=role:eq:admin

// Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "totalCount": 42,
    "items": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Get Single Admin
```typescript
// Backend endpoint: GET /admins/one/:id
GET /admins/one/1

// Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Admin
```typescript
// Backend endpoint: PATCH /admins/update/:id
// Headers: Authorization: Bearer <token>
// Request body:
{
  "username": "updated_username",
  "email": "newemail@example.com",
  "is_active": false
}
```

### Delete Admin
```typescript
// Backend endpoint: DELETE /admins/:id
// Headers: Authorization: Bearer <token>
DELETE /admins/1
```

## Filtering Examples

### Filter Rules
- `eq`: Equals - `username:eq:john`
- `neq`: Not equals - `role:neq:superadmin`
- `gt`: Greater than - `id:gt:10`
- `gte`: Greater than or equal - `id:gte:10`
- `lt`: Less than - `id:lt:100`
- `lte`: Less than or equal - `id:lte:100`
- `like`: Case-insensitive contains - `username:like:john`
- `nlike`: Not like - `username:nlike:test`
- `in`: In array - `role:in:admin,superadmin`
- `nin`: Not in array - `role:nin:admin`
- `isnull`: Is null - `image:isnull:`
- `isnotnull`: Is not null - `image:isnotnull:`
- `between`: Between values - `id:between:10,20`

### Multiple Filters
```
GET /admins?filters[]=username:like:john&filters[]=role:eq:admin&filters[]=is_active:eq:true
```

## Frontend Usage Examples

### Using React Query Hooks

```typescript
// In a component
import { useGetAdmins } from '@/hooks/api/admins';

function AdminsPage() {
  const { data, isLoading, error } = useGetAdmins({
    query: {
      page: 1,
      size: 25,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    filters: [
      { field: 'role', rule: 'eq', value: 'admin' },
      { field: 'username', rule: 'like', value: 'john' },
    ],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Total: {data?.data.totalCount}</p>
      {data?.data.items.map(admin => (
        <div key={admin.id}>{admin.username}</div>
      ))}
    </div>
  );
}
```

### Creating a Mutation Hook

```typescript
// In hooks/api/admins.ts
import { createPostMutationHook } from '@/api/helpers';
import { CreateAdminSchema, AdminSchema } from '@/api/dtos/admin';

export const useCreateAdmin = createPostMutationHook({
  endpoint: '/auth/register',
  bodySchema: CreateAdminSchema,
  responseSchema: AdminSchema,
  rMutationParams: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAdmins'] });
    },
  },
});

// Usage in component
const createAdmin = useCreateAdmin();

const handleSubmit = async (formData) => {
  await createAdmin.mutateAsync({
    variables: formData,
  });
};
```

## Telegram Bot Examples

### Adding a New Command

```typescript
// In bot.service.ts
public onModuleInit() {
  this.bot.command('start', this.onStart.bind(this));
  this.bot.command('help', this.onHelp.bind(this)); // New command
  this.bot.start();
}

private async onHelp(ctx: Context) {
  await ctx.reply('Available commands:\n/start - Start the bot\n/help - Show help');
}
```

### Sending Messages from Backend

```typescript
// In any service
constructor(private readonly botService: BotService) {}

async notifyUser(telegramId: string, message: string) {
  await this.botService.sendMessage(telegramId, message);
}

// With inline keyboard
import { InlineKeyboard } from 'grammy';

const keyboard = new InlineKeyboard()
  .text('Button 1', 'callback_data_1')
  .row()
  .text('Button 2', 'callback_data_2');

await this.botService.sendMessage(telegramId, 'Choose an option:', keyboard);
```

### Handling Callbacks

```typescript
public onModuleInit() {
  this.bot.callbackQuery('callback_data_1', this.onCallback1.bind(this));
}

private async onCallback1(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.reply('You clicked button 1!');
}
```

## Database Migration Examples

### Creating a Migration

```bash
cd back
pnpm migration:generate --name=add_user_table
```

### Migration File Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "username" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

## Environment Setup

### .env.example Structure

```bash
# Docker
PROJECT_NAME=mybot

# Database
DB_PORT=5432
DB_NAME=mybot
DB_USERNAME=mybot
DB_PASSWORD=your_secure_password

# Backend
BACK_PORT=4000
JWT_SECRET=your_jwt_secret_here
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Frontend
FRONT_PORT=3000
API_URL=http://127.0.0.1:4000

# Backup (optional)
BACKUP_DIR=/home/mybot/backups
BACKUP_TELEGRAM_BOT_TOKEN=your_backup_bot_token
BACKUP_TELEGRAM_CHAT_ID=your_chat_id
```

### Generating JWT Secret

```javascript
// In Node.js console
require('crypto').randomBytes(32).toString('hex')
```
