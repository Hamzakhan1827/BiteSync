# CraveSync Roadmap

> **Model:** B2B2C — We sell to restaurants. Diners are our data source.
> **North Star:** Get restaurants to pay for actionable customer intelligence.
> **Last updated:** June 2026

---

## How to use this document

Each phase has **Major Milestones** and **Minor Tasks** underneath them.
- Work top to bottom within each phase
- When blocked on a major milestone, drop down to minor tasks
- Check off items as completed — this is a living document
- Don't move to the next phase until the current one is stable

---

## Phase 1 — Product (✅ Complete)

> Development is done. App is tested. Code is on GitHub. APK is built.

### Major Milestones

- [x] **Mobile app built and tested** (React Native + Expo)
- [x] **Restaurant dashboard built** (Next.js)
- [x] **Database designed and secured** (Supabase + PostgreSQL)
- [x] **APK generated and sideloadable**
- [x] **SQA testing completed** — bugs found and fixed
- [x] **Code pushed to GitHub** (`master` branch is latest)

### Features Shipped

#### Mobile App (Diners)
- [x] Email authentication (sign up / sign in / sign out)
- [x] Home tab — dropdown search with recent history (last 3 searches)
- [x] Restaurant discovery — browse all active restaurants
- [x] Restaurant profile — hero image, open/closed badge, cuisine tags, address
- [x] Menu by category — search within restaurant menu
- [x] Dish detail page — photo, price, popularity score, public reviews
- [x] One-tap review — thumbs up / thumbs down
- [x] Private note — personal food diary (never visible to restaurant)
- [x] Public note — visible to restaurant + other diners
- [x] Review photo upload — attached to public review
- [x] 5-minute edit window — enforced at database trigger level
- [x] Review deletion — user controls their own data
- [x] Heart / favourite dishes — saved to profile
- [x] Trending dishes — home screen based on review volume
- [x] Favourite dishes — horizontal scroll on home
- [x] Food diary — full history of reviews in profile tab
- [x] Review streak — consecutive days reviewed
- [x] Avatar selection — emoji-based profile identity
- [x] Sidebar drawer — profile info, navigation, sign out
- [x] Bottom tab bar — Home / Review / Profile (slim, premium design)
- [x] Search state resets on tab switch / navigation back

#### Restaurant Dashboard (Operators)
- [x] Admin login — protected by Supabase Auth
- [x] Restaurant manager — add / edit restaurant details
- [x] Menu manager — add / edit categories and menu items
- [x] Image uploads — dish and restaurant photos via Supabase Storage
- [x] Live feedback feed — public reviews sorted by dish and date
- [x] Insights panel — dish performance, positive/negative ratio
- [x] Customer page — overview of reviewing users
- [x] Campaign settings — winback campaign configuration
- [x] Admin page — super admin controls

#### Backend & Infrastructure
- [x] Full PostgreSQL schema (8 tables)
- [x] Row Level Security on all user-facing tables
- [x] Private notes enforced at DB level (never exposed to restaurants)
- [x] Auth trigger — auto-creates user profile on signup
- [x] Post-review trigger — Supabase Edge Function fires after review
- [x] Winback campaign function — re-engagement automation
- [x] Performance indexes on all foreign keys
- [x] Supabase Storage — `review-pics` bucket with policies
- [x] EAS Build configured for APK generation
- [x] Environment variables secured (never committed to git)

#### Documentation
- [x] `README.md` — project overview and quick start
- [x] `CHANGELOG.md` — version history
- [x] `LAUNCH_PLAN.md` — 90-day go-to-market plan
- [x] `docs/ARCHITECTURE.md` — system design
- [x] `docs/DATABASE.md` — full schema reference
- [x] `docs/DEVELOPMENT.md` — local setup guide
- [x] `docs/DEPLOYMENT.md` — APK build and dashboard deploy
- [x] `docs/SECURITY.md` — auth model and RLS
- [x] `docs/FOR_RESTAURANTS.md` — public guide for restaurant clients
- [x] `docs/FOR_DINERS.md` — public user guide
- [x] `docs/FAQ.md` — common questions
- [x] `docs/PRIVACY_POLICY.md` — data policy

