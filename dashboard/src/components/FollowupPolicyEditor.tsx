"use client";

import { useState } from "react";
import { saveFollowupPolicy } from "@/app/settings/actions";
import { Save, CheckCircle, Mail, ToggleLeft, ToggleRight, Percent, MessageSquare, Heart, Sparkles } from "lucide-react";

type FollowupPolicy = "apology_only" | "discount_offer" | "free_item" | "custom_message";

type FollowupSettings = {
  id: string;
  followup_enabled: boolean;
  followup_policy: FollowupPolicy;
  followup_discount_percent: number;
  followup_custom_template: string | null;
};

const POLICIES: {
  value: FollowupPolicy;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "apology_only",
    label: "Warm Apology",
    description: "Sincere acknowledgment for issues, heartfelt thank-you for praise. No offers attached.",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    value: "discount_offer",
    label: "Discount Offer",
    description: "Apologize to unhappy customers and offer a percentage discount on their next visit.",
    icon: <Percent className="w-4 h-4" />,
  },
  {
    value: "free_item",
    label: "Complimentary Item",
    description: "Offer a free item to unhappy customers as a gesture of goodwill.",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: "custom_message",
    label: "Custom Approach",
    description: "Write your own tone/template. AI personalizes it for each customer and review.",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

export function FollowupPolicyEditor({ restaurant }: { restaurant: FollowupSettings }) {
  const [enabled, setEnabled] = useState(restaurant.followup_enabled ?? false);
  const [policy, setPolicy] = useState<FollowupPolicy>(restaurant.followup_policy ?? "apology_only");
  const [discountPercent, setDiscountPercent] = useState(restaurant.followup_discount_percent ?? 10);
  const [customTemplate, setCustomTemplate] = useState(restaurant.followup_custom_template ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = true; // always allow save since toggles don't have pristine state

  const validate = (): string | null => {
    if (policy === "discount_offer" && (discountPercent < 5 || discountPercent > 50)) {
      return "Discount must be between 5% and 50%.";
    }
    if (policy === "custom_message" && !customTemplate.trim()) {
      return "Please enter your custom message template.";
    }
    return null;
  };

  const save = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setIsSaving(true);
    setSaved(false);

    try {
      const result = await saveFollowupPolicy({
        restaurantId: restaurant.id,
        followupEnabled: enabled,
        followupPolicy: policy,
        followupDiscountPercent: discountPercent,
        followupCustomTemplate: policy === "custom_message" ? customTemplate.trim() || null : null,
      });

      if (result.error) throw new Error(result.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Enable toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Follow-up Emails</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically send a personalized email to customers after they leave a review.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(v => !v)}
            className="shrink-0 flex items-center gap-2 text-sm font-semibold transition-colors"
            aria-label={enabled ? "Disable follow-ups" : "Enable follow-ups"}
          >
            {enabled ? (
              <>
                <ToggleRight className="w-8 h-8 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">On</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-8 h-8 text-slate-400" />
                <span className="text-slate-400">Off</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Policy selector + conditional fields */}
      {enabled && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Follow-up Approach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
              Choose how your restaurant responds to customer reviews. The AI personalizes each message.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {POLICIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPolicy(p.value)}
                  className={[
                    "text-left rounded-xl border-2 px-4 py-3.5 transition-all",
                    policy === p.value
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800",
                  ].join(" ")}
                >
                  <div className={[
                    "flex items-center gap-2 font-semibold text-sm mb-1",
                    policy === p.value
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300",
                  ].join(" ")}>
                    {p.icon}
                    {p.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Discount percent — only shown for discount_offer */}
          {policy === "discount_offer" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4" /> Discount Amount
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={discountPercent}
                  onChange={e => {
                    setDiscountPercent(Number(e.target.value));
                    setSaved(false);
                    setError(null);
                  }}
                  className="w-28 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-center text-lg font-bold"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">% off next visit</p>
                  <p className="text-xs text-slate-400 mt-0.5">Must be between 5% and 50%.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Example email excerpt:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                  "…We'd love to make it up to you. Here's {discountPercent}% off your next visit — just show this email when you order."
                </p>
              </div>
            </div>
          )}

          {/* Custom template — only shown for custom_message */}
          {policy === "custom_message" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Your Message Template
              </h3>
              <textarea
                rows={4}
                value={customTemplate}
                onChange={e => { setCustomTemplate(e.target.value); setSaved(false); setError(null); }}
                placeholder="e.g. At our restaurant, every guest matters. We read every review personally and always strive to do better. Your feedback means the world to us."
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none text-sm leading-relaxed"
              />
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your tone, values, or anything specific you want mentioned. The AI uses this as a guide and personalizes each email with the customer's name and the item they reviewed.
              </p>
            </div>
          )}

          {/* Behavior summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              What happens when a review comes in
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>• Only customers who wrote a public note receive a follow-up</li>
              <li>• One email per review, 24-hour cooldown per customer</li>
              <li>• Sent under your restaurant name via BiteSync</li>
              <li>• All sends are logged in your dashboard</li>
            </ul>
          </div>
        </>
      )}

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4" /> Saved successfully
          </span>
        )}
        {error && (
          <span className="text-red-500 text-sm font-semibold">{error}</span>
        )}
      </div>
    </div>
  );
}
