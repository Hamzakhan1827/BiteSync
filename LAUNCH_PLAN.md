# BiteSync — Launch Plan
## Development Complete → First Paying Client in 90 Days

---

## Platform Readiness Check

Before anything else — here's your cross-platform reality:

| Platform | Status | Notes |
|----------|--------|-------|
| **Android** | ✅ Ready | APK built, `com.bitesync.app`, EAS configured |
| **Web** | ✅ Ready | Runs via `expo start --web`, works in browser |
| **iOS** | ⚠️ Configured but untested | Bundle ID set (`com.bitesync.app`), `supportsTablet: true` — but iOS build requires Mac + Xcode OR EAS cloud build. You cannot test iOS on Windows locally. |

**Recommendation for now:** Focus on Android (your primary market in Pakistan). Web works as a demo tool. iOS can wait until you have revenue to justify an Apple Developer account ($99/year) and testing device.

---

## SQA — Testing Your App Before Launch

You need to test this like a real QA engineer before showing it to any client or user. Do this in **Week 1** alongside market research prep.

### Testing Tools

| Tool | What it does | Cost |
|------|-------------|------|
| **Expo Go** | Test live on Android instantly (scan QR) | Free |
| **Android Studio Emulator** | Test on virtual devices (different screen sizes, Android versions) | Free |
| **BrowserStack** | Test on 3000+ real devices in the cloud | Free trial / paid |
| **Postman** | Test Supabase API calls directly — verify RLS is working | Free |
| **Supabase Dashboard → Table Editor** | Manually verify data is writing correctly | Free |
| **Chrome DevTools** | Test web version — network, console errors, responsive layout | Free |

### Test Cases to Run (Do Every Single One)

#### Auth
- [ ] Sign up with a new email → user row auto-created in `users` table
- [ ] Log in with correct credentials
- [ ] Log in with wrong password → error shown, not crash
- [ ] Sign out → session cleared, redirected to auth screen
- [ ] What happens if Supabase is down? (turn off WiFi mid-session)

#### Home Tab
- [ ] Search bar — type 1 char (should not trigger), type 2+ chars (results appear)
- [ ] Search history saves after searching, shows on next focus
- [ ] Tap restaurant from dropdown → opens correct restaurant
- [ ] Tap dish from dropdown → opens correct dish detail
- [ ] Favourites section shows hearted dishes
- [ ] Trending section loads correctly
- [ ] Back button from restaurant → returns to Home correctly

#### Restaurant Page
- [ ] Hero image loads (not broken)
- [ ] Open/Closed badge is accurate (test at different times)
- [ ] Menu categories show in correct order
- [ ] Menu search filters correctly
- [ ] Tap dish → opens detail page
- [ ] Heart dish → appears in Favourites on Home

#### Review Flow
- [ ] Submit thumbs up + public note → appears in restaurant dashboard
- [ ] Submit thumbs down + private note → NOT visible in dashboard
- [ ] Upload photo → photo appears on review
- [ ] Edit review within 5 minutes → allowed
- [ ] Try editing after 5 minutes → blocked (test by changing DB clock or waiting)
- [ ] Delete review → disappears from diary and public feed

#### Profile / Diary
- [ ] All past reviews visible
- [ ] Private notes visible only to you
- [ ] Review streak increments correctly
- [ ] Avatar change saves

#### Security (Critical)
- [ ] Log in as User A, try to fetch User B's private notes via Postman → should return empty
- [ ] Try to submit a review with someone else's `user_id` via Postman → should fail
- [ ] Dashboard login with diner account → should not have admin access

#### Performance
- [ ] App loads within 3 seconds on a mid-range Android (test on older device)
- [ ] Search results appear within 500ms
- [ ] No crashes after 30 minutes of use
- [ ] Images load without freezing the UI

#### Edge Cases
- [ ] No internet connection — does the app crash or show a clean error?
- [ ] Restaurant with no menu items — does it show an empty state?
- [ ] Review with no public note (only private) — does it still submit?
- [ ] Very long restaurant name — does it overflow or truncate?
- [ ] Upload a very large photo — does it compress correctly?

### Bug Report Template
For every bug you find, write:
```
Screen: [which screen]
Steps: [exactly what you did]
Expected: [what should happen]
Actual: [what happened instead]
Device: [Android version, device model]
Screenshot: [attach]
```

---

## Phase 1 — Market Research (Month 1, Weeks 1–4)

**Goal:** Understand the market deeply before pitching to anyone. You should finish this month knowing: who your ideal restaurant client is, what their biggest pain points are, and what Karachi diners actually want.

### Week 1–2: Digital Research

#### Reddit
- **r/karachi** — search "restaurant feedback", "food apps karachi", post a question: *"Do you read Google Reviews before eating out in Karachi?"*
- **r/pakistan** — similar searches
- **r/restaurantowners** — read pain points restaurant owners share (even US-based is relevant — problems are universal)
- **r/smallbusiness** — how small restaurants think about customer data