---

## Phase 2 — Market Research & Infrastructure (🔄 In Progress)

> **Duration:** ~4 weeks (June 2026)
> **Goal:** Validate demand, set up professional infrastructure, prepare to sell.

### Major Milestones

- [x] **Diner survey live** — Google Forms, 70+ responses (target 100+)
- [ ] **Restaurant owner survey live** — Google Forms (target 15+ responses)
- [ ] **Domain purchased** — `cravesync.tech` on Namecheap
- [ ] **Business email configured** — `hamza@cravesync.tech` via Zoho Mail (free)
- [ ] **Transactional email set up** — Resend connected to Supabase Edge Functions
- [ ] **Email warmup started** — 3-week warmup before cold outreach
- [ ] **Survey data analysed** — 100+ diner + 15+ restaurant responses reviewed
- [ ] **Pitch deck created** — data-backed, restaurant-focused, 8-10 slides
- [ ] **Demo video recorded** — 3-5 min screen recording of app + dashboard live

### Minor Tasks

#### Surveys
- [x] Diner survey created
- [x] Diner survey distributed (WhatsApp, Instagram)
- [ ] Diner survey — second wave push (ask first respondents to forward)
- [ ] Diner survey — university groups, Karachi food Facebook groups
- [ ] Restaurant survey created
- [ ] Restaurant survey — LinkedIn outreach to restaurant managers
- [ ] Restaurant survey — 5 in-person fills (sit with owner, fill together)
- [ ] Survey data export from Google Forms (when 100+ reached)
- [ ] Compile key stats: % who'd use food diary, % stopped by laziness, % would review if chef sees it

#### Field Research (higher value than surveys)

**1. Sit in restaurants and observe** *(5 hours, cost of meals)*
- [ ] Visit 5 restaurants as a regular customer
- [ ] Observe: do people take food photos? do they check their phone before ordering? do they complain to waiters?
- [ ] Note: how do they decide what to order — menu, photos, asking waiter, checking online?
- [ ] Document findings for each restaurant visited

**2. Interview waitstaff** *(2 hours, cost of 5 chais)*
- [ ] Visit 5 restaurants during off-peak hours (3–5 PM)
- [ ] Buy a waiter chai and ask 3 questions:
  - *"What do customers complain about most?"*
  - *"Which dishes get sent back or complained about often?"*
  - *"Does your manager ever ask you about customer feedback?"*
- [ ] Waiters know more than owners — document every answer

**3. Scrape & analyse Google Maps reviews** *(3 hours, free)*
- [ ] Pick 10 top Karachi restaurants
- [ ] Read their last 50-100 Google reviews each
- [ ] Look for: patterns in negative reviews, specific dish names mentioned, whether restaurant replies
- [ ] This shows what problems restaurants are NOT solving — CraveSync's opportunity

**4. Shadow a restaurant manager for one day** *(1 day, free)*
- [ ] Approach one restaurant honestly: *"I'm building a tool for restaurants, can I observe your operations for one shift?"*
- [ ] Watch: how they handle complaints, do they check online reviews during service, how they brief the kitchen
- [ ] Document every decision that could have been improved with real-time dish data

**5. Facebook & Reddit listening** *(2 hours, free)*
- [ ] Facebook: search Karachi Food Guide group — filter by complaints and negative posts
- [ ] Reddit r/karachi — search "restaurant", "food", "service"
- [ ] Screenshot and save posts like *"went to X and the Y was terrible"*
- [ ] These become real examples in your pitch deck

**6. Mystery dining at target restaurants** *(5 hours, cost of meals)*
- [ ] Visit 5 restaurants on your future target list as a regular customer
- [ ] After eating: leave a Google review — does the restaurant reply?
- [ ] DM them a question on Instagram — how fast do they respond?
- [ ] Check if they have any existing feedback mechanism (paper, QR, WhatsApp)
- [ ] This tells you their feedback maturity — how ready they are for CraveSync

