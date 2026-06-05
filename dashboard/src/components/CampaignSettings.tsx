"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight, Save, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { saveCampaignSettings } from "@/app/settings/actions";

type Props = {
  restaurantId: string;
  recoveryEmailsEnabled: boolean;
  winbackEmailsEnabled: boolean;
};

export function CampaignSettings({ restaurantId, recoveryEmailsEnabled, winbackEmailsEnabled }: Props) {
  const [recovery, setRecovery] = useState(recoveryEmailsEnabled);
  const [winback, setWinback] = useState(winbackEmailsEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveCampaignSettings({ restaurantId, recoveryEmailsEnabled: recovery, winbackEmailsEnabled: winback });
      if (result?.error) throw new Error(result.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <CampaignRow
          icon={<Mail className="w-5 h-5 text-rose-500" />}
          title="Recovery Emails"
          description="Automatically send a personal apology to customers who leave a negative review."
          enabled={recovery}
          onChange={setRecovery}
        />
        <CampaignRow
          icon={<RefreshCw className="w-5 h-5 text-blue-500" />}
          title="Win-Back Emails"
          description="Remind customers who haven't visited in 30 days that you miss them."
          enabled={winback}
          onChange={setWinback}
        />
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          How these work
        </p>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
          <li>• Recovery emails fire automatically when a thumbs-down review is submitted</li>
          <li>• Win-back emails run daily — one email per customer per 30 days</li>
          <li>• Emails are sent under your restaurant name via CraveSync</li>
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4" /> Saved successfully
          </span>
        )}
        {error && <span className="text-red-500 text-sm font-semibold">{error}</span>}
      </div>
    </div>
  );
}

function CampaignRow({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 p-5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="shrink-0 flex items-center gap-2 text-sm font-semibold transition-colors"
        aria-label={enabled ? `Disable ${title}` : `Enable ${title}`}
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
  );
}
