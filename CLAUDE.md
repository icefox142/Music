# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Philosophy

**Spec-Driven Development (SDD)**: Specifications are the primary artifact; code implements the spec. For non-trivial backend features, follow the workflow: `Spec → Generate Code → Generate Tests → Iterative Optimization → Module Documentation`. Write detailed specs upfront in `docs/{feature}/spec.md` to reduce ambiguity.

**Plan-First Default**: Non-trivial tasks (3+ steps or architectural decisions) must enter plan mode. Write plan first, validate before implementation, and never deviate without re-planning.

**Prove Before Completing**: Never mark a task done until proven working. Run tests, check logs, verify behavior. "Would a senior engineer approve this?"

## Workspace Structure

This directory contains three **independent** projects forming a full-stack music application:

```
Music/
├── clhoria-template/    # Backend API (Hono + Node.js + PostgreSQL)
├── refine-project/      # Admin Panel Frontend (Refine + React + shadcn/ui)
└── music-frontend/      # Client Frontend (Vite + React + React Router)
```

**Important**: These are three separate projects, not a monorepo. Each has its own `package.json`, `pnpm-lock.yaml`, and dependencies. They communicate only via HTTP API.

**API Relationship**: Both frontends consume the backend's OpenAPI specification. The admin panel uses `openapi-typescript` for type generation, while the client frontend has its own API client layer.

**Quick Reference** - Service URLs and Ports:
| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:9999 | 9999 |
| Backend OpenAPI Doc (Scalar) | http://localhost:9999/api/admin/doc | 9999 |
| Admin Panel | http://localhost:5173 | 5173 |
| Client Frontend | http://localhost:5174 | 5174 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## Development Commands

### Backend (clhoria-template/)

```bash
cd clhoria-template
pnpm install           # Install dependencies
pnpm dev               # Start dev server (http://localhost:9999)
pnpm build             # Build for production
pnpm start             # Start production server
pnpm typecheck         # TypeScript type checking
pnpm lint              # ESLint
pnpm lint:fix          # ESLint with auto-fix
pnpm test              # Run Vitest tests
pnpm test <pattern>    # Run specific test file (e.g., pnpm test users)
pnpm generate          # Generate Drizzle migration files
pnpm push              # Push schema changes directly (dev only)
pnpm migrate           # Execute database migrations
pnpm seed              # Seed initial data
pnpm studio            # Open Drizzle Studio
pnpm boss              # Open pg-boss dashboard (task queue UI)
```

**Database Development**: Use `pnpm push` for rapid iteration in development. Use `pnpm generate` + `pnpm migrate` for production releases.

**Quick Local Database Setup** (optional):
```bash
# Start PostgreSQL and Redis via Docker Compose
docker compose --env-file .env run -d --service-ports postgres
docker compose --env-file .env run -d --service-ports redis
```

### Admin Panel Frontend (refine-project/)

```bash
cd refine-project
pnpm install           # Install dependencies
pnpm dev               # Start dev server (http://localhost:5173)
pnpm build             # Build for production
pnpm start             # Start production server
pnpm openapi           # Generate types from backend OpenAPI specs
```

**Type Generation**: After backend API changes, run `pnpm openapi` to regenerate frontend types:
- Generates `src/api/admin.d.ts` from `http://localhost:9999/api/admin/doc`
- Generates `src/api/public.d.ts` from `http://localhost:9999/api/doc`

This command runs both `pnpm openapi:admin` and `pnpm openapi:public` in sequence.

**Backend must be running** before generating types.

### Client Frontend (music-frontend/)

```bash
cd music-frontend
pnpm install           # Install dependencies
pnpm dev               # Start dev server (http://localhost:5174)
pnpm build             # Build for production
pnpm preview           # Preview production build
pnpm lint              # ESLint
```

**Environment Configuration**:
- Set `VITE_API_BASE_URL` in `.env` file (defaults to `http://localhost:9999`)
- Set `VITE_TEST_TOKEN` for development authentication (see API测试指南.md)

**Note**: This project uses its own API client layer in `src/api/` (not auto-generated like admin panel).

## Architecture Overview

### Core Design Principles

**Code as Configuration**: This project eliminates runtime configuration databases in favor of code-as-truth:
- **Permissions**: OpenAPI route definitions + Casbin KeyMatch3 matching, no database permission identifiers
- **Menus**: Refine Resource compile-time routing, zero runtime overhead
- **Dictionaries**: TypeScript enum → PostgreSQL Enum → OpenAPI auto-generation, 100% type-safe

**Benefits**: Change once, auto-sync everywhere. TypeScript compile-time errors catch inconsistencies. No manual database → backend → frontend → docs synchronization.