**7. Talk to 5 food bloggers / micro-influencers** *(2 hours, free)*
- [ ] Find 5 Karachi food bloggers on Instagram or TikTok
- [ ] DM: *"Building a food tech project in Karachi — can I ask you 3 quick questions about reviewing restaurants?"*
- [ ] Ask: which restaurants care about feedback? what's missing in the food scene? what do they wish restaurants knew?
- [ ] Food bloggers know the scene and can become early promoters later

**8. WhatsApp polls in food groups** *(30 mins, free)*
- [ ] Find 3-5 Karachi food WhatsApp groups
- [ ] Post a single poll: *"Do you ever leave a review after eating out?"* Yes / No / Sometimes
- [ ] Follow up with people who say No — ask why in one line
- [ ] More natural and honest than a formal survey

**9. Cold call 10 restaurants** *(2 hours, free)*
- [ ] Call (not WhatsApp) 10 restaurants during off-peak hours
- [ ] Intro: *"I'm a student doing research on how Karachi restaurants manage customer feedback — 3 quick questions?"*
- [ ] Ask: How do you get feedback? Do you track dish complaints? Would dish-level ratings be useful?
- [ ] Log every response — even "no" responses tell you something
- [ ] 10 calls = more real data than 100 survey responses

#### Domain & Email
- [ ] Check `cravesync.tech` availability on Namecheap
- [ ] Purchase `cravesync.tech` (~$10/year)
- [ ] Create Zoho Mail account (free plan)
- [ ] Connect `cravesync.tech` to Zoho Mail
- [ ] Add SPF record to domain DNS
- [ ] Add DKIM record to domain DNS
- [ ] Add DMARC record to domain DNS
- [ ] Verify email sends and receives correctly
- [ ] Create Resend account (free tier)
- [ ] Connect Resend to Supabase Edge Functions (post-review-trigger, winback)
- [ ] Update Supabase Auth SMTP settings to use Resend
- [ ] Test transactional email end-to-end (signup → welcome email received)

#### Email Warmup (3 weeks)
- [ ] Week 1: Send 10-15 emails/day to real contacts from `hamza@cravesync.tech`
- [ ] Week 1: Sign up to 10 newsletters using new email (builds sender reputation)
- [ ] Week 2: Increase to 25 emails/day, ask contacts to reply
- [ ] Week 3: Increase to 50/day — ready for outreach after this
- [ ] Set up Brevo (free — 9,000 emails/month) for cold outreach campaigns

#### Online Presence — Setup (all free)
- [ ] **Instagram** — create `@cravesync` (or `@cravesync.tech`)
- [ ] **LinkedIn company page** — CraveSync, with logo + one-line description
- [ ] **TikTok** — create `@cravesync` account
- [ ] **WhatsApp Business** — set up official CraveSync number with profile photo + description
- [ ] **Landing page** — one page at `cravesync.tech` built with Carrd (free) or Notion public page
- [ ] **Google My Business** — list CraveSync as a tech company in Karachi (helps searchability)

#### Online Presence — Free Tools
- [ ] **Canva** (free tier) — all graphics, posts, pitch deck, one-pager
- [ ] **CapCut** (free) — short video editing for Reels and TikToks
- [ ] **Loom** (free) — record demo videos, share as link
- [ ] **Notion** (free) — public-facing landing page or resource hub if no domain yet

#### Content Strategy — Instagram (primary platform)

**Account positioning:** *"Building the feedback layer of Karachi's food scene"*

**Content pillars — post 3-4x per week:**

