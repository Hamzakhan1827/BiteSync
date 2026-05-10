"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Save, CheckCircle, Clock, MapPin, Utensils, Store } from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  cuisine_type: string | null;
  opening_hours: string | null;
  logo_url: string | null;
};

export function RestaurantProfileEditor({ restaurant }: { restaurant: Restaurant }) {
  const [form, setForm] = useState({
    name: restaurant.name || "",
    address: restaurant.address || "",
    cuisine_type: restaurant.cuisine_type || "",
    opening_hours: restaurant.opening_hours || "",
    logo_url: restaurant.logo_url || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(restaurant.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) { setError("Restaurant name is required."); return; }
    setError(null);
    setIsSaving(true);
    setSaved(false);
    try {
      let logoUrl = form.logo_url;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const filePath = `logos/${restaurant.id}.${ext}`;
        const { error: upErr } = await supabase.storage.from('review-photos').upload(filePath, imageFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(filePath);
        logoUrl = urlData.publicUrl;
      }

      const { error: saveErr } = await supabase
        .from('restaurants')
        .update({
          name: form.name.trim(),
          address: form.address.trim() || null,
          cuisine_type: form.cuisine_type.trim() || null,
          opening_hours: form.opening_hours.trim() || null,
          logo_url: logoUrl || null,
        })
        .eq('id', restaurant.id);

      if (saveErr) throw saveErr;
      setForm(f => ({ ...f, logo_url: logoUrl || "" }));
      setImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Logo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Store className="w-4 h-4" /> Restaurant Logo
        </h3>
        <div className="flex items-center gap-6">
          <label className="relative cursor-pointer shrink-0">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:border-emerald-400 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click the box to upload a logo</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB. Shown on the mobile app.</p>
            {imageFile && <p className="text-xs text-emerald-500 font-semibold mt-2">New image selected — save to apply.</p>}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Utensils className="w-4 h-4" /> Basic Information
        </h3>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Restaurant Name <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setSaved(false); }}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            placeholder="e.g. Kolachi Restaurant"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setSaved(false); }}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            placeholder="e.g. Do Darya, Phase 8, DHA Karachi"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cuisine Type</label>
          <input
            type="text"
            value={form.cuisine_type}
            onChange={e => { setForm(f => ({ ...f, cuisine_type: e.target.value })); setSaved(false); }}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            placeholder="e.g. BBQ, Seafood, Karahi"
          />
          <p className="text-xs text-slate-400 mt-1.5">Separate multiple cuisines with commas. Shown as tags on the app.</p>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Opening Hours
        </h3>
        <input
          type="text"
          value={form.opening_hours}
          onChange={e => { setForm(f => ({ ...f, opening_hours: e.target.value })); setSaved(false); }}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          placeholder="e.g. 12:00 PM - 12:00 AM"
        />
        <p className="text-xs text-slate-400 mt-1.5">The app uses this to show "Open Now" or "Closed" to diners.</p>
      </div>

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
