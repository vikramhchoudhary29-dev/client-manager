# Arvik Digital Client & Project Manager

A mobile-responsive agency management application built with Next.js, TypeScript, Prisma, Neon PostgreSQL, Firebase Authentication, and Firebase Admin SDK.

## Features currently present

- Dashboard metrics
- Project creation, editing, viewing, and deletion
- Client details attached to projects
- Project payment records, status verification, payment history, and UPI payment links
- WhatsApp message links and marketing templates
- Business and UPI settings
- Responsive navigation and responsive page layouts

## Requirements

- Node.js 20+
- A Neon PostgreSQL database
- A Firebase project with Email/Password sign-in enabled
- A Firebase Web App configuration
- A Firebase service account for server-side session verification

## Local setup

1. Copy `.env.example` to `.env`.
2. Add your Neon PostgreSQL connection string to `DATABASE_URL`.
3. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
4. Create administrator user accounts manually under **Authentication → Users**. On the first login attempt, the app sends an email-verification link if the account is not verified; open it and then sign in again.
5. Add the Firebase Web App values to `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID`.
6. Add the Firebase service account's project ID, client email, and private key to `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. Keep these values server-side and never commit them.
7. Set `ADMIN_EMAILS` to a comma-separated list of verified administrator emails. Only listed addresses can create a CRM session.
8. Install and prepare the application:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

There is no default administrator password and no public sign-up form. Create administrators in Firebase Console and add their email addresses to `ADMIN_EMAILS`. Each administrator must verify their email address before a CRM session can be created.

## Firebase session security

The client signs in with Firebase Email/Password and exchanges the Firebase ID token for an HTTP-only server session cookie. Server routes verify the session cookie through Firebase Admin SDK and enforce the `ADMIN_EMAILS` allowlist. Email verification is required. The legacy `Admin` database model is retained to avoid forcing a destructive schema change, but it is no longer used for authentication.

## Environment variables

- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase web API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID used by the web app
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase web app ID
- `FIREBASE_PROJECT_ID`: server-side Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: service-account email
- `FIREBASE_PRIVATE_KEY`: service-account private key; preserve escaped newlines as `\\n` in Vercel environment variables or enter the multiline value supported by the platform
- `ADMIN_EMAILS`: comma-separated verified administrator email allowlist
- `APP_URL`: public app URL, used in generated links

## Vercel deployment

Add the environment variables above to the Vercel project. Never commit `.env`, Firebase service-account JSON files, private keys, or Neon credentials. Configure the Firebase Authentication authorized domains to include the deployed domain. Confirm `ADMIN_EMAILS` contains only authorized administrators.

## Database safety

The project has existing data, so inspect the target Neon database before applying schema changes. `npx prisma db push` updates the schema without creating migration history; do not reset or drop the production database to resolve schema drift. Back up production data before database changes.

## Payments

The public payment page creates a UPI URI/QR for the remaining project balance. Opening the UPI link is not proof of payment. Only verified payment records affect the received total. WhatsApp buttons open a prefilled message; they do not send automatically through the WhatsApp Business API.

## Current limitations

A dedicated client directory and automated maintenance renewal workflow are not yet implemented. Those are planned for the next CRM enhancement phase. Payment concurrency and database transaction handling should be tested against the live Neon database before production use.


## Phase 2 modules

The Phase 2 update adds a dedicated Clients module (search, create, edit, client history, guarded deletion), Maintenance & Renewals, CSV reports, expanded dashboard metrics, and print/save-as-PDF payment receipts. Existing Firebase session authentication and protected route layout are preserved.

### Database update

After pulling/extracting this version, set the existing environment variables in a local `.env` file (do not commit it), then run:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run dev
```

If this is a development database and you prefer syncing the schema directly, use `npx prisma db push` instead of `npx prisma db push`. Back up the database before applying schema changes.

### New routes

- `/clients` — searchable client directory
- `/clients/new` — add client
- `/clients/[id]` — client project and payment history
- `/renewals` — maintenance and renewal dates
- `/reports` — metrics and CSV export
- `/api/reports` — authenticated CSV download

The CSV export and all new API routes require the existing Firebase admin session.
