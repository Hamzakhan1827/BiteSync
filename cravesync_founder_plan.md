# CraveSync — 4-Week Founder-Level Plan
### Co-founder & Business Advisor Brief | Hamza | Karachi, 2026

---

## WEEK 1 — Validation & Market Reality

### 1.1 Ideal Customer Profile (ICP)

Your ICP is not "any restaurant." It is specific:

**Primary ICP — The Ambitious Mid-Tier Restaurant Owner**
- Runs 1–3 locations in Karachi (DHA, Clifton, Gulshan, PECHS)
- Monthly revenue: PKR 800K–5M
- Already uses Instagram/Facebook for marketing
- Has tried or considered Zomato/Foodpanda but dislikes their fees
- Pain: No idea which menu items are losing them repeat customers
- Aspiration: Wants data to compete with chains
- Decision maker: Owner or GM, reachable directly
- Tech comfort: Uses WhatsApp, likely has a POS or uses paper receipts

**Secondary ICP — The Chain Operations Manager**
- 4–15 locations (e.g., Nando's franchisee, local chai chains)
- Has a dedicated ops/marketing person
- Needs dashboards per branch
- Longer sales cycle but higher ACV (Annual Contract Value)

**Exclude for now:**
- Street food stalls (no data culture, no budget)
- Hotel F&B (long procurement cycles, require enterprise contracts)
- Cloud kitchens on Foodpanda (captive to platform data)

---

### 1.2 Market Size

**Pakistan (TAM/SAM/SOM)**

- Pakistan has ~500,000 food service establishments (FBS 2024)
- Karachi alone: ~80,000–100,000 (formal + informal)
- Addressable (tech-ready, mid-tier): ~8,000–15,000 in Karachi
- Serviceable with current product: ~500–2,000 (formal sit-down, delivery-enabled)
- Your Year 1 SOM: 50–200 paying restaurants

**Revenue Math (Pakistan):**
- 100 restaurants × PKR 8,000/month = PKR 800K MRR (~$2,900 USD)
- 500 restaurants × PKR 12,000/month = PKR 6M MRR (~$21,000 USD)
- This is enough to sustain a 3-person team in Karachi

**Global TAM (for investor narrative):**
- Global restaurant tech market: ~$14B (2025), growing 10% YoY
- Feedback & analytics sub-segment: ~$1.2B
- Your wedge: item-level feedback + food diary + data monetization
- Comparable: Yumpingo (UK), Ovation (US), Waitrr (Singapore)

---

### 1.3 Competitor Analysis

| Type | Competitor | Their Wedge | Their Gap |
|---|---|---|---|
| Direct | Yumpingo | Post-meal surveys, UK focus | No Pakistan presence, no food diary |
| Direct | Ovation | SMS-based quick feedback | US only, no item-level granularity |
| Direct | Zomato Reviews | Consumer reviews | Not B2B, not actionable per item |
| Indirect | Google Reviews | Trust & discovery | No structured data, no tenant dashboard |
| Indirect | Foodpanda analytics | Delivery data | Only delivery orders, walled garden |
| Status Quo | WhatsApp feedback groups | Free, familiar | Unstructured, no analytics, no scale |
| Status Quo | Comment cards | Physical, no data | Lost immediately, no trend analysis |

**Your Moat:** Item-level feedback tied to a verified diner identity, with a personal food diary creating a data network effect. Restaurants get structured intelligence; diners get a taste memory app. Neither side gets this elsewhere in Pakistan.

---

### 1.4 Pricing Research

**What the market pays today:**
- Zomato for Business: PKR 15,000–40,000/month (mostly for ads)
- Foodpanda commission: 20–30% per order (hated)
- POS systems (e.g., Lightspeed local resellers): PKR 5,000–15,000/month
- SMS marketing tools: PKR 2,000–8,000/month

**Willingness to Pay Signal:**
- If a restaurant already pays PKR 5,000/month for something, you can price comparably
- Your value prop is stronger than SMS tools, weaker than full POS
- Target entry price: PKR 5,000–8,000/month (validated through discovery)
- Psychological anchor: "Less than one lost table per month"

**Pricing Experiments to Run in Week 1:**
- Ask: "If this showed you exactly which dish is killing your 2nd-visit rate, what would that be worth monthly?"
- Offer three hypothetical tiers verbally and watch which one they anchor to
- Never name a price first — let them name a number

---

### 1.5 Running 10 Customer Discovery Conversations

**How to get the meetings:**
1. Walk in during off-peak hours (3–5pm) with a physical card and a 30-second pitch
2. LinkedIn DM to restaurant owners (search "restaurant owner Karachi")
3. WhatsApp groups: Karachi food business communities, KCCI (Karachi Chamber) groups
4. Ask every conversation for 2 referrals: "Who else do you know that runs a restaurant?"

**The Script (30-second door opener):**
> "Hi, I'm Hamza. I'm building a tool that shows restaurant owners exactly which dishes are losing them repeat customers — with real feedback from actual diners. I'm not selling anything — I'm talking to 10 owners this week to make sure I build the right thing. Could I get 20 minutes of your time?"

**Discovery Questions (use exactly these, in order):**

*Context & Pain:*
1. "Walk me through how you currently know if a customer had a bad experience."
2. "When was the last time a customer complained — what happened, and how did you find out?"
3. "Which menu item do you *suspect* underperforms but don't have data on?"

*Behavior & Alternatives:*
4. "What tools or apps do you use to understand your customers right now?"
5. "How much time do you spend per week on customer feedback or reviews?"
6. "Have you ever tried any feedback or analytics software? What happened?"

*Value & Willingness to Pay:*
7. "If you knew, every week, exactly which item is causing people not to come back — what would you do with that?"
8. "What would that insight be worth to you, in rupees per month, if it was always accurate?"
9. "What would make you trust the feedback data? (e.g., verified diners only)"

*Closing Signal:*
10. "If I built exactly what you described, would you be willing to try it free for 30 days and then pay if it worked?"

**Green Signals (keep building):**
- They interrupt you to describe their exact pain
- They ask "how does it work?" before you explain
- They name a price unprompted
- They say "I've wanted something like this for years"

**Red Signals (consider pivoting):**
- "We already see everything we need from Zomato"
- "I don't think customers will scan a QR code"
- "We can't share our customer data with anyone"
- 7 out of 10 say feedback isn't their problem

**Stop/Pivot Triggers:**
- If fewer than 4/10 express genuine pain around feedback, pivot the ICP
- If all pain is around *acquiring* customers (not retaining), consider pivoting to a marketing tool
- If owners won't share menu data, the item-level feedback model breaks — explore receipt-based flow instead

---

## WEEK 2 — Infrastructure & Architecture at Scale

### 2.1 Multi-Tenancy Design (Supabase + PostgreSQL RLS)

**Tenancy Model:** Shared database, isolated by `restaurant_id` via Row-Level Security (RLS). This is the right choice at your stage — simpler ops, lower cost, sufficient isolation.

**Core Principle:** Every table that contains restaurant data must have a `restaurant_id` column. RLS policies enforce that users only see rows where `restaurant_id` matches their auth context.

**Auth Context Flow:**
```
User logs in → Supabase Auth → JWT issued with custom claims:
  { restaurant_id: "uuid", role: "manager" | "owner" | "admin" }
→ RLS policy reads auth.jwt() ->> 'restaurant_id'
→ Query is automatically scoped
```

**Setting Custom JWT Claims (via Supabase Hook):**
```sql
-- In your auth hook function:
CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event jsonb)
RETURNS jsonb AS $$
DECLARE
  user_restaurant_id uuid;
  user_role text;
BEGIN
  SELECT restaurant_id, role INTO user_restaurant_id, user_role
  FROM public.profiles WHERE id = (event->>'user_id')::uuid;

  RETURN jsonb_set(
    jsonb_set(event, '{claims,restaurant_id}', to_jsonb(user_restaurant_id::text)),
    '{claims,role}', to_jsonb(user_role)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2.2 Schema Design for 1M+ Rows

**Design Rules:**
- All foreign keys indexed
- Partition `feedback` table by `created_at` (monthly) when you hit 500K rows
- Use `uuid` PKs (gen_random_uuid()) — no sequential IDs exposed
- Add `deleted_at` (soft delete) to restaurants, menu_items
- Never store PII in feedback rows — store `diner_id` reference only

**Core Schema:**

```sql
-- Restaurants (one per tenant)
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  plan text DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Users & Roles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  restaurant_id uuid REFERENCES restaurants(id),
  role text NOT NULL CHECK (role IN ('platform_admin','owner','manager','diner')),
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Menu Items
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  name text NOT NULL,
  category text,
  price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT fk_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);

