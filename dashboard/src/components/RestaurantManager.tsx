"use client";

import { useState, useMemo } from "react";
import { Search, Plus, MapPin, Store, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { createRestaurant, updateRestaurant, deleteRestaurant, uploadRestaurantLogo } from "@/app/menu/actions";
import { ConfirmModal } from "./ConfirmModal";

type Restaurant = {
  id: string;
  name: string;
  logo_url: string;
  address: string;
  cuisine_type?: string;
};

export function RestaurantManager({ initialRestaurants }: { initialRestaurants: Restaurant[] }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState<Partial<Restaurant>>({ name: "", address: "", cuisine_type: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete states
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [restaurants, searchQuery]);

  const openEditor = (restaurant?: Restaurant) => {
    if (restaurant) {
      setNewRestaurant(restaurant);
      setImagePreview(restaurant.logo_url || null);
    } else {
      setNewRestaurant({ name: "", address: "", cuisine_type: "" });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsAdding(true);
  };

  const closeEditor = () => {
    setIsAdding(false);
    setNewRestaurant({});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const saveRestaurant = async () => {
    if (!newRestaurant?.name || !newRestaurant?.address) {
      alert("Name and Location are required!");
      return;
    }
    setIsSaving(true);

    let logoUrl = newRestaurant.logo_url;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResult = await uploadRestaurantLogo(formData);
        if (uploadResult.error) throw new Error(uploadResult.error);
        logoUrl = uploadResult.url;
      }

      const rData = {
        name: newRestaurant.name,
        address: newRestaurant.address,
        logo_url: logoUrl,
        cuisine_type: newRestaurant.cuisine_type
      };

      if (newRestaurant.id) {
        const result = await updateRestaurant({ id: newRestaurant.id, ...rData });
        if (result.error) throw new Error(result.error);
        setRestaurants(restaurants.map(r => r.id === result.data!.id ? result.data! : r));
      } else {
        const result = await createRestaurant(rData);
        if (result.error) throw new Error(result.error);
        setRestaurants([...restaurants, result.data!]);
      }

      closeEditor();
    } catch (err: any) {
      console.error(err);
      alert("Error saving restaurant: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurantToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteRestaurant(restaurantToDelete);
      if (result.error) throw new Error(result.error);
      setRestaurants(restaurants.filter(r => r.id !== restaurantToDelete));
      setRestaurantToDelete(null);
    } catch (err) {
      alert("Error deleting restaurant. Ensure there are no foreign key dependencies.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search 50+ restaurants by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          />
        </div>
        <button 
          onClick={() => openEditor()}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Add Restaurant
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform Restaurants ({filteredRestaurants.length})</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRestaurants.map((rest, index) => (
            <div key={rest.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-6 flex-1">
                <span className="text-2xl font-black text-slate-200 dark:text-slate-700 w-8 text-center">{index + 1}</span>
                {rest.logo_url ? (
                  <img src={rest.logo_url} alt={rest.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Store className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {rest.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4" /> {rest.address || "Location not set"}
                    </span>
                    {rest.cuisine_type && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {rest.cuisine_type.split(',')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-14 md:ml-0 border-t border-slate-100 dark:border-slate-800 md:border-0 pt-4 md:pt-0 mt-4 md:mt-0">
                <Link href={`/menu/${rest.id}`} className="flex-1 md:flex-none text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-5 py-2.5 rounded-lg font-bold transition-colors">
                  Manage Menu
                </Link>
                <button onClick={() => openEditor(rest)} className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                <button onClick={() => setRestaurantToDelete(rest.id)} className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
          {filteredRestaurants.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No restaurants found matching your search.
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-2xl flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">{newRestaurant.id ? 'Edit Restaurant' : 'New Restaurant'}</h2>
              <button onClick={closeEditor} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Restaurant Logo</label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 overflow-hidden relative transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500 font-medium">Click to upload logo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Restaurant Name</label>
                <input type="text" value={newRestaurant.name || ""} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent" placeholder="e.g. Kolachi" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location / Address</label>
                <input type="text" value={newRestaurant.address || ""} onChange={e => setNewRestaurant({...newRestaurant, address: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent" placeholder="e.g. Do Darya, Karachi" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cuisine Type (Optional)</label>
                <input type="text" value={newRestaurant.cuisine_type || ""} onChange={e => setNewRestaurant({...newRestaurant, cuisine_type: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent" placeholder="e.g. Desi, BBQ" />
              </div>

            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end">
              <button disabled={isSaving} onClick={closeEditor} className="px-5 py-2.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button disabled={isSaving} onClick={saveRestaurant} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg transition-colors">
                {isSaving ? "Saving..." : (newRestaurant.id ? "Confirm" : "Create Restaurant")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!restaurantToDelete}
        title="Delete Restaurant"
        message="Are you sure you want to permanently delete this restaurant? This will delete all associated menus and reviews. This action cannot be undone."
        onConfirm={handleDeleteRestaurant}
        onCancel={() => setRestaurantToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
