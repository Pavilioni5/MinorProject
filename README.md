# ☁ CloudRec — Cloud Architecture Advisor

A full-stack **Next.js** web application that recommends the ideal cloud architecture (AWS, Azure, or GCP) based on your application type, expected scale, growth trajectory, and monthly budget. Features **Google OAuth** authentication and a **PostgreSQL** database for persistent user management.

---

## ✨ Features

- 🔐 **Google OAuth Authentication** — Secure sign-in using Google via Auth.js (NextAuth v5)
- 🗄️ **PostgreSQL Database** — Persistent user, account, and session storage via Prisma ORM
- ☁️ **Cloud Cost Recommender** — Interactive 3-step wizard to get cost-optimized recommendations across AWS, Azure, and GCP
- 📊 **Provider Comparison** — Side-by-side cost breakdown with growth-adjusted estimates
- 🎨 **Modern UI** — Clean, responsive design with step indicators, card pickers, and animated components

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework (App Router) |
| [Auth.js v5](https://authjs.dev/) | Authentication (Google OAuth) |
| [Prisma](https://www.prisma.io/) | Database ORM |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Shadcn UI](https://ui.shadcn.com/) | UI component library |

---

## 📁 Project Structure

```
MinorProject/
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.js          # Auth.js API route handler
│   ├── globals.css            # Global styles
│   ├── layout.js              # Root layout
│   └── page.js                # Home page (auth gate + main UI)
├── components/
│   ├── CloudRecommender.js    # Cloud recommendation wizard (client component)
│   └── ui/                    # Shadcn UI components
├── lib/
│   └── prisma.js              # Prisma client singleton
├── prisma/
│   └── schema.prisma          # Database schema (User, Account, Session)
├── auth.js                    # Auth.js configuration (Google provider + Prisma adapter)
├── .env                       # Database connection string
├── .env.local                 # Auth secrets (Google OAuth + Auth secret)
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
git clone <your-repo-url>
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

The app uses three tables managed by Prisma:

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
| id | String | Unique identifier (cuid) |
| userId | String | Foreign key → User |
| type | String | Account type (`oidc`) |
| provider | String | OAuth provider (`google`) |
| providerAccountId | String | Google account ID |
| access_token | String? | OAuth access token |
| refresh_token | String? | OAuth refresh token |
| expires_at | Int? | Token expiration |

### Session
| Field | Type | Description |
|---|---|---|
| id | String | Unique identifier (cuid) |
| sessionToken | String | Unique session token |
| userId | String | Foreign key → User |
| expires | DateTime | Session expiry |

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