-- Diner Visits (verified visit token)
CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  diner_id uuid REFERENCES profiles(id),
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  verification_method text CHECK (verification_method IN ('qr','receipt','pos_sync')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_visits_restaurant_date ON visits(restaurant_id, visit_date);

-- Feedback (core fact table)
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES visits(id),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  menu_item_id uuid REFERENCES menu_items(id),
  diner_id uuid REFERENCES profiles(id),
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  sentiment text CHECK (sentiment IN ('positive','neutral','negative')),
  tags text[],
  note text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE feedback_2026_05 PARTITION OF feedback
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE INDEX idx_feedback_restaurant ON feedback(restaurant_id, created_at);
CREATE INDEX idx_feedback_item ON feedback(menu_item_id);

-- Food Diary (diner-owned)
CREATE TABLE diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diner_id uuid NOT NULL REFERENCES profiles(id),
  restaurant_id uuid REFERENCES restaurants(id),
  menu_item_id uuid REFERENCES menu_items(id),
  note text,
  photo_url text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  visited_at timestamptz DEFAULT now()
);
CREATE INDEX idx_diary_diner ON diary_entries(diner_id, visited_at);
```

---

### 2.3 RLS Policies

```sql
-- Restaurants: owners see their own
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "restaurant_isolation" ON restaurants
  USING (
    id = (auth.jwt() ->> 'restaurant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'platform_admin'
  );

-- Feedback: scoped to restaurant
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_restaurant_scope" ON feedback
  USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'platform_admin'
  );

