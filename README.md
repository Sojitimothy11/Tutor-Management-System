# Tutor Management System (TMS)

A full-stack school/tutor management system: a Bootstrap admin-panel frontend backed by a
Node.js/Express REST API, with role-based access for administrators, teachers, and students.

Originally a group project for Advanced Professional Practice — started as a static HTML
template and grown into a working full-stack application with a real database,
authentication, and deployed, connected frontend/backend.

## Live Demo

| | URL |
|---|---|
| **Frontend** | https://tutor-management-system-msbh.vercel.app |
| **Backend API** | https://backend-mocha-two-94.vercel.app/api |

Log in with the seeded admin account:

- **Email:** `admin@tms.local`
- **Password:** `Admin@12345`

## Features

- **Authentication & roles** — JWT-based login/register, three roles (`ADMIN`, `TEACHER`,
  `STUDENT`) with server-enforced permissions on every endpoint, not just hidden UI.
- **Departments & Subjects** — full CRUD, subjects can be linked to a department and a
  teacher.
- **Students & Teachers** — full CRUD with admin/teacher directory views and a self-service
  `/me` view for the logged-in student or teacher. Admins can optionally provision a login
  account for a teacher at the same time as their profile.
- **Fees** — fee structures (amount, academic year, due date) and fee payments/collections
  (who paid what, when, and how), with students able to see only their own payments.
- **Exams** — exam definitions per subject plus recorded results per student, with students
  able to see only their own results.
- **Dashboards** — role-specific dashboards: admin gets system-wide counts, teachers see
  their assigned subjects, students see their own results and fee payments.
- **Profile** — view account details and change password.

Not every page in the original template is wired up — modules with no backend support yet
(library, transport, hostel, timetable, events/holidays, salary, expenses, sports,
inbox/messaging) remain static UI only. See [Roadmap](#roadmap--known-limitations) below.

## Tech Stack

**Backend** (`backend/`)
- Node.js + Express 4
- PostgreSQL (hosted on [Neon](https://neon.tech), provisioned via the Vercel Marketplace)
- Prisma 6 ORM
- JWT (`jsonwebtoken`) + `bcryptjs` for auth
- Zod for request validation
- `helmet`, `cors`, `morgan`

**Frontend** (`html-template/`)
- Static HTML + Bootstrap 4 admin template (originally a
  [DreamGuys](https://dreamguystech.com/)-style preschool/school admin theme)
- Vanilla JS (`assets/js/tms/`) — a small fetch-based API client (`api.js`), an auth
  guard (`guard.js`), and one script per page/module handling that page's data and forms
- No build step, no framework — plain script tags

**Hosting**
- Both frontend and backend are deployed on [Vercel](https://vercel.com) as separate
  projects from the same repo, auto-deploying on push to `main`.

## Project Structure

```
Tutor-Management-System/
├── backend/                  # Express API (see backend/README.md for full API reference)
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   ├── migrations/
│   │   └── seed.js           # Creates the default admin + sample data
│   └── src/
│       ├── app.js            # Express app: middleware + route mounting
│       ├── server.js         # Entrypoint
│       ├── middleware/       # auth (JWT), validate (Zod), error handler
│       ├── routes/           # One file per resource
│       ├── controllers/      # Request handlers
│       └── validators/       # Zod schemas
└── html-template/            # Frontend (static site)
    ├── assets/js/tms/        # API client, auth guard, per-page scripts
    ├── login.html / register.html
    ├── index.html            # Admin dashboard
    ├── student-dashboard.html / teacher-dashboard.html
    ├── students.html / add-student.html / edit-student.html / student-details.html
    ├── teachers.html / add-teacher.html / edit-teacher.html / teacher-details.html
    ├── departments.html / subjects.html / fees.html / fees-collections.html / exam.html
    └── ... (add-/edit- variants, plus not-yet-wired pages)
```

## Getting Started

### Prerequisites

- Node.js 18+ (developed against Node 24)
- A PostgreSQL database (local Postgres, or a free [Neon](https://neon.tech) project — the
  same one this project's Vercel deployment uses)

### 1. Clone and install the backend

```bash
git clone https://github.com/Sojitimothy11/Tutor-Management-System.git
cd Tutor-Management-System/backend
npm install
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` (and `DATABASE_URL_UNPOOLED` if using Neon's pooled +
direct connection pair) to your Postgres instance, then set a real `JWT_SECRET`.

```bash
npx prisma migrate dev      # creates tables and runs the seed script
npm run dev                 # starts the API on http://localhost:5000
```

This seeds an admin account (`admin@tms.local` / `Admin@12345`), a sample department, and a
sample subject. Full API route reference, auth model, and env var docs are in
[`backend/README.md`](backend/README.md).

### 2. Serve the frontend

The frontend is plain static HTML/CSS/JS — any static file server works:

```bash
cd ../html-template
npx serve -l 5500 .
```

Open `http://localhost:5500/login.html`. The frontend's `assets/js/tms/api.js` automatically
talks to `http://localhost:5000/api` when served from `localhost`, and to the deployed
backend otherwise — no configuration needed for local dev.

### 3. CORS

The backend's `CORS_ORIGIN` env var must match whatever origin serves the frontend
(`http://localhost:5500` for the setup above). It's already set in `.env.example`.

## Roles & Permissions

| Role | Can do |
|------|--------|
| `ADMIN` | Everything — manage departments, subjects, students, teachers, fees, exams; provision teacher/admin login accounts |
| `TEACHER` | View students/teachers directory, manage exams and results, view fee payments |
| `STUDENT` | View/edit own profile, view own exam results and fee payments |

Public sign-up (`register.html`) always creates a `STUDENT` account. `TEACHER` and `ADMIN`
accounts can only be created by an existing admin. Permissions are enforced by the backend on
every request — the frontend hides UI it can't use, but the API is the actual authority.

## Deployment

Both projects are linked to this GitHub repo and deploy automatically on push to `main`:

- **Backend** — Vercel project `backend`, root directory `backend/`. Uses Vercel's
  zero-config Express framework preset. Database is Neon Postgres, provisioned through the
  Vercel Marketplace and connected via `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. A
  `postinstall` script (`prisma generate`) runs on every install so the Prisma Client stays
  in sync with the schema.
- **Frontend** — Vercel project `tutor-management-system-msbh`, root directory
  `html-template/`. Static deployment, no build step.

Required backend environment variables in Vercel: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
`JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (set to the deployed frontend's origin).

## Roadmap / Known Limitations

- **Unwired modules** — library, transport, hostel, timetable, events/holidays, salary,
  expenses, sports, and inbox/messaging exist as static template pages only; there's no
  backend data model or API for them yet.
- **No password reset flow** — `forgot-password.html` is not wired up.
- **SQLite → Postgres migration** — the backend originally used SQLite for local simplicity;
  it now uses Postgres everywhere (local and deployed) so behavior matches between
  environments.
- **UI role-based hiding is cosmetic** — real access control lives in the backend; the
  frontend just avoids showing buttons a user isn't allowed to use.

## About

Built as a group project for Advanced Professional Practice.
