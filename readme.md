# HireLens

> AI-powered career assistant — analyze your resume, match it to job descriptions, and generate tailored cover letters in seconds.

**Live demo:** [hire-lens-nu.vercel.app](https://hire-lens-nu.vercel.app)

---

## What It Does

HireLens gives job seekers three AI-driven tools in one place:

- **Resume Analysis** — Upload your resume and get a detailed breakdown of strengths, gaps, and actionable improvements.
- **Job Match** — Paste a job description alongside your resume and see how well you align, with a scored report highlighting matching and missing keywords.
- **Cover Letter Generator** — Produce a polished, role-specific cover letter based on your resume and the target job description.

All three features run on Azure OpenAI (GPT-4o mini with Structured Outputs) and consume **credits**. New users receive 3 free credits on sign-up.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) · TypeScript |
| AI | Azure OpenAI — GPT-4o mini (Structured Outputs) |
| Auth | Clerk |
| Database | PostgreSQL · Prisma ORM |
| Billing | Paddle (credits, subscriptions, webhooks) |
| Styling | Tailwind CSS · PostCSS |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted — [Neon](https://neon.tech) works great)
- An [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) resource with a `gpt-4o-mini` deployment
- A [Clerk](https://clerk.com) application
- A [Paddle](https://paddle.com) account (sandbox is fine for development)

### 1. Clone & install

```bash
git clone https://github.com/agrimaprajapat/HireLens.git
cd HireLens
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI resource URL (e.g. `https://my-resource.openai.azure.com`) |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name — must be `gpt-4o-mini` |
| `AZURE_OPENAI_API_VERSION` | `2024-12-01-preview` or later (required for Structured Outputs) |
| `DATABASE_URL` | Pooled PostgreSQL connection string |
| `DIRECT_URL` | Direct PostgreSQL URL (used by Prisma migrations) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route (e.g. `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route (e.g. `/sign-up`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (leave blank to disable) |
| `NEXT_PUBLIC_PADDLE_ENV` | `sandbox` or `production` |
| `PADDLE_API_KEY` | Paddle API key |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook signing secret |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle client token |
| `PADDLE_PRICE_STUDENT_PRO` | Paddle price ID for the Student Pro plan |
| `PADDLE_PRICE_PLACEMENT_PASS` | Paddle price ID for the Placement Pass |

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable UI components
└── lib/              # Shared utilities, AI client, Prisma client
prisma/
└── schema.prisma     # Database schema
```

---

## Data Model

```
User ──< ResumeAnalysis
     ──< JobMatch
     ──< CoverLetter
     ──< Payment
     ──< Subscription
```

- **User** — mirrors Clerk identity; holds a `credits` balance (default: 3).
- **ResumeAnalysis / JobMatch / CoverLetter** — AI result payloads stored as JSON, linked to the user.
- **Payment / Subscription** — Paddle billing records; credits are the sole authorization mechanism for AI features.
- **WebhookEvent** — idempotency ledger so Paddle webhooks are never processed twice.
- **BillingAuditLog** — append-only audit trail for support and debugging.

---

## Credits & Billing

Each AI action (resume analysis, job match, cover letter) costs **1 credit**.

| Plan | Credits | Notes |
|---|---|---|
| Free | 3 | Granted on sign-up |
| Student Pro | Subscription | Recurring plan via Paddle |
| Placement Pass | One-time | Credit bundle via Paddle |

---

## Deployment

The project is optimized for [Vercel](https://vercel.com). After forking:

1. Import the repo in the Vercel dashboard.
2. Add all environment variables from `.env.example`.
3. Set `DIRECT_URL` to a direct (non-pooled) connection string so Prisma can run migrations.
4. Deploy — Vercel will run `next build` automatically.

For the Paddle webhook, set the endpoint to `https://<your-domain>/api/webhooks/paddle`.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR

---

## License

This project is open source. See [LICENSE](LICENSE) for details.