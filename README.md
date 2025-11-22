# Quote Cards

**AI-powered quote platform that helps freelancers price with confidence and close more deals.**

Turn messy project notes into professional, interactive quotes with smart pricing intelligence, market benchmarks, and instant payment collection.

## Breakthrough Features

### Smart Negotiation
Every line item includes AI-generated market intelligence:
- **Market rate benchmarks** (min/max range with visual chart)
- **Complexity scoring** (Low/Medium/High assessment)
- **Value justification** ("Why it matters" for each deliverable)
- **ROI projections** (Expected business impact)
- **Interactive 3D flip cards** (hover/tap to reveal insights)

### Smart Retainer
Monthly retainer options with risk-based urgency:
- **Alternative cost comparison** (vs hiring in-house)
- **Risk of inaction** messaging
- **Market positioning** for recurring rates
- **Split flip card UI** (analysis on top, controls on bottom)

### Multi-Provider Payments
Intelligent payment routing for global + African markets:
- **Stripe** for USA, Europe, and global
- **Flutterwave** for Nigeria, Kenya, South Africa, Ghana
- **Automatic routing** based on currency (NGN/ZAR/KES/GHS → Flutterwave)
- **User preference override** available

### Payment Flexibility
- Client-controlled payment timing slider (deposit vs full upfront)
- 3-tier package selection (Essential/Recommended/Premium)
- Subscription support for retainers
- Mixed payment types (deposit + recurring)

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Auth:** Clerk
- **AI:** Google Gemini 3
- **Payments:** Stripe + Flutterwave
- **Styling:** Tailwind CSS 4 + Framer Motion
- **State:** Zustand

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/ojieame12/natepay.git
cd natepay
npm install
```

### 2. Environment Variables
Create `.env.local` with:
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Flutterwave (Optional - for African markets)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...

# App URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SUCCESS_URL=http://localhost:3000/q/success?slug={slug}
STRIPE_CANCEL_URL=http://localhost:3000/q/cancel?slug={slug}

# Platform Settings
PLATFORM_FEE_PERCENT=5
```

### 3. Database Setup
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Stripe Webhook Listener (Separate Terminal)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Architecture

### Payment Flow
```
1. Freelancer creates quote with AI assistance
2. AI generates:
   - Market-benchmarked pricing
   - 3 package tiers
   - Payment plan options
   - Smart negotiation data
3. Quote shared via public link
4. Client views interactive quote
5. Client selects package + payment timing
6. Payment processed via Stripe or Flutterwave
7. Webhook updates quote status
8. Freelancer receives payout
```

### Provider Routing
```typescript
// Automatic selection based on currency
NGN, ZAR, KES, GHS → Flutterwave
USD, EUR, GBP, etc → Stripe
Override: User can set preferredProvider in settings
```

## Key Routes

- `/` - Onboarding flow
- `/dashboard` - Quote list with analytics
- `/create` - AI-powered quote creation
- `/finance` - Stripe Connect payout setup
- `/q/[slug]` - Public quote page (shareable)
- `/settings` - User preferences

## API Endpoints

- `POST /api/ai/generate` - Generate quote with Gemini
- `GET/POST /api/quotes` - Quote CRUD
- `GET /api/quotes/public/[slug]` - Public quote fetch
- `POST /api/checkout` - Initiate payment (Stripe or Flutterwave)
- `POST /api/subscriptions` - Start retainer subscription
- `POST /api/webhooks/stripe` - Stripe payment events
- `POST /api/webhooks/flutterwave` - Flutterwave payment events
- `GET/POST /api/settings` - User settings management

## Unique Selling Points

1. **Only quote tool with AI market intelligence** - Competitors show prices, you show data-backed justifications
2. **Only tool with interactive pricing transparency** - 3D flip cards reveal market context
3. **Only tool with retainer risk analysis** - Shows cost of NOT having ongoing support
4. **Multi-provider support** - Optimized fees for African markets

## Testing

### Stripe Test Card
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### Flutterwave Test Card
```
Card: 5531886652142950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Environment Variables (Production)
Set all `.env.local` variables as Vercel Environment Variables.

### Webhooks
After deployment, configure production webhooks:
- Stripe: `https://your-domain.com/api/webhooks/stripe`
- Flutterwave: `https://your-domain.com/api/webhooks/flutterwave`

## Status

✅ TypeScript: Zero errors
✅ ESLint: Zero warnings
✅ Production ready
✅ Multi-provider payments working
✅ Smart features deployed

## License

MIT

## Built With

Claude Code - AI pair programmer
