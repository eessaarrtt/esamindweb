# ESAMIND

ESAMIND is a production-ready web application that serves as the central brand and backend for multiple Etsy shops selling digital spiritual services (tarot readings, energy readings, etc.).

## Overview

ESAMIND connects to one or more Etsy shops, receives paid orders for digital readings, parses buyer personalization data, generates personalized readings using OpenAI (acting as the persona "Esara Vance"), stores readings and order status, and helps deliver readings back to customers.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with a calm, mystical aesthetic
- **Database**: SQLite via Prisma (easily switchable to Postgres)
- **APIs**: Etsy v3 REST API, OpenAI Chat Completions
- **State Management**: React Server Components + Client Components

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (you can copy from `.env.example`):

```env
NEXT_PUBLIC_APP_NAME=ESAMIND
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o

ETSY_CLIENT_ID=your-etsy-client-id
ETSY_CLIENT_SECRET=your-etsy-client-secret
ETSY_REDIRECT_URI=https://esamind.app/api/oauth/etsy/callback

DEFAULT_ETSY_SHOP_ID=

ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD_HASH=your-bcrypt-hash
DATABASE_URL=file:./dev.db
```

**Important**: 
- Generate a bcrypt hash for your password using the helper script:
  ```bash
  node scripts/hash-password.js your-password
  ```
  Or use Node.js directly:
  ```js
  const bcrypt = require('bcryptjs');
  bcrypt.hash('your-password', 10).then(console.log);
  ```
- Set `ETSY_REDIRECT_URI` to match your deployment URL or `http://localhost:3000/api/oauth/etsy/callback` for local development.
- For local development, you can set `NEXT_PUBLIC_APP_URL=http://localhost:3000` (optional, defaults to localhost:3000).

### 3. Database Setup

Run Prisma migrations to create the database:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Connecting Your First Etsy Shop

1. **Get Etsy API Credentials**:
   - Go to [Etsy Developers](https://www.etsy.com/developers/)
   - Create an app and get your Client ID and Client Secret
   - Add your redirect URI to the app settings

2. **Connect Shop**:
   - Log in to the dashboard at `/login`
   - Navigate to `/dashboard/shops`
   - Click "Add New Shop"
   - Complete the OAuth flow

3. **Map Listings**:
   - After connecting, you'll need to map Etsy listings to product codes
   - For now, this can be done manually via database seeding or a simple script
   - Example product codes: `3_card`, `deep_love`, etc.

## Project Structure

```
/
  app/
    layout.tsx              # Root layout
    page.tsx                 # Public landing page
    about/page.tsx           # About page
    login/page.tsx           # Login page
    dashboard/
      layout.tsx             # Dashboard layout with sidebar
      page.tsx               # Dashboard overview
      shops/page.tsx         # Manage Etsy shops
      orders/page.tsx        # Order inbox
      orders/[id]/page.tsx   # Single order detail
      settings/page.tsx      # Settings
    api/
      health/route.ts
      auth/login/route.ts
      auth/logout/route.ts
      oauth/etsy/authorize/route.ts
      oauth/etsy/callback/route.ts
      orders/sync/route.ts
      orders/[id]/mark-sent/route.ts
      readings/generate/route.ts
  prisma/
    schema.prisma            # Database schema
  lib/
    prisma.ts                # Prisma client
    etsy.ts                  # Etsy API client
    openai.ts                # OpenAI client
    auth.ts                  # Authentication utilities
    parsing.ts               # Personalization parsing
    prompts/
      products.ts            # Prompt builders
  components/
    dashboard/               # Dashboard components
```

## Key Features

### Dashboard
- **Overview**: Statistics and recent orders
- **Shops**: Manage connected Etsy shops
- **Orders**: View and filter orders by status
- **Order Detail**: View order info, generate readings, copy to clipboard, mark as sent

### Order Sync
- Manually sync orders from Etsy via the "Sync Orders Now" button
- Automatically creates orders in the database
- Parses personalization data (name, age, question)

### Reading Generation
- Generates personalized readings using OpenAI
- Uses product-specific prompts
- Saves readings to the database
- Supports regeneration

## Database Models

- **EtsyShop**: Connected Etsy shops with OAuth tokens
- **EtsyListing**: Mapping of Etsy listings to product codes
- **Order**: Orders with personalization, readings, and status

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

For production, consider:
- Switching to Postgres (update `DATABASE_URL` and Prisma schema)
- Setting up Vercel Cron for automatic order syncing
- Adding proper session management (NextAuth.js recommended)

## Notes

- The app uses a simple password-based authentication for MVP
- Etsy listing to product code mapping needs to be set up manually
- Reading delivery is currently manual (copy-paste); Etsy messaging API integration can be added later

## License

Private - All rights reserved