*Pillar 1 — App demos (show, don't tell)*
- [ ] Screen record: diner opens app → browses restaurant → taps thumbs up → private note added
- [ ] Screen record: dashboard live — review appears in real time after submission
- [ ] "What happens after you leave a review" — split screen app + dashboard
- [ ] Short Reel: *"One tap. Your feedback reaches the chef."*

*Pillar 2 — Data & insights (build credibility)*
- [ ] *"We surveyed 100 Karachi diners. 45% said they never leave reviews because [reason]."*
- [ ] *"Do restaurants in Karachi actually read their Google reviews? We called 10 to find out."*
- [ ] *"Which area of Karachi has the most food complaints? Our research says..."*
- [ ] Survey result graphics — turn your Google Forms data into clean visuals on Canva

*Pillar 3 — Founder story (build trust)*
- [ ] *"Why I'm building CraveSync as a student in Karachi"*
- [ ] *"What I learned from visiting 5 Karachi restaurants and talking to their staff"*
- [ ] *"Building in public — week 1 of market research"*
- [ ] Behind the scenes: coding the dashboard, designing the app, field research

*Pillar 4 — Restaurant pain points (speak to your B2B audience)*
- [ ] *"Your restaurant got a 3-star Google review. You don't know which dish caused it. This is the problem."*
- [ ] *"How do top restaurants know what to fix on their menu? (Most don't.)"*
- [ ] *"Feedback forms vs real-time data — what restaurants actually need"*

#### Content Strategy — LinkedIn (B2B, restaurant owners)

**Post 2-3x per week. Written posts, not graphics.**
- [ ] Founder story: *"I'm a student building a restaurant feedback platform in Karachi. Here's why."*
- [ ] Survey data posts: *"We asked 100 Karachi diners what stops them from leaving reviews..."*
- [ ] Problem framing: *"Restaurants in Karachi spend thousands on food, but zero on understanding what customers think of each dish."*
- [ ] Cold outreach: connect with restaurant managers + owners in Karachi on LinkedIn (20/day, with a note)
- [ ] Share every Instagram post as a LinkedIn article — double the reach, zero extra work

#### Content Strategy — TikTok (fastest growth, zero cost)

- [ ] App walkthrough in 30 seconds — fast cuts, trending sound
- [ ] *"POV: You're a restaurant owner and you just saw your first CraveSync review"*
- [ ] *"I visited 5 Karachi restaurants and asked waiters what customers complain about most"*
- [ ] *"Building a startup as a student in Karachi — day 1 of market research"*
- [ ] React to food complaints in Karachi food TikToks: *"This is exactly what CraveSync solves"*

#### Content Strategy — WhatsApp (direct, high conversion)

- [ ] Broadcast list: share every major post or milestone to 50+ contacts
- [ ] Weekly update to close circle: *"70 survey responses, talking to restaurants this week"*
- [ ] Use status for reach: post app screenshots, survey stats, behind-the-scenes

#### Product Hunt Launch (free, when ready)

- [ ] Prepare a Product Hunt listing (name, tagline, description, screenshots, demo link)
- [ ] Build a list of supporters to upvote on launch day (friends, survey respondents who opted in)
- [ ] Launch on a Tuesday or Wednesday (highest traffic days)
- [ ] A good Product Hunt day = 500-2000 visitors to your landing page for free

#### Competitive Research
- [ ] Document what Foodpanda, Google Maps, Instagram offer restaurants (data-wise)
- [ ] Identify CraveSync's gap: dish-level intelligence + AI follow-ups
- [ ] Write one positioning statement: *"CraveSync does X for restaurants so that Y"*
- [ ] Screenshot 5 negative Google reviews of Karachi restaurants — use in pitch as the problem slide

---

## Phase 3 — First Restaurant Client (⏳ Upcoming)

> **Duration:** ~4 weeks (July 2026)
> **Goal:** Sign first restaurant as a free beta partner. Get real data flowing.

### Major Milestones

- [ ] **Target list built** — 10 restaurants identified and researched
- [ ] **First outreach sent** — WhatsApp or email to all 10
- [ ] **First demo meeting booked** — sit down with one restaurant owner/manager
- [ ] **First restaurant signed** — free beta agreement, dashboard access given
- [ ] **QR codes printed** — placed on tables / counter at first restaurant
- [ ] **First 10 real reviews in dashboard** — system working end-to-end live

### Minor Tasks

#### Target List
- [ ] Identify 10 restaurants in DHA / Clifton / Gulshan (survey respondents' areas)
- [ ] Filter: casual dining, 50-200 covers/day, active on Instagram
- [ ] Find manager/owner name on LinkedIn or via restaurant Instagram
- [ ] Note best time to visit: off-peak (3–5 PM weekdays)

#### Outreach
- [ ] WhatsApp message template written (short, personal, no jargon)
- [ ] Email template written (one paragraph + demo video link)
- [ ] Send to all 10 — WhatsApp first, email follow-up if no reply in 3 days
- [ ] Log all responses in a simple spreadsheet (Name / Contacted / Response / Follow-up date)
- [ ] Follow up with non-responders after 5 days

#### The Meeting
- [ ] Rehearse the pitch (under 10 minutes)
- [ ] Open with questions, not pitch: *"How do you currently know which dishes are underperforming?"*
- [ ] Show demo video on phone
- [ ] Show dashboard live on laptop if possible
- [ ] Leave one-pager (printed or PDF on WhatsApp)
- [ ] Offer: *"Free for 6 months — you're one of our 5 beta partners in Karachi"*

#### Onboarding First Client
- [ ] Verify restaurant menu is complete in the system
- [ ] Give dashboard login credentials
- [ ] Walk through dashboard with them (30-minute session)
- [ ] Print QR code standee (use qrcode-monkey.com, CraveSync branded)
- [ ] Place QR codes on tables / counter / receipt
- [ ] Set expectations: *"You'll see first reviews within the first week"*
- [ ] Schedule a 2-week check-in call

#### After First Client
- [ ] Monitor dashboard daily — is data flowing in correctly?
- [ ] Screenshot real reviews and stats (with permission) — use as social proof
- [ ] After 2 weeks: *"You've received 43 reviews. Your Bihari Roll has 62% positive."*
- [ ] Use this proof to approach restaurant #2 and #3
- [ ] Begin charging restaurant #2 onward (beta is over for new clients)

---

## Upcoming Phases (Future Planning)

### Phase 4 — Revenue & Scale
- [ ] Define pricing tiers (Basic / Pro / Enterprise for restaurant sizes)
- [ ] SaaS billing portal — Stripe or SadaPay integration
- [ ] Grow to 10 paying restaurant clients in Karachi
- [ ] AI review summariser — *"67% said the karahi was too oily this week"*
- [ ] At-risk alerts — dish sentiment declining → notify restaurant automatically
- [ ] Data export for restaurants (CSV download)

### Phase 5 — City Expansion
- [ ] Expand to Lahore (second market)
- [ ] Hire first sales person for on-ground restaurant outreach
- [ ] App Store listing (iOS) + Google Play Store (Android)
- [ ] PR — pitch to Dawn, The News, TechJuice, Propakistani

### Future Features (Evaluate Each Quarter)
- [ ] Waiter rating + digital tip
- [ ] Dietary alerts (flag allergens on menu items)
- [ ] QR code generator in dashboard (restaurant generates their own)
- [ ] Gamification — reviewer badges and streaks
- [ ] Social dining — shareable food diary link
- [ ] Menu A/B testing for restaurants
- [ ] POS system integration (reorder what you had last time)
- [ ] Franchise dashboard (multi-branch restaurant analytics)

---

## Key Metrics to Track

| Metric | Phase 2 Target | Phase 3 Target |
|--------|---------------|----------------|
| Survey responses (diners) | 100+ | — |
| Survey responses (restaurants) | 15+ | — |
| Restaurant clients signed | — | 1-3 |
| App installs | — | 50-200 |
| Reviews submitted | — | 200+ |
| Dashboard logins/week by restaurants | — | Weekly (engaged) |
| Revenue | $0 | $0 (beta) |

---

*CraveSync — Data First. No Haste.*