-- Diary: diners see only their own
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diary_owner_only" ON diary_entries
  USING (diner_id = auth.uid());
```

---

### 2.4 Role System

| Role | Access Scope | Can Do |
|---|---|---|
| `platform_admin` | All restaurants | Full read/write, billing, user mgmt |
| `owner` | Their restaurant | All data, billing, add managers |
| `manager` | Their restaurant | View analytics, respond to feedback |
| `diner` | Their own visits + diary | Submit feedback, view own diary |

**Invite-Only Onboarding Flow:**
1. Owner signs up → verified email → creates restaurant profile
2. Owner invites manager via email → Supabase invite link
3. Manager accepts → profile created with `restaurant_id` pre-assigned
4. Diners self-register via QR code scan at table (restaurant_id embedded in URL)

---

### 2.5 API Design (Internal First)

**Philosophy:** Build as if you'll expose this as a public API in 6 months. Use versioned routes, consistent error shapes, and document everything.

**Route Structure (Next.js App Router):**
```
/api/v1/
  restaurants/
    [id]/
      overview        GET  — dashboard summary
      feedback        GET  — paginated feedback list
      menu-items      GET/POST
      analytics/
        sentiment     GET  — sentiment over time
        top-items     GET  — best/worst performers
        retention     GET  — repeat visit rate
  feedback/
    submit            POST — diner submits feedback (public, rate-limited)
  diners/
    diary             GET/POST — personal food diary
  admin/
    restaurants       GET  — all tenants (platform_admin only)
    users             GET  — all users
```

**Standard Error Shape:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You do not have access to this restaurant.",
    "status": 403
  }
}
```

---

### 2.6 Zero-Cost Infrastructure Plan