**What to look for:**
- Do diners trust reviews?
- Do restaurant owners care about feedback?
- What existing apps do people use? (Zomato, Google Maps, Instagram)

#### Facebook Groups (Pakistan)
- Karachi Food Guide (large group)
- Karachi Restaurants & Cafes
- Pakistan Startup Ecosystem
- Search: "restaurant management Pakistan", "food delivery Karachi"

**What to post:** A simple poll — *"Do you leave reviews after eating out? Yes / No / Sometimes"*

#### Google Trends
- Search: "food review app Pakistan", "restaurant feedback Karachi", "Zomato Pakistan"
- Understand seasonality — when is dining out most popular?

#### Competitor Analysis
| Competitor | What they do | What they're missing |
|-----------|-------------|---------------------|
| Zomato | Restaurant discovery + reviews | No private food diary, no granular dish-level data |
| Google Maps | Reviews | No per-dish tracking, not actionable for restaurants |
| Instagram | Food photos | No structured feedback, no data for restaurants |
| Yelp | Reviews | Not active in Pakistan |
| **BiteSync** | Private diary + structured dish feedback | This is your gap |

**Your positioning:** You're not competing with Zomato for restaurant discovery. You're the **feedback and food intelligence layer** that Zomato doesn't provide.

### Week 2–3: Google Form Survey (Diners)

Create a form with these questions:

**Target audience:** Send to 50–100 people — friends, family, food-loving contacts

```
1. How often do you eat out per week?
   □ 1-2 times  □ 3-5 times  □ Daily

2. Do you ever forget what you ordered at a restaurant and whether you liked it?
   □ Yes, often  □ Sometimes  □ Never

3. Do you read online reviews before ordering a dish?
   □ Always  □ Sometimes  □ Never

4. Do you leave reviews after eating?
   □ Yes  □ No  □ Rarely
   → If No, why not? [open text]

5. Would you use an app that lets you privately track every meal you've eaten with your own notes?
   □ Definitely  □ Maybe  □ No

6. Would you rate a dish with one tap (thumbs up/down) right after eating?
   □ Yes  □ Maybe  □ No

7. What's your biggest frustration when trying a new restaurant?
   [open text]

8. Age: □ 18-24  □ 25-34  □ 35-44  □ 45+
9. Area: [open text]
```

**Distribute via:** WhatsApp broadcast, Instagram story, LinkedIn, university groups

### Week 3–4: Google Form Survey (Restaurant Owners)

**Target audience:** 10–20 restaurant managers/owners in Karachi

```
1. How do you currently collect customer feedback?
   □ Google Reviews  □ Paper forms  □ WhatsApp  □ We don't  □ Other

2. Do you know which specific dishes on your menu are performing poorly?
   □ Yes  □ No  □ Somewhat

3. How often do you read your Google/Zomato reviews?
   □ Daily  □ Weekly  □ Rarely  □ Never

4. If you could see exactly which dishes 70% of customers disliked this week, would that be valuable?
   □ Extremely valuable  □ Somewhat  □ Not really

5. Would you pay for a tool that gives you live dish-by-dish customer sentiment?
   □ Yes  □ Maybe  □ No
   → If Yes, what's a fair monthly price? [open text]

6. Biggest challenge in managing customer satisfaction?
   [open text]

7. Restaurant type: □ Fast food  □ Casual dining  □ Fine dining  □ Cafe
8. Number of daily covers (customers): □ <50  □ 50-200  □ 200-500  □ 500+
```

**How to reach them:** LinkedIn (search "restaurant manager Karachi"), visit in person during off-peak hours (3–5 PM), ask your network

### End of Month 1 Deliverables
- [ ] Survey results compiled (minimum 50 diner responses, 10 restaurant responses)
- [ ] Competitor analysis documented
- [ ] Clear answer to: What is the #1 pain point for restaurants that BiteSync solves?
- [ ] Clear answer to: What makes a diner actually use BiteSync consistently?
- [ ] Updated value proposition (1 sentence: "BiteSync does X for Y so that Z")

---

## Phase 2 — Pre-Launch & First Client Prep (Month 2, Weeks 5–8)

**Goal:** Get everything ready to walk into a restaurant and sign them up.

### Week 5: Build Your Sales Arsenal

**1. One-Pager (PDF)**
One page. No jargon. Answers:
- What is BiteSync?
- What problem does it solve?
- What does the restaurant get?
- How much does it cost? (Free for beta)
- How to get started (your phone number / email)

**2. Demo Video (3–5 minutes)**
Record your screen + voice:
- Open the app as a diner, browse a restaurant, leave a review
- Switch to dashboard, show the review appearing live
- Show the popularity score updating

Use: **Loom** (free) or OBS for recording. Share as a link.

**3. Pitch Deck (8–10 slides)**
```
Slide 1: Problem — "Restaurants don't know why customers don't come back"
Slide 2: Solution — BiteSync in one sentence
Slide 3: How it works — 3 steps (diner reviews → data flows → restaurant sees)
Slide 4: What the restaurant gets (dashboard screenshots)
Slide 5: What the diner gets (app screenshots)
Slide 6: Why now? (Growing Karachi food scene, digital adoption)
Slide 7: Traction (your 5 seed restaurants, X survey responses)
Slide 8: The ask — "Be our beta partner, free for 6 months"
Slide 9: Contact
```

