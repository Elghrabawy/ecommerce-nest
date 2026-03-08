# E-Commerce REST API

A full-featured e-commerce backend built with **NestJS**, **TypeORM**, and **PostgreSQL**. Includes authentication, product/category management, cart, orders, Stripe payments, file storage (local/MinIO/Cloudinary), and transactional email.

---

## Features

- **Authentication** — JWT access + refresh token strategy, bcrypt password hashing
- **Users** — Registration, profile management, role-based access (admin/user)
- **Categories** — Nested tree categories with parent/child relationships
- **Products** — CRUD with image upload, slug generation, pagination, and filtering
- **Cart** — Per-user shopping cart with cart items
- **Wishlist** — Per-user product wishlist
- **Orders** — Order lifecycle management with automatic expiration of unpaid orders (cron job)
- **Payments** — Stripe payment intents + idempotent webhook handling, refunds
- **Reviews** — Product reviews with one-review-per-user enforcement
- **Address** — User shipping address management
- **Storage** — Pluggable storage providers: Local disk / MinIO (S3-compatible) / Cloudinary
- **Email** — Transactional emails via Mailtrap sandbox (welcome, payment success/failed, refund)
- **Mail Inbox Viewer** — Built-in UI to preview sent emails at `/mail-inbox.html`
- **Swagger** — Auto-generated API docs at `/api/docs`
- **Docker** — Full Docker Compose setup; migrations and seeds run automatically on first start

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | TypeORM 0.3 |
| Authentication | JWT (access + refresh tokens) |
| Payments | Stripe |
| File Storage | Local / MinIO / Cloudinary |
| Email | Nodemailer + Mailtrap sandbox |
| Validation | class-validator / class-transformer |
| Containerization | Docker + Docker Compose |

---

### Option 1 — Docker Compose (Recommended)

Spins up PostgreSQL, MinIO, and the app in one command. **Migrations and seeds run automatically on first start.**

**1. Create your environment file:**

```bash
cp .env.development
```

Fill in the required secrets (JWT, Stripe, Mailtrap) in `.env.development`. DB and MinIO values are pre-configured for Docker.

**2. Start everything:**

```bash
docker compose up --build
```

The app will be available at `http://localhost:3500`.

> On first run, migrations and seeds are applied automatically before the app starts.
> On subsequent restarts TypeORM skips already-applied migrations — safe to restart at any time.

**3. Stop:**

```bash
docker compose down
```

To also remove volumes (wipe the database):

```bash
docker compose down -v
```

---

### Option 2 — Local Development

**1. Install dependencies:**

```bash
npm install
```

**2. Set up environment:**

```bash
cp .env.development
```

Edit `.env.development` with your local PostgreSQL credentials and other secrets.

**3. Run migrations:**

```bash
npm run migration:run
```

**4. Seed the database (optional):**

```bash
npm run seed:run
```

**5. Start the development server:**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3500`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_EXPIRES_IN` | Access token expiry (e.g. `1d`) |
| `REFRESH_JWT_SECRET` | Secret for refresh tokens |
| `REFRESH_JWT_EXPIRES_IN` | Refresh token expiry (e.g. `30d`) |
| `SMTP_HOST` | SMTP host (Mailtrap: `sandbox.smtp.mailtrap.io`) |
| `SMTP_PORT` | SMTP port (Mailtrap: `587`) |
| `SMTP_USERNAME` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `MAILTRAP_INBOX_ID` | Mailtrap inbox ID (for mail viewer) |
| `MAILTRAP_API_TOKEN` | Mailtrap API token (for mail viewer) |
| `UPLOAD_PROVIDER` | `local` \| `minio` \| `cloudinary` |
| `MINIO_ENDPOINT` | MinIO host |
| `MINIO_PORT` | MinIO port (default: `9000`) |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET_NAME` | MinIO bucket name |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_CURRENCY` | Default currency (e.g. `usd`) |
| `ORDER_EXPIRATION_TIME_MINUTES` | Minutes before unpaid orders expire |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Run compiled build |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:generate --name=Name` | Generate migration from entity diff |
| `npm run seed:run` | Seed database with fake data |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage report |
| `npm run lint` | Lint and auto-fix |

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3500/api/docs
```

---

## UI Test Pages

The project includes two built-in HTML pages for manual testing without external tools:

### 💳 Payment Page — `/payment.html`

```
http://localhost:3500/payment.html
```

A Stripe payment form for testing the full payment flow end-to-end. Use [Stripe test cards](https://stripe.com/docs/testing#cards) (e.g. `4242 4242 4242 4242`) to simulate payments.

### ✉️ Mail Inbox Viewer — `/mail-inbox.html`

```
http://localhost:3500/mail-inbox.html
```

A full email client UI that shows all emails sent through the Mailtrap sandbox. Preview HTML emails, check recipients/subjects, and delete messages — without leaving the app.

Requires `MAILTRAP_INBOX_ID` and `MAILTRAP_API_TOKEN` in `.env.development`.  
Get your API token from **mailtrap.io → Avatar → API Tokens**.

---

## Stripe Webhook (Local Testing)

Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks to your local server:

```bash
stripe listen --forward-to http://localhost:3500/payment/webhook
```

Copy the displayed signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.development`.

