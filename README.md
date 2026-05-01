# ☁ CloudRec — Cloud Architecture Advisor

A full-stack **Next.js** web application that recommends the ideal cloud architecture (AWS, Azure, or GCP) based on your application type, expected scale, growth trajectory, and monthly budget. Features **Google OAuth** authentication, **PostgreSQL** database, **interactive charts**, **dark mode**, and **real-time currency conversion**.

---

## ✨ Features

- 🔐 **Google OAuth Authentication** — Secure sign-in using Google via Auth.js (NextAuth v5)
- 🗄️ **PostgreSQL Database** — Persistent user, account, session, and recommendation storage via Prisma ORM
- ☁️ **Cloud Cost Recommender** — Interactive 3-step wizard to get cost-optimized recommendations across AWS, Azure, and GCP
- 📊 **Interactive Charts** — Bar charts, radar charts, and component breakdown charts powered by Recharts
- 💾 **Save & View History** — Save recommendations to the database and revisit them on the Dashboard
- 🗑️ **Delete Recommendations** — Remove saved recommendations from the dashboard
- 🌙 **Dark Mode** — Toggle between light and dark themes with localStorage persistence
- 💱 **Real-Time Currency Conversion** — Live exchange rates (USD, INR, EUR) from ExchangeRate-API with 1-hour caching
- 📈 **Currency-Aware Budget** — Budget slider adapts to selected currency with automatic conversion
- 🎨 **Modern UI** — Clean, responsive design with step indicators, card pickers, and smooth animations

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework (App Router) |
| [Auth.js v5](https://authjs.dev/) | Authentication (Google OAuth) |
| [Prisma](https://www.prisma.io/) | Database ORM |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Recharts](https://recharts.org/) | Data visualization (charts) |
| [ExchangeRate-API](https://open.er-api.com/) | Live currency conversion |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Shadcn UI](https://ui.shadcn.com/) | UI component library |

---

## 📁 Project Structure

```
MinorProject/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.js              # Auth.js API route handler
│   │   ├── recommendations/
│   │   │   └── route.js              # CRUD API for recommendations (POST, GET, DELETE)
│   │   └── exchange-rates/
│   │       └── route.js              # Live exchange rate API with caching
│   ├── dashboard/
│   │   ├── page.js                   # Dashboard server component (auth + data fetch)
│   │   └── DashboardClient.js        # Dashboard client UI (list, detail, charts, delete)
│   ├── globals.css                   # Global styles
│   ├── layout.js                     # Root layout (ThemeProvider + CurrencyProvider)
│   └── page.js                       # Home page (auth gate + CloudRecommender)
├── components/
│   ├── CloudRecommender.js           # Cloud recommendation wizard (client component)
│   ├── Charts.js                     # Recharts components (Bar, Radar, Breakdown)
│   ├── ThemeProvider.js              # Dark/Light mode context with localStorage
│   ├── CurrencyProvider.js           # Currency context with live exchange rates
│   └── ui/                           # Shadcn UI components
├── lib/
│   └── prisma.js                     # Prisma client singleton
├── prisma/
│   └── schema.prisma                 # Database schema (User, Account, Session, Recommendation)
├── auth.js                           # Auth.js configuration (Google provider + Prisma adapter)
├── .env                              # Database connection string
├── .env.local                        # Auth secrets (Google OAuth + Auth secret)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/) installed and running locally
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Pavilioni5/MinorProject.git
cd MinorProject
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>"
```

Create a `.env.local` file in the root directory:

```env
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-your-google-client-secret"
AUTH_SECRET="your-random-secret-key"
```

> **Generating AUTH_SECRET:** Run the following command to generate a secure secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

### 4. Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Set **Application type** to **Web application**
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
5. Copy the **Client ID** and **Client Secret** into your `.env.local` file

### 5. Set Up the Database

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗃️ Database Schema

The app uses four tables managed by Prisma:

### User
| Field | Type | Description |
|---|---|---|
| id | String | Unique identifier (cuid) |
| name | String? | User's display name from Google |
| email | String? | User's email (unique) |
| emailVerified | DateTime? | Email verification timestamp |
| image | String? | Profile picture URL |
| createdAt | DateTime | Account creation time |
| updatedAt | DateTime | Last update time |

### Account
| Field | Type | Description |
|---|---|---|
| userId | String | Foreign key → User |
| type | String | Account type (`oidc`) |
| provider | String | OAuth provider (`google`) |
| providerAccountId | String | Google account ID |
| access_token | String? | OAuth access token |

### Session
| Field | Type | Description |
|---|---|---|
| sessionToken | String | Unique session token |
| userId | String | Foreign key → User |
| expires | DateTime | Session expiry |

### Recommendation
| Field | Type | Description |
|---|---|---|
| id | String | Unique identifier (cuid) |
| userId | String | Foreign key → User |
| appType | String | Application type (web_app, api_backend, etc.) |
| users | Int | Daily active users |
| growth | String | Growth trajectory (none, low, medium, high) |
| budget | Float | Monthly budget in USD |
| results | Json | Full provider comparison results |
| topPick | String | Recommended provider (aws, azure, gcp) |
| topCost | Float | Estimated cost of top pick |
| createdAt | DateTime | When the recommendation was generated |

---

## 💰 Cloud Pricing Reference

All prices are verified on-demand monthly rates (approximate as of 2025):

| Component | AWS | Azure | GCP |
|---|---|---|---|
| **Compute (Small, 2GB)** | $16.79 — EC2 t3.small | $18.40 — VM B1ms | $14.60 — e2-small |
| **Compute (Medium, 4GB)** | $33.58 — EC2 t3.medium | $36.79 — VM B2s | $29.20 — e2-medium |
| **Compute (Large, 8GB)** | $60.74 — EC2 t3.large | $73.58 — VM B4ms | $58.40 — e2-standard-2 |
| **Serverless** | $10.95 — Lambda + API GW | $11.68 — Azure Functions | $9.50 — Cloud Functions |
| **Database (Small)** | $29.20 — RDS db.t3.small | $31.54 — Azure SQL Basic | $25.23 — Cloud SQL micro |
| **Database (Medium)** | $49.06 — RDS db.t3.medium | $52.56 — Azure SQL S2 | $44.68 — Cloud SQL small |
| **Database (Large)** | $98.12 — RDS db.t3.large | $105.12 — Azure SQL S4 | $89.36 — Cloud SQL n1-s1 |
| **Storage (500GB)** | $11.50 — S3 Standard | $10.40 — Blob Storage | $10.00 — Cloud Storage |
| **CDN (1TB)** | $8.50 — CloudFront | $9.36 — Azure CDN | $8.00 — Cloud CDN |
| **Load Balancer** | $22.27 — ALB | $25.55 — Azure LB | $21.90 — Cloud LB |

---

## 🔧 Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on `localhost:3000` |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npx prisma studio` | Open database viewer on `localhost:5555` |
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Regenerate Prisma client |

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com/)
3. Add the following **Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` — your production PostgreSQL connection string (e.g., from [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/))
   - `AUTH_GOOGLE_ID` — your Google OAuth Client ID
   - `AUTH_GOOGLE_SECRET` — your Google OAuth Client Secret
   - `AUTH_SECRET` — your random secret key
4. Add your Vercel domain to **Authorized redirect URIs** in Google Cloud Console:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Deploy!

---

## 📝 License

This project is part of a Minor Project submission.
