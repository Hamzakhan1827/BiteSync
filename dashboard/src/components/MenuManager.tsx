"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, X, ChevronDown, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ConfirmModal } from "./ConfirmModal";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category_id: string;
  menu_categories?: { name: string };
};

type Category = {
  id: string;
  name: string;
};

export function MenuManager({ initialItems, categories: initialCategories, restaurantId, restaurantName }: { initialItems: MenuItem[], categories: Category[], restaurantId: string, restaurantName?: string }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category State
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  const openEditor = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setImagePreview(item.image_url || null);
    } else {
      setEditingItem({ name: "", price: 0, description: "", category_id: categoriesList[0]?.id || "" });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsEditing(true);
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setNewCategoryName("");
    }
    setIsCategoryModalOpen(true);
    setIsCategoryDropdownOpen(false);
  };

  const saveCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      if (editingCategory) {
        // Edit existing
        const { error } = await supabase.from('menu_categories').update({ name: newCategoryName.trim() }).eq('id', editingCategory.id);
        if (error) throw error;
        setCategoriesList(categoriesList.map(c => c.id === editingCategory.id ? { ...c, name: newCategoryName.trim() } : c));
        // Update items visually if needed
        setItems(items.map(i => i.category_id === editingCategory.id ? { ...i, menu_categories: { name: newCategoryName.trim() } } : i));
      } else {
        // Create new
        const { data, error } = await supabase.from('menu_categories').insert([{ name: newCategoryName.trim(), restaurant_id: restaurantId }]).select().single();
        if (error) throw error;
        setCategoriesList([...categoriesList, data]);
        setEditingItem({ ...editingItem, category_id: data.id });
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setCategoryError("Error: " + (err.message || err.toString()));
      setTimeout(() => setCategoryError(null), 4000);
    }
  };

  const deleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this category? Items in this category might become hidden.")) return;
    try {
      const { error } = await supabase.from('menu_categories').delete().eq('id', id);
      if (error) throw error;
      setCategoriesList(categoriesList.filter(c => c.id !== id));
      if (editingItem?.category_id === id) setEditingItem({ ...editingItem, category_id: "" });
    } catch (err) {
      alert("Error deleting category.");
    }
  };

  const closeEditor = () => {
    setIsEditing(false);
    setEditingItem(null);
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

  const saveItem = async () => {
    if (!editingItem?.name || !editingItem?.price || !editingItem?.category_id) {
      setFormError("Please fill out the Name, Price, and Category.");
      setTimeout(() => setFormError(null), 3000);
      return;
    }
    setFormError(null);
    setIsSaving(true);

    let imageUrl = editingItem.image_url;

    try {
      // 1. Upload Image if new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${restaurantId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('review-photos')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;
      }

      const itemData = {
        name: editingItem.name,
        price: Number(editingItem.price),
        description: editingItem.description,
        category_id: editingItem.category_id,
        image_url: imageUrl
      };

      if (editingItem.id) {
        // Update
        const { data, error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id)
          .select('*, menu_categories(name)')
          .single();
        
        if (error) throw error;
        setItems(items.map(i => i.id === data.id ? data : i));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('menu_items')
          .insert([itemData])
          .select('*, menu_categories(name)')
          .single();
        
        if (error) throw error;
        setItems([...items, data]);
      }

      closeEditor();
    } catch (err: any) {
      console.error(err);
      alert("Error saving item: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemToDelete);
      if (error) throw error;
      setItems(items.filter(i => i.id !== itemToDelete));
      setItemToDelete(null);
    } catch (err) {
      alert("Error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  return <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{restaurantName ? `${restaurantName} Menu` : "Menu Catalog"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your dishes, prices, and high-quality images.</p>
          </div>
        <button 
          onClick={() => openEditor()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {items.map(item => (
          <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</h3>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">PKR {item.price}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{item.menu_categories?.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 h-10">{item.description || "No description provided."}</p>
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button onClick={() => openEditor(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setItemToDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">{editingItem?.id ? 'Edit Item' : 'New Menu Item'}</h2>
              <button onClick={closeEditor} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              {/* Image Upload Box */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Item Photo</label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 overflow-hidden relative transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500 font-medium">Click to upload image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input type="text" value={editingItem?.name || ""} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent" placeholder="e.g. Classic Zinger Burger" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Price (PKR)</label>
                  <input type="number" value={editingItem?.price || ""} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  
                  <div className="relative" ref={dropdownRef}>
                    {/* Custom Dropdown Trigger */}
                  <div 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 cursor-pointer flex justify-between items-center"
                  >
                    <span className={editingItem?.category_id ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}>
                      {categoriesList.find(c => c.id === editingItem?.category_id)?.name || "Select category"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Custom Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-44 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {categoriesList.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => { setEditingItem({...editingItem, category_id: c.id}); setIsCategoryDropdownOpen(false); }}
                          className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
                        >
                          <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{c.name}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingItem?.category_id === c.id && <Check className="w-4 h-4 text-emerald-500 mr-1" />}
                            <button onClick={(e) => { e.stopPropagation(); openCategoryModal(c); }} className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            {editingItem?.category_id !== c.id && (
                              <button onClick={(e) => deleteCategory(e, c.id)} className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={() => openCategoryModal()}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-t border-slate-100 dark:border-slate-700/50 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Create Category
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={editingItem?.description || ""} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent h-24 resize-none" placeholder="Delicious crispy chicken..." />
              </div>

            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex flex-col gap-3">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800/50 text-center animate-in slide-in-from-bottom-2 fade-in duration-200">
                  {formError}
                </div>
              )}
              <button disabled={isSaving} onClick={saveItem} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors">
                {isSaving ? "Saving..." : "Save Menu Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-transparent" 
                  placeholder="e.g. Signature Burgers" 
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              {categoryError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800/50 text-center animate-in slide-in-from-bottom-2 fade-in duration-200">
                  {categoryError}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button onClick={saveCategory} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Menu Item"
        message="Are you sure you want to permanently delete this menu item? This action cannot be undone."
        onConfirm={deleteItem}
        onCancel={() => setItemToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
}