**3. Pricing Strategy for Beta**
- **Beta (now):** 100% Free — you need data, they need the product
- **After 3 months:** Charge PKR 5,000–15,000/month depending on restaurant size
- **Tell them upfront:** "This is free for 6 months as our beta partner. After that, pricing will be based on value delivered."

### Week 6–7: First Client Outreach

Your 5 seed restaurants are already in the database — **start there.**

**Target list (priority order):**
1. A mid-size casual dining restaurant (most likely to adopt tech)
2. A restaurant with a large menu (more data for you)
3. A restaurant that already asks for feedback somehow (receptive to the idea)

**How to approach:**
1. Go in person during off-peak hours (3–5 PM, weekdays)
2. Ask for the manager or owner
3. Don't pitch immediately — ask questions first:
   - "How do you currently know which dishes are doing well?"
   - "Do you track customer feedback?"
4. Show the demo video on your phone
5. Offer: "We'd love you to be one of our 5 beta restaurants in Karachi. It's completely free."

**Follow-up:** If they say "send me info", send the one-pager + demo link within 2 hours. Follow up in 3 days.

### Week 8: Onboard First Client

Once you have one yes:
1. Show them the dashboard live (screen share or in person)
2. Verify their menu is complete in the system
3. Print a QR code for their table / counter (links to the restaurant in the app)
4. Train them: how to log in, how to read reviews, how to manage menu
5. Set expectations: "You'll start seeing feedback within the first week as diners use the app"

**QR Code:** Use [qr.io](https://qr.io) or [qrcode-monkey.com](https://qrcode-monkey.com) to generate a branded QR code pointing to a link that deep-links to the restaurant in the app.

---

## Phase 3 — User Acquisition & Data Collection (Month 3, Weeks 9–12)

**Goal:** Get real diners using the app at your first client restaurant and beyond.

### Getting Diners on the App

**In-restaurant:**
- QR code standee on every table ("Scan to review your meal & build your food diary")
- QR on the receipt
- Train waitstaff to mention it ("You can save your order and leave feedback on BiteSync")

**Digital:**
- Instagram/TikTok: Short video showing the food diary feature — "I finally remember what I ordered 3 months ago at X restaurant"
- WhatsApp broadcast to your contacts
- Post in Karachi food Facebook groups
- Ask your first restaurant to share it with their followers

**Incentive (optional):** First 100 users who leave 5 reviews get a small reward (discount at the restaurant, a BiteSync badge, etc.)

### What Success Looks Like at End of Month 3

| Metric | Target |
|--------|--------|
| Restaurant clients | 1–3 signed up |
| App installs | 50–200 |
| Reviews submitted | 200+ |
| Avg reviews per user | 3+ |
| Dashboard logins by restaurants | Weekly (they're engaged) |

---

## 90-Day Calendar Summary

| Week | Focus | Key Deliverable |
|------|-------|----------------|
| **1** | SQA Testing | Bug list documented and fixed |
| **2** | Digital research (Reddit, Facebook, competitors) | Competitor analysis doc |
| **3** | Diner survey live | 50+ responses collected |
| **4** | Restaurant owner survey | 10+ responses, insights documented |
| **5** | Sales materials | One-pager, demo video, pitch deck |
| **6** | First outreach | 5 restaurants contacted |
| **7** | Follow-ups + second wave outreach | 10 restaurants contacted |
| **8** | First client signed | Dashboard access given, QR printed |
| **9** | App promotion at restaurant | First real reviews flowing in |
| **10** | Analyse data | Which dishes are getting reviewed? |
| **11** | Second client outreach (with proof) | "Restaurant X has seen 50+ reviews" |
| **12** | Review & plan next quarter | Monthly revenue target set |

---

## Tools You'll Need (All Free to Start)

| Purpose | Tool |
|---------|------|
| Surveys | Google Forms |
| Research notes | Notion or Google Docs |
| Demo recording | Loom (free tier) |
| Pitch deck | Canva (free) or Google Slides |
| QR codes | qrcode-monkey.com |
| Email outreach | Gmail (for now) |
| Analytics tracking | Supabase dashboard |
| Bug tracking | Notion table or GitHub Issues |
| CRM (client tracking) | Notion or a simple spreadsheet |
| Social content | CapCut for short videos |

---

## The One Thing That Will Make or Break This

**Talk to 10 restaurant owners before building anything else.**

Not via WhatsApp. In person. Go to the restaurant. Every "maybe" in a survey is a "no" in real life. Every "yes" in person is worth 20 survey responses. Your market research month is not about Google Forms — it's about getting in front of real restaurant owners and watching their face when you show them the dashboard.

If 3 out of 10 owners say "when can we start?" — you have product-market fit.
If 0 out of 10 owners react positively — you have invaluable information that no survey would've given you.

