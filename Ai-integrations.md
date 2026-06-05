# CraveSync — AI Integration Plan

## Overview

CraveSync has a solid data foundation (reviews, customer profiles, menu items) that makes AI integration natural and high-value. The goal is to use customer data flowing through the app to drive personalized follow-ups, retention campaigns, and revenue intelligence for restaurant owners.

**AI Provider:** OpenAI API  
**Email Provider:** Resend  
**Backend:** Supabase Edge Functions + pg_cron

---

## Phase 1 — AI-Powered Customer Follow-ups

**Trigger flow:**
Customer submits review in app → Supabase webhook fires → Edge Function triggers → OpenAI generates personalized message → Email/SMS sent to customer

**What gets built:**
1. `post-review-trigger` Supabase Edge Function — fires on new row in `reviews` table
2. OpenAI API integration — takes review data (item name, rating, public note, customer history) and generates a warm, branded follow-up message
3. Transactional email via **Resend** — sent under the restaurant's branding
4. New table: `ai_followup_log` — tracks sent messages, timestamps, and prevents spam

**Example flow:**
> Ahmed rates Zinger Burger 👍 and writes "bit too salty but still great"
> → AI generates: *"Hi Ahmed, thanks for the honest feedback on our Zinger — we're working on the salt balance. Here's 10% off your next visit."*

---

## Phase 2 — Monthly AI Campaigns

**What gets built:**
1. **Campaign Builder** in dashboard — restaurant owner picks a goal (re-engage lapsed customers, promote a menu item, seasonal offer)
2. OpenAI generates 3 campaign message variations based on the restaurant's actual customer and review data
3. Scheduled send via Supabase `pg_cron` or Vercel Cron
4. Dashboard shows send stats: open rates, click-through, and resulting review activity

---

## Phase 3 — AI Insights Panel (Revenue Intelligence)

New **"AI Insights"** section in the dashboard:

| Insight | Description |
|---|---|
| **Weekly Review Digest** | "Your Karahi got 23 reviews this week — 91% positive. Top complaint: portion size (7 mentions)" |
| **At-Risk Customers** | Customers with no visit in 30+ days, ranked by lifetime review count |
| **VIP Customers** | Top reviewers — shows restaurants their most loyal advocates |
| **Menu Optimization Tips** | "Your Seekh Kebab has 40% negative rate — 8 customers mentioned 'dry'. Consider a recipe review." |
| **Competitor Benchmark** | *(later phase)* Anonymized aggregate: how your items rank vs. category average in your city |

---

## Phase 4 — Loyalty & Retention Automation

| Feature | Impact |
|---|---|
| **Win-back Campaigns** | Auto-trigger email to churned customers (30-day no-visit) with AI-crafted personalized offer |
| **Milestone Rewards** | "5th visit — auto-send a surprise offer" trigger |
| **Review Response Drafts** | AI drafts a response to public reviews; owner approves with 1 click |
| **Smart Offer Generator** | Owner sets a budget → AI suggests which underperforming items to discount based on review data |

---

## Tech Stack Additions

| Tool | Purpose | Cost |
|---|---|---|
| **OpenAI API** | All AI generation (follow-ups, insights, campaigns) | Pay per token |
| **Resend** | Transactional & campaign email | Free up to 3k/mo |
| **Supabase Edge Functions** | Webhook handlers & trigger logic | Included in free tier |
| **Supabase pg_cron** | Scheduled campaign sends | Included |

---

## Additional Feature Ideas (Attract & Retain Restaurant Owners)

- **Restaurant Health Score** — a single AI-generated weekly score with 3 prioritized action items
- **WhatsApp Integration** — Pakistan market is WhatsApp-first; reach customers where they are
- **QR-Triggered Personalized Greeting** — when a repeat customer scans QR, show a personalized welcome or offer
- **Time-Slot Flagging** — if the same item gets consistently bad reviews during a specific time window, flag it as a potential staff/prep issue

---

## Build Priority

1. **Phase 1** — Post-review AI follow-up email *(highest immediate impact, data already exists)*
2. **Phase 3** — AI Insights digest panel *(convinces restaurant owners the platform is intelligent)*
3. **Phase 2** — Monthly campaign builder *(drives revenue for restaurants = retention for CraveSync)*
4. **Phase 4** — Loyalty automation *(long-term moat)*
