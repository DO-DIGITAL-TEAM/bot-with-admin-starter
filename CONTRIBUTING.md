# Contributing Guide

This guide helps developers (and AI assistants) understand how to contribute to this project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bot-with-admin-starter
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start development environment**
   ```bash
   docker compose -f compose.dev.yml up -d
   ```

4. **Create super admin**
   ```bash
   docker exec -it ${PROJECT_NAME}_back sh
   pnpm console admin create {username} {email}
   ```

5. **Start frontend**
   ```bash
   cd front
   npm install
   npm run dev
   ```

## Code Style

### TypeScript
- Use strict typing - avoid `any`
- Prefer interfaces over types
- Use enums for fixed sets
- Always define return types
- Add JSDoc for public APIs

### NestJS Backend
- Follow module structure: Controller → Service → Repository
- Use DTOs with class-validator
- Services contain business logic, controllers handle HTTP
- Use dependency injection
- Use guards for auth
- Use interceptors for response transformation

### React Frontend
- Functional components with hooks
- React Query for API calls
- Zod schemas for validation
- Mantine components consistently
- TypeScript paths (@/*) for imports

## Adding a New Feature

### Backend

1. **Create entity**
   ```bash
   # File: back/src/feature/entities/feature.entity.ts
   ```
   ```typescript
   import { Entity, Column } from 'typeorm';
   import { AbstractEntity } from 'src/common/entities/abstract.entity';
   
   @Entity('features')
   export class Feature extends AbstractEntity {
     @Column()
     name: string;
   }
   ```

2. **Create DTOs**
   ```bash
   # Files: back/src/feature/dto/create-feature.dto.ts
   #        back/src/feature/dto/update-feature.dto.ts
   ```

3. **Create service**
   ```bash
   # File: back/src/feature/feature.service.ts
   ```

4. **Create controller**
   ```bash
   # File: back/src/feature/feature.controller.ts
   ```

5. **Create module**
   ```bash
   # File: back/src/feature/feature.module.ts
   ```

6. **Register in AppModule**
   ```typescript
   // back/src/app.module.ts
   imports: [
     // ...
     FeatureModule,
   ]
   ```

7. **Generate migration**
   ```bash
   cd back
   pnpm migration:generate --name=create-feature
   ```

### Frontend

1. **Create Zod schemas**
   ```bash
   # File: front/src/api/dtos/feature.ts
   ```

2. **Create API hooks**
   ```bash
   # File: front/src/hooks/api/feature.ts
   ```

3. **Create page component**
   ```bash
   # File: front/src/pages/feature/index.tsx
   ```

4. **Add route**
   ```typescript
   // front/src/routes/index.tsx
   {
     path: '/feature',
     element: <FeaturePage />,
   }
   ```

## Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Write code following style guide
   - Add tests if applicable
   - Update documentation

3. **Commit changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code refactoring
   - `test:` Tests
   - `chore:` Maintenance

4. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

## Testing

### Backend
```bash
cd back
pnpm test
pnpm test:e2e
```

### Frontend
```bash
cd front
npm run test
```

## Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Environment variables documented
- [ ] Migration files created for schema changes
- [ ] JSDoc comments added for public APIs

## Questions?

- Check `.cursorrules` for code conventions
- See `AGENTS.md` for architecture details
- See `EXAMPLES.md` for code examples