### Backend (clhoria-template)

**Stack**: Hono + Node.js 25 + PostgreSQL (Drizzle ORM) + Redis + JWT + Casbin RBAC + Zod + OpenAPI 3.1.0

**Route Tiers**:
- `/api/public/*` - No authentication
- `/api/client/*` - JWT authentication
- `/api/admin/*` - JWT + RBAC + audit logging

**Key Features**:
- Auto-route loading via `import.meta.glob` from `routes/{tier}/**/*.index.ts`
- Declarative config via `app.config.ts` and `defineConfig()`
- Singleton system for DB, Redis, Casbin, Logger
- Three-layer DI: Module singletons (process) | Hono Context (request) | Effect-TS Layer (composable)
- Vertical Slice Architecture with Transaction Script pattern (default)
- Effect-TS infrastructure layer for distributed locks and task queues

**Architecture Philosophy**: Default to Vertical Slice + Transaction Script for 80% of features (simple CRUD). For complex business logic (~20%), adopt appropriate patterns: DDD for domain modeling, Hexagonal for dependency isolation, Effect-TS for type-safe side effects. The project uses Effect at infrastructure level (distributed locks, task queues) and can adopt it incrementally for business logic as needed.

**Documentation**: Full backend documentation in [clhoria-template/CLAUDE.md](clhoria-template/CLAUDE.md)

### Admin Panel (refine-project)

**Stack**: Refine + React 19 + React Router + shadcn/ui + Tailwind CSS + openapi-fetch

**Key Features**:
- Type-safe API calls via `openapi-fetch` and `openapi-react-query`
- Casbin RBAC integration with KeyMatch3 pattern matching
- Automatic JWT token refresh with queue management
- Permission caching with stale-while-revalidate strategy
- System pages: users, roles, dicts, params
- OpenAPI type generation from backend specs
- Zero runtime overhead: Code as permissions (Casbin), code as menus (Refine compile-time routing)

**Authentication Flow**:
1. Login stores access token in localStorage, refresh token in httpOnly cookie
2. `authMiddleware` intercepts 401 responses and auto-refreshes token
3. Failed requests queued during refresh are retried with new token
4. Permission cache cleared on logout, preserved on token refresh

**RBAC Integration**:
- Casbin enforcer initialized with permissions from `/api/admin/auth/permissions`
- `accessControlProvider.can()` checks permissions using KeyMatch3
- Custom actions supported via `resource.meta.customActions`

**Data Provider**:
- Implements full Refine DataProvider interface
- Maps Refine CRUD operations to backend API endpoints
- Supports pagination, sorting, filtering via query params
- Bulk operations use `/bulk` endpoint suffix

### Client Frontend (music-frontend)

**Stack**: Vite + React 19 + React Router + TanStack Query + Zustand + Howler.js + Tailwind CSS

**Key Features**:
- React Router for client-side routing
- TanStack Query (React Query) for server state management
- Zustand for client state management (music player, playlists)
- Howler.js for audio playback
- Custom API client layer in `src/api/`
- JWT authentication via localStorage

**Architecture**:
- `src/api/` - Auto-generated API clients using custom generators
- `src/components/` - React components (MusicPlayer, SongList, etc.)
- `src/stores/` - Zustand stores (useMusicStore for player state)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and configuration

**State Management**:
- **Server State**: TanStack Query for API data (songs, playlists, etc.)
- **Client State**: Zustand for UI state (player controls, current playlist, playback state)
- **Routing**: React Router with hash-based navigation

**Authentication**: Uses JWT token stored in localStorage. For development, a test token is provided in `API测试指南.md`.

## API Endpoint Mapping

### Authentication (`/api/{tier}/auth/*`)

**Admin Tier**:
- `POST /auth/login` - Login with username/password/captchaToken
- `POST /auth/refresh` - Refresh access token (cookie-based)
- `GET /auth/userinfo` - Get current user info
- `GET /auth/permissions` - Get user permissions (Casbin policies)
- `POST /auth/logout` - Logout

**Client Tier**: Same endpoints available at `/api/client/auth/*`

### System Management (`/api/admin/system/*`)

- `/users` - User CRUD + role assignment (`PUT /users/{id}/roles`)
- `/roles` - Role CRUD + permission management (`GET/PUT /roles/{id}/permissions`)
- `/dicts` - Dictionary CRUD
- `/params` - Parameter configuration CRUD

### Music Management (`/api/client/*`)

**Songs**:
- `GET /songs` - List songs (with pagination, filtering)
- `POST /songs` - Create song
- `GET /songs/:id` - Get song details
- `PATCH /songs/:id` - Update song
- `DELETE /songs/:id` - Delete song

