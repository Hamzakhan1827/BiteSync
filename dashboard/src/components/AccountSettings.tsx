"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

export function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const saveEmail = async () => {
    if (!email.trim() || email === currentEmail) return;
    setEmailError(null);
    setEmailSaving(true);
    setEmailSaved(false);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setEmailSaving(false);
    if (error) { setEmailError(error.message); return; }
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 4000);
  };

  const savePassword = async () => {
    if (!currentPw || !newPw) { setPwError("Both fields are required."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    setPwError(null);
    setPwSaving(true);
    setPwSaved(false);

    // Re-authenticate first with current password
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPw,
    });
    if (signInErr) { setPwError("Current password is incorrect."); setPwSaving(false); return; }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setCurrentPw("");
    setNewPw("");
    setTimeout(() => setPwSaved(false), 4000);
  };

  return (
    <div className="space-y-6">

      {/* Email */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email Address
        </h3>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailSaved(false); }}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        />
        {emailSaved && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Confirmation links sent to both emails — both must be confirmed to complete the change.
          </p>
        )}
        {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
        <button
          onClick={saveEmail}
          disabled={emailSaving || email === currentEmail || !email.trim()}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {emailSaving ? "Saving…" : "Update Email"}
        </button>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h3>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              placeholder="Current password"
              value={currentPw}
              onChange={e => { setCurrentPw(e.target.value); setPwSaved(false); setPwError(null); }}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              placeholder="New password (min 8 characters)"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwSaved(false); setPwError(null); }}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {pwSaved && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Password updated successfully.
          </p>
        )}
        {pwError && <p className="text-sm text-red-500 font-semibold">{pwError}</p>}

        <button
          onClick={savePassword}
          disabled={pwSaving || !currentPw || !newPw}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {pwSaving ? "Saving…" : "Update Password"}
        </button>
      </div>

    </div>
  );
}
