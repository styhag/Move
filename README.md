# Move

Modern, mobile-first scheduling and time reporting for moving companies.

## Stack
Next.js / React / TypeScript / Vercel / Supabase PostgreSQL.

## Local development
```bash
npm install
npm run dev
```

The current UI uses **in-memory demo data**. It is not connected to production, does not authenticate users and must not be used for real employee data.

## Database isolation
All Move business tables live in the `move` schema, separate from existing `energy` and `public` tables in the shared Supabase project. Migration in `supabase/migrations` is portable to a new Supabase project. Tables have RLS enabled with **no public access grants** until access policies and a secure API are implemented and tested. Auth identities are shared at the Supabase-project level and require a separate migration plan.

## Roadmap
1. Secure authentication and membership-aware API.
2. Real persistence, time + material submission and approvals.
3. Availability and shift offers with transactional acceptance.
4. Tests, staging deployment and pilot.

## Design v2
Mobile-first UI lives in `app/page.tsx` and `app/globals.css`. Both are required for a complete render. The demo uses local browser storage only.