**Current Stack (Free Tier):**
| Service | Free Tier | Limit Before Paid |
|---|---|---|
| Supabase | 500MB DB, 2GB storage, 50K MAU | ~100 restaurants, 500K feedback rows |
| Vercel | Hobby plan | 100GB bandwidth, unlimited deploys |
| Flutter | Free | No limit |
| Resend (email) | 3,000 emails/month | Enough for 300 restaurant invites |

**Path to Paid (trigger points):**
- Supabase Pro ($25/mo): When DB > 400MB or MAU > 40K
- Vercel Pro ($20/mo): When you need team access or >100GB bandwidth
- Total at scale-up: ~$45–$100/month, covered by 10 paying restaurants

---

## WEEK 3 — Go-To-Market & Launch Strategy

### 3.1 Acquiring First 5 Paying Restaurants

**The 5-Restaurant Sprint (2 weeks):**

This is a sales sprint, not a marketing campaign. Do it yourself. No ads.

**Week 3 Target:** Convert 2 discovery conversations into pilot agreements.
**Week 4 Target:** Onboard 3 more via referrals from pilot restaurants.

**Conversion Sequence:**
1. Discovery call (Week 1) → identify top 3 pain-fit restaurants
2. Send a personalized Loom video showing their actual QR flow + demo dashboard
3. Offer: "30-day free pilot. We set everything up. You just get feedback."
4. After 2 weeks of pilot: share their first insight report (you compile manually if needed)
5. Ask: "If this was worth PKR 8,000/month, would you continue?"

**The Pilot Agreement (1-page):**
- 30 days free
- We provide QR codes, setup, and onboarding
- You share menu data + allow us to display aggregated data in our marketing
- At 30 days: convert to paid or end with no obligation

---

### 3.2 Outreach Strategy

**WhatsApp (highest ROI in Pakistan):**
- Join Karachi food business groups (KCCI, DHA business groups, F&B operators)
- Personal message, not broadcast: "Hi [Name], saw you run [Restaurant]. I'm building something I think could help — mind if I share a 60-second video?"
- Never send a link cold. Always ask permission first.

**LinkedIn:**
- Search: "restaurant owner Karachi" / "F&B operations Pakistan"
- Message template: "Hi [Name] — I'm building CraveSync, a feedback tool for restaurants. Your [restaurant name] came up in my research. Would love 15 mins — not selling, just learning. Worth your time?"
- Connect → wait 2 days → message. Don't message on connect request.

**Direct Walk-In (highest conversion):**
- Target: Wednesday–Friday, 3–5pm
- Bring: printed one-pager + QR code demo on your phone
- Dress professionally. Be direct. Ask for the owner, not the manager.
- Leave behind: a physical card with QR linking to your demo video

---

### 3.3 Partnership Opportunities