**Playlists**:
- `GET /playlists` - List playlists
- `GET /playlists/mine` - Get current user's playlists
- `GET /playlists/public` - Get public playlists
- `POST /playlists` - Create playlist
- `GET /playlists/:id` - Get playlist details
- `PATCH /playlists/:id` - Update playlist
- `DELETE /playlists/:id` - Delete playlist

**Playlist Songs**:
- `GET /playlists/:id/songs` - Get songs in playlist
- `POST /playlists/:id/songs` - Add song to playlist
- `DELETE /playlists/:id/songs/:songId` - Remove song from playlist

### Resources (`/api/admin/resources/*`)

- `/object-storage/upload` - Get presigned upload URL
- `/object-storage/download` - Get presigned download URL

**Bulk Operations**: All CRUD endpoints support `/bulk` suffix for batch operations.

## Development Workflow

### Testing Workflow

**Backend Testing**:
- Place tests in `__tests__/` directories alongside route modules
- Use Vitest with `.int.test.ts` suffix for integration tests
- Run `pnpm test` to execute all tests
- Target: 80%+ coverage before marking complete

**Full-Stack Testing**:
1. After backend changes: Run `pnpm test` in clhoria-template
2. After API changes: Run `pnpm openapi` in refine-project to regenerate types
3. Verify admin panel at `http://localhost:5173`
4. Verify client frontend at `http://localhost:5174`

### Full-Stack Feature Development

1. **Backend Changes**:
   - Modify schemas in `clhoria-template/src/db/schema/`
   - Add routes in `clhoria-template/src/routes/{tier}/{feature}/`
   - Run `pnpm push` (dev) or `pnpm generate && pnpm migrate` (prod)
   - Backend auto-restarts with HMR

2. **Admin Panel Type Updates**:
   - Ensure backend is running (`pnpm dev` in clhoria-template)
   - Run `pnpm openapi` in refine-project
   - Frontend types now match backend OpenAPI spec

3. **Client Frontend Updates**:
   - Update API client functions in `music-frontend/src/api/`
   - Update TypeScript types in `music-frontend/src/types/`
   - No auto-generation; manual updates required

4. **Frontend Development**:
   - Admin Panel: Create pages in `refine-project/src/pages/`
   - Client Frontend: Create pages in `music-frontend/src/pages/`
   - Use generated types from `src/api/*.d.ts` (admin) or `src/types/` (client)

### Typical Development Session

```bash
# Terminal 1: Backend (http://localhost:9999)
cd clhoria-template
pnpm dev

# Terminal 2: Admin Panel (http://localhost:5173)
cd refine-project
pnpm dev

# Terminal 3: Client Frontend (http://localhost:5174)
cd music-frontend
pnpm dev

# After backend API changes:
cd refine-project && pnpm openapi  # Regenerate admin types
# Update client frontend API clients manually
```

## Project-Specific Guidelines

### Backend (clhoria-template)

- **Response Format**: Use `Resp.ok(data)` / `Resp.fail("error")` with `HttpStatusCodes`
- **Logging**: Use `logger` (system), `operationLogger` (CRUD audit), `loginLogger` (auth)
- **Dates**: Use `date-fns` library
- **UUID Parameters**: Use `IdUUIDParamsSchema` from shared schemas
- **Database**: Drizzle ORM with snake_case convention
- **Validation**: Zod schemas with Chinese error messages
- **Console**: NEVER use `console.log/warn/error` (except: env validation, singleton, tests, scripts)

**Backend-Specific Skills** (available in backend directory):
- `/crud` - Generate complete CRUD modules (schema, routes, handlers, tests)
- `/db-schema` - Generate database schema with Drizzle ORM

**VSCode Code Snippets**: Backend includes comprehensive VSCode snippets ([`clhoria-template/.vscode/crud.code-snippets`](clhoria-template/.vscode/crud.code-snippets)) for rapid CRUD development:
- `crud-schema` - Complete schema.ts template
- `crud-routes` - Complete routes.ts template (all 5 CRUD routes)
- `crud-handlers` - Complete handlers.ts template (all 5 CRUD handlers)
- `crud-index` - Complete index.ts template
- Plus individual snippets for routes (`route-list`, `route-create`, etc.), handlers (`handler-list`, `handler-create`, etc.), schemas, and common patterns

Type the prefix and press `Tab` to expand the snippet.

### Admin Panel (refine-project)

**API Calls**: Use `openapi-fetch` client with generated types
- `fetchClinet.GET/POST/PUT/PATCH/DELETE` methods
- `$api` React Query client for hooks
- Types auto-generated from backend OpenAPI specs

