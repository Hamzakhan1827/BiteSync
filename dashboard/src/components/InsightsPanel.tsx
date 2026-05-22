"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, Star, AlertCircle, Crown, Users } from "lucide-react";
import { generateAiInsights } from "@/app/actions/insights";

type MenuItemStat = {
  id: string;
  name: string;
  total: number;
  positive: number;
  negative: number;
  negativeNotes: string[];
};

type AiResult = {
  digest: string;
  tips: Array<{ item: string; tip: string }>;
};

type Props = {
  restaurantName: string;
  weeklyStats: { total: number; positive: number; negative: number };
  menuPerformance: MenuItemStat[];
  totalCustomers: number;
};

export function InsightsPanel({ restaurantName, weeklyStats, menuPerformance, totalCustomers }: Props) {
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const positiveRate =
    weeklyStats.total > 0 ? Math.round((weeklyStats.positive / weeklyStats.total) * 100) : 0;
  const topItem = menuPerformance[0];

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await generateAiInsights({
        restaurantName,
        weeklyTotal: weeklyStats.total,
        weeklyPositive: weeklyStats.positive,
        weeklyNegative: weeklyStats.negative,
        menuItems: menuPerformance.map((i) => ({
          name: i.name,
          total: i.total,
          positive: i.positive,
          negative: i.negative,
          topNotes: i.negativeNotes.slice(0, 3),
        })),
      });
      setAiResult(result);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Reviews This Week"
          value={weeklyStats.total.toString()}
          icon={<Star className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          label="Positive Rate"
          value={weeklyStats.total > 0 ? `${positiveRate}%` : "—"}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          label="Top Item"
          value={topItem?.name || "—"}
          icon={<Crown className="w-5 h-5 text-amber-500" />}
          small
        />
        <StatCard
          label="Known Customers"
          value={totalCustomers > 0 ? totalCustomers.toString() : "—"}
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
      </div>

      {/* Menu Performance + AI Tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Menu Performance</h3>
          <div className="space-y-3">
            {menuPerformance.slice(0, 8).map((item) => {
              const rate = item.total > 0 ? Math.round((item.positive / item.total) * 100) : 0;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[60%]">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.total} · {rate}% 👍
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        rate >= 70 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {menuPerformance.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No review data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">AI Recommendations</h3>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Analyzing…" : aiResult ? "Refresh" : "Generate"}
            </button>
          </div>

          {!aiResult && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">
                Click Generate to get AI-powered recommendations based on your review data
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          )}

          {aiResult && !isGenerating && (
            <div className="space-y-3">
              {aiResult.digest && (
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 leading-relaxed">
                  {aiResult.digest}
                </p>
              )}
              {aiResult.tips?.map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tip.item}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{tip.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  small,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="mb-3">{icon}</div>
      <p
        className={`font-bold text-slate-900 dark:text-slate-100 mb-1 ${
          small ? "text-base truncate" : "text-2xl"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
