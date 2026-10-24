# Markup - Project Submission & Review Dashboard

Students submit projects, mentors approve or reject them.

**Stack:** TypeScript, Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui components, Express 5, PostgreSQL + Prisma, JWT role-based auth, React Hook Form + Zod, Recharts, `next/image`, Lucide React.

## Run it (Node 22+ and PostgreSQL needed)

```bash
# API
cd backend
cp .env.example .env              # set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init   # if you already ran an older version, run: npx prisma migrate dev --name add_review_fields
npm run db:seed                   # creates the admin: admin@example.com / Admin@12345
npm run dev                       # http://localhost:4000

# Web (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                       # http://localhost:3000
```

## Backend files

```
src/index.ts            app setup, routes, error handler
src/prisma.ts           Prisma client
src/schemas.ts          Zod validation
src/middleware.ts       JWT check + role check
src/routes/auth.ts      signup, login, me
src/routes/projects.ts  submit, list, stats, approve/reject
prisma/schema.prisma    User, Project
prisma/seed.ts          admin user
```