**Components**: Follow shadcn/ui patterns from `src/components/ui/`
**Routing**: React Router with Refine integration
**State**: React Query via `@refinedev/react-router`

### Client Frontend (music-frontend)

**API Integration**:
- Use custom API clients from `src/api/`
- Functions return TypeScript-typed responses
- Authentication handled via `lib/config.ts` (getAuthToken, setAuthToken)

**State Management**:
- **Server State**: TanStack Query for API calls (useQuery, useMutation)
- **Player State**: Zustand store in `src/stores/useMusicStore.ts`

**Audio Playback**:
- Howler.js for cross-browser audio support
- Player state managed in Zustand store
- Supports play/pause, next/prev, volume, progress

**Routing**:
- React Router with BrowserRouter
- Routes defined in `App.tsx`
- Navigation links in header

## Common Issues

**Type Mismatches**:
- Admin Panel: Run `pnpm openapi` to regenerate types after backend changes
- Client Frontend: Update API clients and types manually

**Connection Refused**: Ensure PostgreSQL and Redis are running before starting backend.

**PostgreSQL Version**: Backend uses PostgreSQL 18's `uuidv7()` function by default. For PostgreSQL 17 or below, modify `clhoria-template/src/db/schema/_shard/base-columns.ts` to use `uuid` library's `uuidV7()` function instead (see backend README for detailed instructions).

**CORS Issues**: Backend CORS is configured for development. Check `app.config.ts` if needed.

**401 Unauthorized**:
- Check if access token is valid in localStorage
- Verify refresh token cookie is set
- Backend `/api/{tier}/auth/refresh` must be accessible
- Client Frontend: Use test token from `API测试指南.md` for development

**Permission Denied** (Admin Panel):
- Check Casbin policies in backend
- Verify user has roles assigned
- Clear browser permission cache (localStorage key: `auth:permissions`)

## Environment Configuration

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_ADMIN_SECRET=your-admin-secret
JWT_CLIENT_SECRET=your-client-secret
```

**Admin Panel Frontend** (`.env.development` or `.env.production`):
```
VITE_APP_BASEURL=http://localhost:9999
VITE_OSS_URL=  # Optional: for object storage
```

**Client Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:9999
VITE_TEST_TOKEN=  # Optional: test JWT token for development
```

## Debugging

**Backend**: OpenAPI docs available at `http://localhost:9999/api/admin/doc` (Scalar UI)
- pg-boss dashboard available via `pnpm boss` (background job queue UI)

**Admin Panel**:
- Refine Devtools available (commented out in `App.tsx`)
- Check Network tab for API call details
- Permission cache stored in `localStorage`

**Client Frontend**:
- React Query DevTools can be installed for debugging API calls
- Howler.js debugging: Check browser console for audio errors
- Player state in Zustand devtools (if installed)

## Documentation References

### CLAUDE.md Hierarchy

This repository uses a hierarchical documentation system:
- **Root CLAUDE.md** (this file) - Cross-project overview, workflows, and quick reference
- **Backend CLAUDE.md** ([clhoria-template/CLAUDE.md](clhoria-template/CLAUDE.md)) - Backend-specific architecture, coding standards, and rules
- Each project may have its own README for setup instructions

### Key Documentation Files

- Backend: [clhoria-template/CLAUDE.md](clhoria-template/CLAUDE.md) - Comprehensive backend architecture and coding standards
- Backend README: [clhoria-template/README.md](clhoria-template/README.md) - Setup and deployment
- Admin Panel README: [refine-project/README.MD](refine-project/README.MD) - Refine-specific setup
- API Testing Guide: [API测试指南.md](API测试指南.md) - JWT token usage and API testing

## AI-Assisted Development

This project is designed for AI-driven development with Claude Code. The backend includes comprehensive CLAUDE.md configuration for deep AI understanding of project architecture.

**Recommended MCP Plugins**:
- **[Serena](https://github.com/SerenaAI/serena-mcp)**: Intelligent code analysis and refactoring suggestions
- **[Context7](https://github.com/context7/mcp-plugin)**: Real-time technical documentation queries and code examples

**Project-Specific Skills** (Backend):
- `/crud` - Generate complete CRUD modules (schema, routes, handlers, tests)
- `/db-schema` - Generate database schema with Drizzle ORM

These skills are defined in the backend CLAUDE.md and leverage VSCode snippets in `.vscode/crud.code-snippets`.

## Git Workflow

This project follows Conventional Commits format for commit messages:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Note**: The project previously used Git submodules. All submodules have been converted to regular directories for simpler management.