**POS Vendors (highest leverage):**
- Target: POSist, Lightspeed resellers in Karachi, local POS vendors
- Pitch: "We make your POS data more valuable — restaurants get feedback tied to orders"
- Ask for: co-marketing, referrals to their restaurant clients
- Offer: revenue share (10–20% of referred restaurant's first year)

**Food Delivery Platforms:**
- Foodpanda Pakistan: Unlikely short-term (walled garden), but pitch as complementary
- Bykea / Rider: Less restrictive, smaller but local
- Long-term: offer aggregated trend data as a B2B data product

**Food Brands (data monetization angle):**
- Nestle, Unilever, Shan Foods have field teams that want restaurant-level consumer data
- Pitch: "We know which Shan masala flavor gets the best feedback at Karachi's top 50 biryani spots"
- This is a Year 2 revenue stream — plant the seed now

---

### 3.4 Build-in-Public Strategy

**Platforms:** LinkedIn (primary for B2B), Twitter/X (dev community), and a weekly newsletter.

**Content Pillars:**
1. **Founder Journey** — "Week 3: Walked into 8 restaurants. Here's what I learned."
2. **Product Insight** — "The #1 dish killing repeat visits in Karachi right now (from our first 50 feedback entries)"
3. **Data Storytelling** — Anonymized, aggregated insights that prove your data has value
4. **Behind the Build** — Architecture decisions, Supabase RLS lessons, Flutter challenges

**Cadence:**
- LinkedIn: 3 posts/week
- Newsletter (Substack/Beehiiv): 1 post/week — "CraveSync Weekly: Karachi Food Intelligence"
- Twitter/X: Daily thoughts, 1 thread/week

**The Power Move:** Every week, share one anonymized restaurant insight publicly. "Karachi restaurants with 4+ star biryani feedback have 2.3x repeat visit rates." This builds the perception of data authority before you have 100 restaurants.

---

### 3.5 What a Successful Week 4 Launch Looks Like

**Definition of Launch:** Your first paying restaurant goes live on a paid plan.

**Launch Checklist:**
- [ ] 2 pilot restaurants live with QR codes deployed
- [ ] First analytics report sent (even manually compiled)
- [ ] Product stable: feedback submission → dashboard working end-to-end
- [ ] Pricing page live with 3 tiers
- [ ] 1 LinkedIn post: "CraveSync just went live with our first restaurant partner in Karachi"
- [ ] 1 paying customer (even PKR 1 to validate willingness to pay)

**Do NOT:**
- Launch publicly to everyone before you have 1 paying customer
- Wait for the product to be "perfect"
- Spend money on ads before you've closed 5 customers manually

---

## WEEK 4 — Monetization, Metrics & Growth

### 4.1 Pricing Model

**SaaS Tiers (PKR/month):**

| Plan | Price | For | Key Features |
|---|---|---|---|
| Starter | PKR 5,000 | 1-location, new to data | Unlimited feedback, basic dashboard, 1 manager seat |
| Pro | PKR 12,000 | Growing restaurant, 2-5 locations | Advanced analytics, sentiment trends, 3 manager seats, export |
| Enterprise | PKR 30,000+ | Chains, franchises | Multi-location, API access, dedicated onboarding, custom reports |

**USD Equivalent (for investor conversations):**
- Starter: ~$18/mo | Pro: ~$43/mo | Enterprise: ~$108/mo+

**Annual Discount:** 20% off for annual prepay — critical for cash flow in Pakistan.

**Data Monetization (Year 2+):**
- Aggregate, anonymized food trend reports sold to FMCG brands
- "Karachi Palate Index" — quarterly paid report: PKR 50,000–200,000 per brand
- Custom research for food brands launching new products
- Keep this completely separate from restaurant-facing product. Restaurants must trust that their raw data is never sold.

---

### 4.2 Key Metrics — Track From Day One

**Acquisition:**
- CAC (Customer Acquisition Cost): Total sales cost ÷ new restaurants acquired
- Target: CAC < 1 month's revenue (e.g., if plan is PKR 8K, CAC < PKR 8K)
- Outreach-to-close rate: Track every conversation

**Activation:**
- Activation Rate: % of onboarded restaurants that receive 10+ feedback entries in first 30 days
- This is your north star early metric. If restaurants don't get feedback, they don't see value.
- Target: >60% activation within 30 days

**Retention:**
- Monthly Churn Rate: Target <5%/month (60% annual retention)
- Logo Churn vs Revenue Churn — track both
- Early warning: restaurants that don't log in for 14 days

**Revenue:**
- MRR (Monthly Recurring Revenue): Track weekly
- Net Revenue Retention (NRR): Revenue from existing customers including upgrades minus churn
- Target: NRR > 100% by month 6 (expansions outpace churn)

**Engagement (leading indicator of retention):**
- Dashboard logins per week per restaurant
- Feedback entries per restaurant per week
- QR code scans per table (scan rate)
- Diner return rate (same diner, multiple visits)

**LTV Calculation:**
- LTV = ARPU × (1 / Monthly Churn Rate)
- Example: PKR 8,000 ARPU × (1 / 0.05) = PKR 160,000 LTV
- LTV:CAC ratio target: >3:1

---

### 4.3 Product-Market Fit Signals for CraveSync

**You have NOT found PMF if:**
- Restaurants sign up but rarely log in
- You're offering discounts to prevent churn
- Feedback is generic (no one completes item-level questions)
- Diners don't return to the app

**You HAVE found PMF when:**
- Restaurants proactively share your dashboard screenshots in their team WhatsApp groups
- A restaurant calls you asking for a feature (not complaining about a bug)
- You get referrals without asking ("I told my friend at [Restaurant] about you")
- Churn drops below 3%/month organically
- Restaurants upgrade plans without a sales call

**The PMF Survey (Sean Ellis Test):**
After 60 days of use, ask restaurant managers: "How would you feel if you could no longer use CraveSync?"
- Very disappointed: target >40%
- If <40%: dig into why and iterate

---

### 4.4 The Data Asset You're Building

This is your unfair advantage that no competitor can replicate overnight.

**What you're actually accumulating:**
- Item-level preference data by geography (DHA vs Gulshan vs Saddar)
- Price sensitivity signals (which price points correlate with positive feedback)
- Seasonal taste trends (Ramadan menu performance, Eid specials)
- Diner loyalty patterns (which items bring people back)
- Cross-restaurant taste profiles (a diner who loves X at Restaurant A also rates Y highly)

**The Compounding Effect:**
- At 50 restaurants: interesting for individual owners
- At 500 restaurants: valuable for food brands
- At 5,000 restaurants: a national food intelligence platform
- At scale: you become the Nielsen ratings for food in Pakistan

**Protect this asset:**
- Own all aggregated, anonymized data rights (state this in ToS from day 1)
- Never sell raw restaurant data — only aggregate insights
- Build the diary product aggressively — diner data is stickier than restaurant data

---

### 4.5 90-Day Roadmap After Launch

**Month 1 (Launch):**
- [ ] 5 paying restaurants live
- [ ] Feedback loop working (QR → submission → dashboard)
- [ ] Manual insight reports delivered to each restaurant
- [ ] First churn conversation (understand the "no")

**Month 2 (Stabilize):**
- [ ] Automated weekly insight email to restaurant owners
- [ ] Diner app (Flutter) v1 live — food diary functional
- [ ] 10 paying restaurants
- [ ] First data on activation rates — optimize onboarding

**Month 3 (Grow):**
- [ ] Referral program launched ("Give 1 month free, get 1 month free")
- [ ] First multi-location restaurant on Enterprise plan
- [ ] Partner with 1 POS vendor for co-marketing
- [ ] Explore LUMS/IBA student freelancers for sales support
- [ ] 20–25 paying restaurants
- [ ] First "Karachi Palate Report" published (free, for brand building)

**Financial Target — End of Month 3:**
- 20 restaurants × PKR 8,000 avg = PKR 160,000 MRR (~$575 USD)
- Enough to cover Supabase Pro + Vercel + basic tools
- Not enough to pay yourself — that's okay. This is the validation phase.

**Fundraising Readiness (Month 4–6):**
- With 25+ paying restaurants and <5% churn, you have a story
- Target: LUMS Centre for Entrepreneurship, Invest2Innovate, Draper University alumni in Karachi
- Seed ask: $50,000–$150,000 for 6 months runway (3-person team, marketing, infrastructure)
- Narrative: "We're building the Yelp meets Mixpanel for Pakistan's $8B restaurant industry, with a proprietary food intelligence data asset."

---

## Final Note: What Will Actually Kill CraveSync

1. **Not talking to enough restaurants before building more.** Do the 10 conversations. Really.
2. **Building features instead of driving activation.** Your job in Month 1 is not to code — it's to ensure every restaurant gets 50 feedback entries.
3. **Pricing too low.** PKR 2,000/month signals low value. Price higher than feels comfortable.
4. **Skipping the diner side.** The food diary is what makes your data network defensible. Don't neglect it.
5. **Solving for Lahore/Islamabad before dominating Karachi.** Win one city completely first.

---

*Built for Hamza | CraveSync | Karachi, Pakistan | May 2026*
*This document is a living strategic brief — update it as your discovery conversations reshape your understanding.*
