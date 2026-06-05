import { createClient } from 'npm:@supabase/supabase-js@2'
import OpenAI from 'npm:openai@4'

type FollowupPolicy = 'apology_only' | 'discount_offer' | 'free_item' | 'custom_message'

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
  followup_enabled: boolean
  followup_policy: FollowupPolicy
  followup_discount_percent: number
  followup_custom_template: string | null
  recovery_emails_enabled: boolean
}

interface GeneratedEmail {
  subject: string
  body: string
}

Deno.serve(async (req) => {
  const webhookSecret = req.headers.get('x-webhook-secret')
  if (webhookSecret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await req.json()

    if (payload.type !== 'INSERT' || payload.table !== 'reviews') {
      return json({ skipped: 'not_a_review_insert' })
    }

    const review = payload.record

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Resolve: review → menu_item → menu_category → restaurant
    const { data: menuItem, error: itemErr } = await supabase
      .from('menu_items')
      .select('name, category_id')
      .eq('id', review.menu_item_id)
      .single()

    if (itemErr || !menuItem) return json({ skipped: 'menu_item_not_found' })

    const { data: category, error: catErr } = await supabase
      .from('menu_categories')
      .select('restaurant_id')
      .eq('id', menuItem.category_id)
      .single()

    if (catErr || !category) return json({ skipped: 'category_not_found' })

    const { data: restaurant, error: restErr } = await supabase
      .from('restaurants')
      .select('id, name, logo_url, followup_enabled, followup_policy, followup_discount_percent, followup_custom_template, recovery_emails_enabled')
      .eq('id', category.restaurant_id)
      .single<Restaurant>()

    if (restErr || !restaurant) return json({ skipped: 'restaurant_not_found' })

    const hasPublicNote = Boolean(review.public_note?.trim())
    const shouldFollowup = restaurant.followup_enabled && hasPublicNote
    const shouldRecover = restaurant.recovery_emails_enabled && review.rating_thumbs === false

    if (!shouldFollowup && !shouldRecover) {
      return json({ skipped: 'nothing_to_do' })
    }

    // Skip if already sent an email for this review
    const { data: existingLog } = await supabase
      .from('ai_followup_log')
      .select('id')
      .eq('review_id', review.id)
      .eq('status', 'sent')
      .maybeSingle()

    if (existingLog) return json({ skipped: 'already_sent' })

    // Get customer info (needed for both flows)
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', review.user_id)
      .single()

    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(review.user_id)
    const customerEmail = authUser?.email
    const customerName = userProfile?.full_name || 'Valued Customer'

    if (!customerEmail) {
      await logResult(supabase, {
        review_id: review.id,
        restaurant_id: restaurant.id,
        user_id: review.user_id,
        policy_used: restaurant.followup_policy,
        status: 'skipped',
        skip_reason: 'no_email',
      })
      return json({ skipped: 'no_email' })
    }

    // --- AI Follow-up email (all reviews with a public note) ---
    if (shouldFollowup) {
      // Guard: 1-minute cooldown per customer per restaurant (change to 24 * 60 * 60 * 1000 for production)
      const cooldownStart = new Date(Date.now() - 1 * 60 * 1000).toISOString()
      const { count: recentCount } = await supabase
        .from('ai_followup_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', review.user_id)
        .eq('restaurant_id', restaurant.id)
        .eq('status', 'sent')
        .gte('sent_at', cooldownStart)

      if ((recentCount ?? 0) > 0) {
        await logResult(supabase, {
          review_id: review.id,
          restaurant_id: restaurant.id,
          user_id: review.user_id,
          policy_used: restaurant.followup_policy,
          status: 'skipped',
          skip_reason: 'cooldown_24h',
        })
        // Don't return — let recovery email run below if applicable
      } else {
        const ratingText = review.rating_thumbs === true
          ? 'positive'
          : review.rating_thumbs === false
            ? 'negative'
            : 'neutral'

        const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! })

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildSystemPrompt(restaurant) },
            {
              role: 'user',
              content: buildUserPrompt({
                customerName,
                restaurantName: restaurant.name,
                menuItemName: menuItem.name,
                rating: ratingText,
                publicNote: review.public_note,
              }),
            },
          ],
          max_tokens: 400,
          temperature: 0.7,
        })

        let email: GeneratedEmail
        try {
          email = JSON.parse(completion.choices[0].message.content!) as GeneratedEmail
          if (!email.subject || !email.body) throw new Error('missing fields')
        } catch {
          await logResult(supabase, {
            review_id: review.id,
            restaurant_id: restaurant.id,
            user_id: review.user_id,
            policy_used: restaurant.followup_policy,
            status: 'failed',
            skip_reason: 'invalid_ai_response',
          })
          return json({ error: 'invalid_ai_response' }, 500)
        }

        const fromField = 'onboarding@resend.dev'
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromField,
            to: customerEmail,
            subject: email.subject,
            text: email.body,
            html: buildEmailHtml(restaurant.name, email.body, restaurant.logo_url),
          }),
        })

        const generatedMessage = `Subject: ${email.subject}\n\n${email.body}`

        if (!resendRes.ok) {
          const resendErr = await resendRes.text()
          await logResult(supabase, {
            review_id: review.id,
            restaurant_id: restaurant.id,
            user_id: review.user_id,
            policy_used: restaurant.followup_policy,
            generated_message: generatedMessage,
            email_sent_to: customerEmail,
            status: 'failed',
            skip_reason: resendErr.slice(0, 500),
          })
          return json({ error: 'email_send_failed' }, 500)
        }

        await logResult(supabase, {
          review_id: review.id,
          restaurant_id: restaurant.id,
          user_id: review.user_id,
          policy_used: restaurant.followup_policy,
          generated_message: generatedMessage,
          email_sent_to: customerEmail,
          status: 'sent',
        })

        // Followup sent — recovery would duplicate, so return here
        return json({ sent: true, to: customerEmail, type: 'followup' })
      }
    }

    // --- Recovery email (negative reviews only, fires when followup was skipped/disabled) ---
    if (shouldRecover) {
      // 7-day cooldown: don't spam the same unhappy customer repeatedly
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: recentRecovery } = await supabase
        .from('ai_followup_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', review.user_id)
        .eq('restaurant_id', restaurant.id)
        .eq('policy_used', 'recovery')
        .eq('status', 'sent')
        .gte('sent_at', sevenDaysAgo)

      if ((recentRecovery ?? 0) > 0) {
        return json({ skipped: 'recovery_cooldown_7d' })
      }

      const firstName = customerName.split(' ')[0]
      const recoveryBody = [
        `Hi ${firstName},`,
        '',
        `Thank you for visiting ${restaurant.name} and taking the time to share your feedback. We're truly sorry your experience didn't meet your expectations.`,
        '',
        `Your feedback matters a great deal to us. We'd love the chance to make it right — please come back and give us another try.`,
        '',
        `See you soon,`,
        restaurant.name,
      ].join('\n')

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: customerEmail,
          subject: `We're sorry about your experience, ${firstName}`,
          html: buildEmailHtml(restaurant.name, recoveryBody, restaurant.logo_url),
        }),
      })

      if (!resendRes.ok) {
        const resendErr = await resendRes.text()
        await logResult(supabase, {
          review_id: review.id,
          restaurant_id: restaurant.id,
          user_id: review.user_id,
          policy_used: 'recovery',
          email_sent_to: customerEmail,
          status: 'failed',
          skip_reason: resendErr.slice(0, 500),
        })
        return json({ error: 'recovery_email_failed' }, 500)
      }

      await logResult(supabase, {
        review_id: review.id,
        restaurant_id: restaurant.id,
        user_id: review.user_id,
        policy_used: 'recovery',
        generated_message: recoveryBody,
        email_sent_to: customerEmail,
        status: 'sent',
      })

      return json({ sent: true, to: customerEmail, type: 'recovery' })
    }

    return json({ skipped: 'nothing_sent' })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('post-review-trigger:', message)
    return json({ error: message }, 500)
  }
})

