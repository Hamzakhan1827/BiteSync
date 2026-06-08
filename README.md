# CraveSync

> **Direct-to-kitchen feedback pipeline, de-risking every meal.**

CraveSync is a B2B2C dining intelligence platform built for Karachi's culinary scene. It connects diners' plates directly to the restaurant kitchen—allowing diners to rate dishes instantly in 3 seconds and submit feedback directly to the chef, while giving operators a real-time dashboard to monitor dish performance, prevent bad public reviews, and automate customer winback campaigns.

---

## What's in this repo

| Directory | What it is |
|-----------|-----------|
| `mobile/` | React Native + Expo mobile app (Android / iOS / Web) |
| `dashboard/` | Next.js restaurant operator admin panel |
| `database/` | All SQL: schema, RLS policies, migrations, seed data |
| `docs/` | Technical documentation (architecture, schema, deployment) |

---

## The Product

### Diner Interface (Web-based & App)
- **Direct-to-Chef Hook** — send feedback directly to the kitchen (avoiding noisy public review sites)
- **Frictionless QR Rating** — scan tabletop QR, rate with one tap in 3 seconds (no app install required)
- **Dish-Level Search & Ratings** — find the best dish before ordering (de-risking the meal)
- **Trending & Popularity** — real-time trending dishes based on verified dine-in reviews
- **Optional Food History** — browse your past reviews and saved favorites in your profile

### Restaurant Operator Dashboard
- **Real-Time Sentiment Pipeline** — read dish ratings and chef feedback as soon as they are submitted
- **Dish-Level Analytics** — identify underperforming menu items before they drive customers away
- **Automated Winback Campaigns** — set up rules to auto-email discounts or apology offers to dissatisfied diners
- **Instagram Bio Menu Link** — embed your live, highly-rated menu directly in your Instagram bio

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile app | React Native 0.81 + Expo 54 |
| Language | TypeScript |
| Backend & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Dashboard | Next.js 14 (App Router) |
| Icons | lucide-react-native |
| Local storage | AsyncStorage (search history, preferences) |
| Image handling | expo-image-picker + expo-image-manipulator |
| Bundle ID | `com.cravesync.app` |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project (URL + anon key)

### Mobile App

```bash
cd mobile
npm install
# Add your Supabase credentials to .env
npx expo start          # Expo Go (QR code)
npx expo start --web    # Browser at localhost:8081
```

### Dashboard

```bash
cd dashboard
npm install
# Add your Supabase credentials to .env.local
npm run dev             # http://localhost:3000
```

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for full environment setup.

---

## Documentation

### For Users & Clients

| Document | Audience |
|----------|---------|
| [`docs/FOR_RESTAURANTS.md`](docs/FOR_RESTAURANTS.md) | Restaurant owners — dashboard guide, onboarding, what you get |
| [`docs/FOR_DINERS.md`](docs/FOR_DINERS.md) | App users — how to use CraveSync, features, tips |
| [`docs/FAQ.md`](docs/FAQ.md) | Common questions answered for both diners and restaurants |
| [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md) | Data collection, private notes protection, your rights |

### For Developers

| Document | Description |
|----------|-------------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, data flow, component overview |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Full schema, table relationships, RLS policies |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Local setup, environment variables, running the apps |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Building the APK, deploying the dashboard |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Auth model, Row Level Security, data privacy |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history and release notes |

---

## Roadmap highlights

- [ ] AI review summariser ("70% of customers said the chicken was too dry")
- [ ] QR code standees for physical restaurant deployment
- [ ] SaaS billing portal for restaurants (Stripe / SadaPay)
- [ ] Dietary alerts (flag allergens on menu items)
- [ ] Gamification — reviewer badges and streaks
- [ ] Data export for restaurant owners (CSV)

---

## License

Private and proprietary. All rights reserved — CraveSync © 2026.
