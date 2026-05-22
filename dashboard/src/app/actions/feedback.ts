"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function saveOwnerReply(reviewId: string, reply: string) {
  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ owner_reply: reply.trim() || null, owner_reply_at: reply.trim() ? new Date().toISOString() : null })
    .eq("id", reviewId);

  if (error) throw new Error(error.message);
}

export async function generateAiReply(ctx: {
  restaurantName: string;
  dinerName: string;
  menuItemName: string;
  rating: boolean | null;
  publicNote: string;
}) {
  const ratingText = ctx.rating === true ? "positive" : ctx.rating === false ? "negative" : "neutral";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a warm restaurant manager for "${ctx.restaurantName}". Write a short, genuine public reply to a customer review. Keep it to 1-2 sentences max. Be personal, not corporate. No markdown.`,
        },
        {
          role: "user",
          content: `Customer: ${ctx.dinerName}\nItem: ${ctx.menuItemName}\nRating: ${ratingText}\nReview: "${ctx.publicNote}"\n\nWrite the owner reply now.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string)?.trim() || "";
}
