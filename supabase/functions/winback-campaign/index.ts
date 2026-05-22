import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const webhookSecret = req.headers.get('x-webhook-secret')
  if (webhookSecret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: restaurants, error: restErr } = await supabase
      .from('restaurants')
      .select('id, name, logo_url')
      .eq('winback_emails_enabled', true)

    if (restErr || !restaurants?.length) {
      return json({ processed: 0, reason: restErr?.message ?? 'no_restaurants_enabled' })
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    let totalSent = 0
    const results: Record<string, { sent: number; skipped: number }> = {}

    for (const restaurant of restaurants) {
      results[restaurant.id] = { sent: 0, skipped: 0 }

      // Get all reviews for this restaurant, most recent first, with user data
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          user_id,
          created_at,
          users!inner(id, full_name, email),
          menu_items!inner(menu_categories!inner(restaurant_id))
        `)
        .eq('menu_items.menu_categories.restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })

      if (!reviews?.length) continue

      // Group by user_id — first entry per user is their most recent review
      const userLastReview = new Map<string, { userId: string; name: string; email: string; lastAt: string }>()
      for (const r of reviews) {
        const u = (r as any).users
        if (!u?.id || !u.email) continue
        if (!userLastReview.has(u.id)) {
          userLastReview.set(u.id, {
            userId: u.id,
            name: u.full_name || 'Valued Customer',
            email: u.email,
            lastAt: r.created_at,
          })
        }
      }

      // Keep only customers whose last review was > 30 days ago
      const candidates = Array.from(userLastReview.values()).filter(u => u.lastAt < thirtyDaysAgo)

      for (const candidate of candidates) {
        // Skip if already sent a win-back to this person at this restaurant in the last 30 days
        const { data: recentWinback } = await supabase
          .from('winback_log')
          .select('id')
          .eq('user_id', candidate.userId)
          .eq('restaurant_id', restaurant.id)
          .gte('created_at', thirtyDaysAgo)
          .maybeSingle()

        if (recentWinback) {
          results[restaurant.id].skipped++
          continue
        }

        const firstName = candidate.name.split(' ')[0]
        const body = [
          `Hi ${firstName},`,
          '',
          `It's been a while since your last visit to ${restaurant.name}, and we genuinely miss having you here!`,
          '',
          `We'd love to welcome you back. Stop by any time — we always have something worth trying.`,
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
            to: candidate.email,
            subject: `We miss you at ${restaurant.name}!`,
            html: buildEmailHtml(restaurant.name, body, restaurant.logo_url),
          }),
        })

        if (resendRes.ok) {
          await supabase.from('winback_log').insert({
            user_id: candidate.userId,
            restaurant_id: restaurant.id,
            email_sent_to: candidate.email,
          })
          results[restaurant.id].sent++
          totalSent++
        } else {
          const errText = await resendRes.text()
          console.error(`Win-back failed for ${candidate.email}:`, errText)
          results[restaurant.id].skipped++
        }
      }
    }

    return json({ totalSent, results })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('winback-campaign:', message)
    return json({ error: message }, 500)
  }
})

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
    Sent by ${restaurantName} via <strong>BiteSync</strong>. You received this because you previously reviewed this restaurant.
  </p>
</body>
</html>`
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
