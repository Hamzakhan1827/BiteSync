"use server";

export async function generateAiInsights(data: {
  restaurantName: string;
  weeklyTotal: number;
  weeklyPositive: number;
  weeklyNegative: number;
  menuItems: Array<{ name: string; total: number; positive: number; negative: number; topNotes: string[] }>;
}) {
  const negativeItems = data.menuItems
    .filter((i) => i.negative > 0)
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 5);

  const positiveRate =
    data.weeklyTotal > 0 ? Math.round((data.weeklyPositive / data.weeklyTotal) * 100) : 0;

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
          content: `You are a restaurant business analyst. Analyze review data and return JSON with exactly this shape: {"digest": "2-3 sentence weekly summary", "tips": [{"item": "item name", "tip": "actionable tip"}]}. Maximum 3 tips. Be specific and actionable.`,
        },
        {
          role: "user",
          content: `Restaurant: ${data.restaurantName}
Last 7 days: ${data.weeklyTotal} reviews, ${positiveRate}% positive.

Menu items with negative feedback:
${
  negativeItems.length > 0
    ? negativeItems
        .map(
          (i) =>
            `- ${i.name}: ${i.negative} negative out of ${i.total}. Customer notes: ${i.topNotes.slice(0, 3).join("; ")}`
        )
        .join("\n")
    : "None — great week!"
}

Generate the JSON analysis now.`,
        },
      ],
      max_tokens: 400,
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  const result = await res.json();
  const content = result.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content || '{"digest":"","tips":[]}') as {
      digest: string;
      tips: Array<{ item: string; tip: string }>;
    };
  } catch {
    return { digest: content || "", tips: [] };
  }
}
