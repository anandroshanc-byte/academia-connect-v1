# Academia Connect — Academia-Industry Matching Platform

A real, three-sided web app built around your original matching-engine
prototype: **students**, **companies**, and **institutions**, with actual
accounts, a database, and the deterministic matching engine wired end to end.

The matching logic itself (`src/lib/matching/{types,eligibility,compatibility,matchingEngine}.ts`)
is your original prototype code, **unchanged**. Everything else — auth, database,
API routes, and UI — is new, built to use it for real.

## What's here

- **Students** build a profile (degree, year, CGPA, skills with proficiency),
  browse opportunities ranked by compatibility score, see a full explanation
  of every score (matched/weak/missing skills), and apply.
- **Companies** post opportunities with eligibility rules and skill
  requirements, then see applicants ranked by compatibility with the same
  explanation, and move them through applied → shortlisted → accepted/rejected.
- **Institutions** see students whose profile institution name matches theirs,
  and can bump a self-declared skill to "institution-verified," which
  increases its trust weight in every future match (per the engine's
  verification-trust logic).

## Run it locally (zero config)

Requires Node 18+.

```bash
npm install
npx prisma migrate dev --name init   # creates dev.db (SQLite) with the schema
npm run db:seed                      # loads demo institution/companies/students
npm run dev
```

Open http://localhost:3000. Demo accounts are available directly from the Demo launcher:

| Role | Email |
|---|---|
| Institution | admin@vjit.edu |
| Company | hiring@nimbusdata.io |
| Company | talent@finflow.com |
| Student (strong match) | ananya@student.vjit.edu |
| Student (near-match) | karan@student.vjit.edu |
| Student (ineligible for seeded postings) | fatima@student.vjit.edu |

Log in as `ananya@student.vjit.edu` and open **Opportunities** to see a fully
scored, explained match against the seeded Data Science internship.

## Going to production (free tier, ~10 minutes)

SQLite works locally but Vercel's filesystem is ephemeral, so production
needs a real Postgres database. Both Neon and Supabase have free tiers.

1. **Get a Postgres URL.** Create a free project at [neon.tech](https://neon.tech)
   or [supabase.com](https://supabase.com) and copy the connection string.
2. **Switch the schema provider.** In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. **Push the schema:**
   ```bash
   DATABASE_URL="your-postgres-url" npx prisma migrate deploy
   DATABASE_URL="your-postgres-url" npm run db:seed   # optional, demo data
   ```
4. **Deploy to Vercel:** push this repo to GitHub, import it at
   [vercel.com/new](https://vercel.com/new), and set these environment
   variables in the Vercel project settings:
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your deployed URL, e.g. `https://yourapp.vercel.app`
5. Deploy. Vercel runs `npm install` (which runs `prisma generate` via
   `postinstall`) and `npm run build` automatically.

## Project structure

```
prisma/schema.prisma        Database schema (Users, Students, Companies,
                             Institutions, Opportunities, Applications)
prisma/seed.ts               Demo data
src/lib/matching/            Your original matching engine, unchanged, plus
                              adapter.ts which maps DB rows to its plain types
src/lib/auth.ts              NextAuth config (email+password, JWT sessions)
src/app/api/                 All backend routes
src/app/{student,company,institution}/   Role-specific pages
src/components/              Shared UI (skill picker, match score badge, etc.)
```

## What's built vs. what's intentionally left for you

**Built and working:** signup/login for all three roles, student profile +
skills editor, opportunity posting, eligibility + compatibility scoring on
every listing, apply flow, ranked applicant view for companies, application
status management, institution skill verification, role-based route
protection.

**Not built yet** (flagged rather than faked):
- Email verification / password reset
- File uploads (resumes, company logos)
- Industry-verified skills (level 4) — currently only institutions can verify
  (to level 3); wiring a company to confirm a skill after a real work
  engagement would be a natural next step
- Notifications (email/in-app) when application status changes
- Search/filter beyond the eligible/near-match toggle on the student dashboard
- Admin tooling to moderate postings or accounts

## A note on how this was built

This was generated in an environment with no internet access, so none of it
has been run through `npm install` or a live build — it's written to be
correct, standard Next.js/Prisma/NextAuth code, but you should expect to fix
a handful of small issues (a type mismatch, a missing import) on first run.
If `npm run dev` throws an error, paste it back to me and I'll fix it.

## Security and product baseline

Academia Connect is intentionally an employability/internship platform, not a social network. There are no feeds, followers, posts or connection mechanics in the MVP.

### Organization trust
- Student accounts can register normally.
- Company and institution accounts are created as `PENDING` and cannot access protected organization features until an admin verifies them.
- Organization registration collects an official website and registration/institutional identifier.
- Organization email domains are checked against the supplied official website when applicable.
- Only verified institutions are selectable by students.
- Opportunities created by verified companies enter `PENDING` moderation and must be approved by an admin before students can see/apply.

### Authorization
- Roles are server-controlled and cannot be changed from client requests.
- Organization verification is checked server-side.
- Institution student access is scoped by `institutionId`, not a user-editable institution name.
- Candidate/application access is scoped to the owning company or student.
- API responses do not expose password hashes.

### Matching
Eligibility is evaluated before compatibility. Compatibility is deterministic and explainable. AI is not trusted for eligibility or final scoring. Mandatory skill gaps may create a near-match; hard academic/profile requirements remain true eligibility gates.

### Prototype vs production
SQLite is used for zero-setup local development. For real internet deployment, migrate to PostgreSQL, private object storage, HTTPS, production secrets, email verification, a persistent rate-limit store, malware scanning for uploads, backups, monitoring, dependency review and a formal security review.

### Demo accounts
Demo access is direct from the Demo launcher.
- Student: `ananya@student.vjit.edu`
- Student: `karan@student.vjit.edu`
- Student: `fatima@student.vjit.edu`
- Company: `hiring@nimbusdata.io`
- Company: `talent@finflow.com`
- Institution: `admin@vjit.edu`
- Academician: `faculty@vjit.edu`
- Admin: `admin@academiaconnect.local`

## Local configuration

A local `.env.local` is included for the prototype so NextAuth has a `NEXTAUTH_SECRET` and Prisma has `DATABASE_URL`. Do not commit or reuse this secret for a public deployment. Generate a fresh production secret before deployment.

If the browser shows NextAuth's generic **Server error / problem with the server configuration** page, first confirm that `.env.local` exists in the `app` folder and contains `NEXTAUTH_SECRET`, `DATABASE_URL`, and `NEXTAUTH_URL`, then restart `npm run dev`.

## Notifications
Academia Connect includes a lightweight in-app notification system with no external service dependency. Notifications are stored in SQLite, scoped to the authenticated user, indexed for fast reads, and surfaced through the navbar bell. Current events include opportunity submission/moderation, application receipt/status changes, organization verification, and institution skill verification. The client polls only while the tab is visible and shows the latest 30 notifications while the unread count is queried separately.

## SIH-ready demo
The top-left **Demo** control opens five seeded judge workspaces. Demo accounts are entered directly from the Demo launcher and are explicitly marked `isDemo=true` so the Admin **Reset demo data** action can restore only the canonical demo dataset. Real/non-demo records are not targeted by the reset.

Demo accounts:
- Student: `ananya@academiaconnect.demo`
- Academician: `faculty@academiaconnect.demo`
- Institution: `institution@academiaconnect.demo`
- Company: `talent@ayurtech.demo`
- Admin: `admin@academiaconnect.demo`
