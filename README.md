# Client & Project Manager

Simple Next.js app for managing clients, projects, payments and marketing messages.

## Stack
- Next.js
- TypeScript
- Prisma
- Neon PostgreSQL
- Vercel
- Simple signed-cookie admin authentication
- Direct UPI QR + UPI deep link

## Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your Neon PostgreSQL connection string in `DATABASE_URL`.
4. Set a strong random `SESSION_SECRET`.
5. Set `APP_URL` to your local URL while developing.
6. Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

Initial admin:
- Email: admin@example.com
- Password: admin123

Change the seed credentials before using the app in production.

## Vercel

Add the same environment variables in Vercel:
- DATABASE_URL
- SESSION_SECRET
- APP_URL (your deployed URL)

Build command is already configured through `npm run build`.

## UPI

Go to Settings and enter:
- Company / Business Name
- UPI ID
- Payee / Display Name

The payment page creates a dynamic UPI URI containing the current remaining amount. Opening the link is NOT proof of payment. Payments only affect the verified total after admin verification.

## Important

This first version intentionally stays simple. It has no task module, no payment gateway, no WhatsApp Business API, and no multi-role system.

## Payment module update

The payment module now supports advance payments, project payments, project-wise outstanding totals, payment history, WhatsApp payment messages, editable/deletable payments, and direct UPI payment links.

After replacing an older copy of this app, run:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Do not reset the database. Existing Payment rows automatically use `PROJECT_PAYMENT` as their type; new project creation can record an initial verified advance.
