# TMS Backend API

A REST API for the Tutor Management System frontend (`../html-template`). Built with
Node.js, Express, Prisma, and PostgreSQL. Deployed on Vercel at
`https://backend-mocha-two-94.vercel.app/api`, with a [Neon](https://neon.tech) Postgres
database provisioned through the Vercel Marketplace.

## Stack

- **Express 4** — HTTP server & routing
- **Prisma 6 + PostgreSQL** — ORM & database (Neon in production; any Postgres locally)
- **JWT (jsonwebtoken) + bcryptjs** — authentication
- **Zod** — request validation
- **helmet / cors / morgan** — security headers, CORS, request logging

## Scope (Core MVP)

Auth (roles: `ADMIN`, `TEACHER`, `STUDENT`) · Departments · Subjects · Students · Teachers ·
Fee structures & fee payments (collections) · Exams & exam results.

Not yet built: library, transport, hostel, timetable, events/holidays, salary, expenses,
sports, messaging/inbox. The data model and route patterns here are meant to make adding
those straightforward — copy an existing module (e.g. `subject`) as a template.

## Getting started

Requires a PostgreSQL database — a free [Neon](https://neon.tech) project works well, or any
local/hosted Postgres instance.

```bash
cd backend
npm install
cp .env.example .env        # then set DATABASE_URL (+ DATABASE_URL_UNPOOLED) and JWT_SECRET
npx prisma migrate dev      # applies the schema and runs the seed
npm run dev                 # starts the API on http://localhost:5000 (nodemon)
```

`prisma migrate dev` automatically runs `prisma/seed.js`, which creates:

| Email               | Password      | Role  |
|---------------------|---------------|-------|
| admin@tms.local      | Admin@12345   | ADMIN |

...plus a "General Studies" department and one sample subject.

To re-seed without a new migration: `npm run seed`.

### Environment variables (`.env`)

| Variable                 | Purpose                                                          |
|--------------------------|--------------------------------------------------------------------|
| `DATABASE_URL`           | Pooled Postgres connection string (used at runtime)                |
| `DATABASE_URL_UNPOOLED`  | Direct (non-pooled) Postgres connection string (used for migrations) |
| `JWT_SECRET`             | Secret used to sign auth tokens — change in production              |
| `JWT_EXPIRES_IN`         | Token lifetime, e.g. `7d`                                            |
| `PORT`                   | API port (default `5000`, unused on Vercel)                          |
| `CORS_ORIGIN`            | Origin allowed to call the API (your frontend's URL)                 |

On Vercel, `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are injected automatically by the Neon
Marketplace integration — only `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CORS_ORIGIN` need to be
set manually (Project Settings → Environment Variables).

## Auth model

- `POST /api/auth/register` is public and always creates a `STUDENT` account.
- `TEACHER` and `ADMIN` accounts can only be provisioned by an existing admin via
  `POST /api/auth/admin/create-user`.
- After creating a `User`, an admin links it to a profile by setting `userId` when
  creating/updating a `Student` or `Teacher` record — this is what lets a student log in
  and see their own data via the `/me` endpoints.
- Send the JWT on every protected request: `Authorization: Bearer <token>`.

## API reference

All routes are prefixed with `/api`. All routes except `/health`, `/auth/register`, and
`/auth/login` require a valid `Authorization` header.

### Health
- `GET /health` — public.

### Auth
| Method | Path                        | Access        | Notes                          |
|--------|-----------------------------|---------------|---------------------------------|
| POST   | `/auth/register`            | Public        | Always creates a STUDENT        |
| POST   | `/auth/login`                | Public        |                                  |
| GET    | `/auth/me`                   | Any            |                                  |
| PATCH  | `/auth/change-password`      | Any            |                                  |
| POST   | `/auth/admin/create-user`    | ADMIN          | Can set any role                |

### Departments — `/departments`
| Method | Path   | Access |
|--------|--------|--------|
| GET    | `/`    | Any    |
| GET    | `/:id` | Any    |
| POST   | `/`    | ADMIN  |
| PATCH  | `/:id` | ADMIN  |
| DELETE | `/:id` | ADMIN  |

### Subjects — `/subjects` (query: `departmentId`, `teacherId`)
Same access pattern as Departments.

### Students — `/students`
| Method | Path       | Access          | Notes                              |
|--------|------------|-----------------|-------------------------------------|
| GET    | `/`        | ADMIN, TEACHER  | query: `departmentId`, `status`, `search` |
| GET    | `/me`      | STUDENT         | own profile                         |
| PATCH  | `/me`      | STUDENT         | limited fields (phone/address/guardian) |
| GET    | `/:id`     | Any             | STUDENT restricted to own record    |
| POST   | `/`        | ADMIN           |                                      |
| PATCH  | `/:id`     | ADMIN           |                                      |
| DELETE | `/:id`     | ADMIN           |                                      |

### Teachers — `/teachers`
Same pattern as Students, but the directory (`GET /`, `GET /:id`) is open to any
authenticated role.

### Fee structures — `/fees`
Same CRUD access pattern as Departments (view: any, manage: ADMIN).

### Fee payments (collections) — `/fee-payments`
| Method | Path   | Access          | Notes                       |
|--------|--------|-----------------|-------------------------------|
| GET    | `/`    | ADMIN, TEACHER  | query: `studentId`, `feeStructureId`, `status` |
| GET    | `/me`  | STUDENT         | own payments                  |
| GET    | `/:id` | Any             | STUDENT restricted to own record |
| POST   | `/`    | ADMIN           |                                |
| PATCH  | `/:id` | ADMIN           |                                |
| DELETE | `/:id` | ADMIN           |                                |

### Exams — `/exams`
| Method | Path                              | Access          |
|--------|-----------------------------------|-----------------|
| GET    | `/`                               | Any             |
| GET    | `/:id`                            | Any             |
| POST   | `/`                               | ADMIN, TEACHER  |
| PATCH  | `/:id`                            | ADMIN, TEACHER  |
| DELETE | `/:id`                            | ADMIN           |
| GET    | `/results/me`                     | STUDENT         |
| GET    | `/:examId/results`                | ADMIN, TEACHER  |
| POST   | `/:examId/results`                | ADMIN, TEACHER  |
| PATCH  | `/:examId/results/:resultId`      | ADMIN, TEACHER  |
| DELETE | `/:examId/results/:resultId`      | ADMIN, TEACHER  |

## Response shape

Success:
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 } }
```
(`meta` only on paginated list endpoints — pass `?page=` and `?limit=`.)

Error:
```json
{ "success": false, "message": "Validation failed", "details": [ { "path": "email", "message": "Invalid email address" } ] }
```

## Project structure

```
backend/
  prisma/
    schema.prisma     # data model
    seed.js            # creates the default admin + sample data
  src/
    app.js             # express app: middleware + route mounting
    server.js           # entrypoint, graceful shutdown
    lib/prisma.js        # shared PrismaClient instance
    middleware/          # auth (JWT), validate (Zod), error handler
    routes/               # one file per resource, mounted in routes/index.js
    controllers/           # request handlers, one file per resource
    validators/             # Zod schemas, one file per resource
    utils/                   # ApiError, asyncHandler, pagination, JWT helpers
```

## Known dev-only advisory

`npm audit` flags a high-severity advisory in `deepmerge-ts`, pulled in transitively by
the `prisma` CLI's config loader (`@prisma/config`). It only affects the local dev CLI
tool, not any runtime/production code path, and fixing it currently requires a breaking
downgrade. Safe to leave as-is for this project; revisit on the next Prisma major bump.

## Deployment

Deployed on Vercel using its zero-config **Express** framework preset (Root Directory:
`backend`) — no `vercel.json` or serverless wrapper needed. A `postinstall` script runs
`prisma generate` on every install so the Prisma Client matches the current schema. Database
is Neon Postgres, provisioned via the Vercel Marketplace (`vercel integration add neon`),
which auto-injects `DATABASE_URL` / `DATABASE_URL_UNPOOLED` into all environments.

## Connecting a frontend

`../html-template` is already wired up to this API (see `assets/js/tms/api.js` — it targets
`http://localhost:5000/api` when served from localhost, and the deployed backend URL
otherwise). For a new client, POST to `/api/auth/login`, store the returned `token`, and send
it as `Authorization: Bearer <token>` on subsequent requests. Set `CORS_ORIGIN` to whatever
origin serves that client.
