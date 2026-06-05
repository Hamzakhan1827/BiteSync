# post-review-trigger

Fires whenever a new row is inserted into `reviews`. Generates a personalized follow-up email via OpenAI and sends it via Resend, using the restaurant's configured follow-up policy.

## Deploy

```bash
supabase functions deploy post-review-trigger
```

## Environment Variables

Set these in your Supabase project → Settings → Edge Functions → Secrets:

| Variable | Description |
|---|---|
| `WEBHOOK_SECRET` | A random secret string you choose (e.g. `openssl rand -hex 32`) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_DOMAIN` | Verified sending domain (e.g. `cravesync.app`). Must be verified in Resend. |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the runtime.

## Wiring the Database Webhook

1. Go to Supabase Dashboard → Database → Webhooks → Create new webhook
2. Name: `post-review-trigger`
3. Table: `reviews`
4. Events: `INSERT`
5. Type: **Supabase Edge Functions**
6. Function: `post-review-trigger`
7. HTTP Headers — add: `x-webhook-secret: <your WEBHOOK_SECRET value>`

## Follow-up Policies

| Policy | Behavior |
|---|---|
| `apology_only` | Sincere apology for issues, thank-you for positive reviews. No offers ever. |
| `discount_offer` | Offers configured % discount for unhappy customers. |
| `free_item` | Offers a complimentary item for unhappy customers. |
| `custom_message` | Restaurant writes their own tone/template, AI personalizes it. |

## Spam Guards

- One follow-up per review (`UNIQUE` on `review_id` in `ai_followup_log`)
- 24-hour cooldown per customer per restaurant
- Skips reviews with no `public_note` (customer didn't write anything)
- Skips customers with no email in Supabase Auth