function buildSystemPrompt(restaurant: Restaurant): string {
  const base = `You are a warm, concise customer relations assistant for "${restaurant.name}", a restaurant. Write a personalized follow-up email after a customer submits a review. Keep it genuine and human — 2 short paragraphs maximum. Never sound robotic or copy-paste.`

  const policyInstructions: Record<FollowupPolicy, string> = {
    apology_only:
      'For negative reviews: write a sincere apology that acknowledges the specific issue the customer mentioned. For positive reviews: write a heartfelt thank-you. Do NOT mention discounts, offers, or free items under any circumstances.',

    discount_offer:
      `For negative reviews: apologize for the issue and offer a ${restaurant.followup_discount_percent}% discount on their next visit as a gesture of goodwill — state the exact percentage. For positive reviews: thank them warmly and invite them back, mentioning the discount as a loyalty treat.`,

    free_item:
      'For negative reviews: apologize sincerely and offer a complimentary item on their next visit to make it right. For positive reviews: thank them and let them know there is a complimentary treat waiting for them on their next visit.',

    custom_message:
      `Follow this tone and approach set by the restaurant owner: "${restaurant.followup_custom_template || 'Be warm and professional'}". Personalize it naturally with the customer name and the specific item they reviewed.`,
  }

  return [
    base,
    policyInstructions[restaurant.followup_policy],
    'Respond ONLY with a JSON object: { "subject": "...", "body": "..." }. The subject line should be personalized and concise (under 60 characters). The body should use plain text, no markdown.',
  ].join('\n\n')
}

function buildUserPrompt(ctx: {
  customerName: string
  restaurantName: string
  menuItemName: string
  rating: string
  publicNote: string
}): string {
  return `Customer name: ${ctx.customerName}
Restaurant: ${ctx.restaurantName}
Menu item reviewed: ${ctx.menuItemName}
Overall rating: ${ctx.rating}
Customer's written note: "${ctx.publicNote}"

Write the follow-up email now.`
}

function buildEmailHtml(restaurantName: string, body: string, logoUrl: string | null): string {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${restaurantName}" style="max-height:56px;margin-bottom:24px;display:block;" />`
    : `<p style="font-size:18px;font-weight:700;color:#111827;margin:0 0 24px;">${restaurantName}</p>`

  const paragraphs = body
    .split('\n')
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 14px;color:#374151;line-height:1.6;">${p}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#ffffff;">
  ${logoHtml}
  <div style="border-left:3px solid #10b981;padding-left:18px;margin-bottom:32px;">
    ${paragraphs}
  </div>
  <p style="font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;margin:0;">
    Sent by ${restaurantName} via <strong>CraveSync</strong>. You received this because you left a public review.
  </p>
</body>
</html>`
}

async function logResult(supabase: ReturnType<typeof createClient>, entry: {
  review_id: string
  restaurant_id: string
  user_id: string
  policy_used: string
  generated_message?: string
  email_sent_to?: string
  status: 'sent' | 'failed' | 'skipped'
  skip_reason?: string
}) {
  await supabase.from('ai_followup_log').insert(entry)
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
