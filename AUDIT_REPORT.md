# Client Manager — Code Audit Report

Audit date: 2026-10-19
Scope: static inspection of the supplied ZIP. A production build and live Neon/Firebase integration test could not be run because dependencies were not installed and npm registry access failed in this environment.

## High-priority findings and changes made in this update

1. **Legacy authentication and known default credentials** — the app used a custom HMAC cookie with a hardcoded fallback secret, a Prisma Admin password table, and a login screen that displayed `admin@example.com / admin123`. Replaced the login flow with Firebase Email/Password authentication, server-side Firebase ID-token verification, verified-email enforcement, an `ADMIN_EMAILS` allowlist, and an HTTP-only session cookie. Removed the old login API and removed default admin creation from the seed script. The legacy `Admin` model is intentionally retained to avoid forcing a database schema change.
2. **Missing server-side authentication provider setup** — added Firebase client and Firebase Admin helpers, a session exchange route, and environment variable documentation. Production access must be configured using Firebase service-account values and the administrator email allowlist.
3. **Project creation could leave partial records** — changed client, project, and initial advance creation to run in one Prisma transaction.
4. **Payment amount validation** — strengthened payment creation validation for amount, status, type, mode, date, and project/client association. Pending payments now reserve the remaining project amount when new payment entries are created. Added serializable transaction handling for payment creation and pending-payment verification. Live concurrent-payment tests are still required; Prisma serialization conflicts should be handled with a retry strategy if encountered in production.
5. **Dashboard query bug** — removed a duplicate verified-payment query that was incorrectly named `pending` and was unused; clarified the displayed total as outstanding.
6. **Mobile responsiveness** — added a responsive collapsible mobile navigation, smaller-screen layout breakpoints, single-column forms, adaptive stat cards, scrollable tables, mobile-safe payment QR sizing, focus states, and reduced-motion support.
7. **Setup documentation** — replaced instructions that advertised a default password with Firebase setup instructions and safer database/deployment guidance.

## Additional findings requiring attention before production

- **Project update endpoint:** still needs centralized validation for project status, maintenance charge, and completion date, and should update client and project in a single transaction.
- **Payment edit endpoint:** should use the same serializable transaction and date/mode validation as payment creation. Concurrent edits/verifications need integration tests and a retry policy for serialization conflicts.
- **Public payment page:** project/client details and outstanding amount are exposed by an unguessable-but-shareable project ID. Decide whether a separate signed, expiring payment token is needed before using this link for sensitive client information.
- **Client directory:** clients are primarily created through project creation; a dedicated independent client module is not implemented yet.
- **Maintenance workflow:** the current schema has a yearly maintenance charge but no renewal dates, renewal history, reminder status, or scheduled notifications.
- **Marketing:** WhatsApp links open a prefilled message; they do not automatically send messages through the WhatsApp Business API.
- **Dependency lockfile:** the package manifest now declares Firebase packages, but the lockfile could not be refreshed because registry access failed. Run `npm install` in an internet-connected development environment and commit the updated lockfile.
- **Build verification:** `npm run build`, lint, and end-to-end tests were not run in this environment. Run them after installing dependencies and configuring environment variables.
- **Database safety:** no database reset or destructive migration was run. Inspect and back up the actual Neon database before applying schema changes.

## Firebase configuration checklist

- Enable Email/Password in Firebase Authentication.
- Create admin accounts manually in Firebase Console; do not expose public sign-up.
- Verify each administrator's email.
- Add each authorized address to `ADMIN_EMAILS`.
- Configure `NEXT_PUBLIC_FIREBASE_*` web app variables.
- Configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` as server-only secrets.
- Add the deployed domain to Firebase Authentication's authorized domains.
- Never commit the service-account private key or Neon connection string.
