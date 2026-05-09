"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { MessageSquare, ThumbsUp, ThumbsDown, Search, ChevronDown, ChevronUp, X, Maximize2 } from "lucide-react";

type Review = {
  id: string;
  rating_thumbs: boolean | null;
  public_note: string | null;
  photo_url: string | null;
  created_at: string;
  menu_items: {
    name: string;
    menu_categories: { restaurant_id: string } | null;
  } | null;
  users: {
    email: string | null;
    phone_number: string | null;
    full_name: string | null;
  } | null;
};

export function FeedbackManager({ reviews }: { reviews: Review[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Group reviews by menu item name
  const groupedReviews = useMemo(() => {
    const groups: Record<string, Review[]> = {};
    
    reviews.forEach((review) => {
      const itemName = review.menu_items?.name || "Unknown Item";
      if (!groups[itemName]) {
        groups[itemName] = [];
      }
      groups[itemName].push(review);
    });

    return groups;
  }, [reviews]);

  // Filter groups by search query
  const filteredItems = useMemo(() => {
    return Object.keys(groupedReviews)
      .filter((itemName) => itemName.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
  }, [groupedReviews, searchQuery]);

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search for a menu item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 dark:text-slate-100 transition-shadow"
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center text-slate-500 py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p>No menu items match your search.</p>
          </div>
        ) : (
          filteredItems.map((itemName) => {
            const itemReviews = groupedReviews[itemName];
            const isExpanded = expandedItems.has(itemName);
            
            // Calculate quick stats
            const positiveCount = itemReviews.filter(r => r.rating_thumbs === true).length;
            const negativeCount = itemReviews.filter(r => r.rating_thumbs === false).length;

            return (
              <div 
                key={itemName} 
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${isExpanded ? 'border-indigo-200 dark:border-indigo-800 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'} overflow-hidden transition-all duration-200`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(itemName)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {itemName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-full">
                        {itemReviews.length} Review{itemReviews.length !== 1 ? 's' : ''}
                      </span>
                      {positiveCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full">
                          <ThumbsUp className="w-3 h-3" /> {positiveCount}
                        </span>
                      )}
                      {negativeCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                          <ThumbsDown className="w-3 h-3" /> {negativeCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Accordion Content (Reviews) */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 fade-in duration-200 space-y-4">
                    {itemReviews.map((review) => (
                      <div key={review.id} className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex gap-4">
                        <div className="shrink-0 mt-1">
                          {review.rating_thumbs ? (
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-full">
                              <ThumbsUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          ) : review.rating_thumbs === false ? (
                            <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-full">
                              <ThumbsDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                          ) : (
                            <div className="bg-slate-200 dark:bg-slate-700 p-2.5 rounded-full">
                              <MessageSquare className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                {review.users?.full_name || 'Anonymous Diner'}
                              </span>
                              {(review.users?.email || review.users?.phone_number) && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {review.users?.email && `✉️ ${review.users.email} `}
                                  {review.users?.phone_number && `📞 ${review.users.phone_number}`}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap ml-4">
                              {new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' • '}
                              {new Date(review.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          
                          {review.public_note ? (
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-3 shadow-sm">
                              "{review.public_note}"
                            </p>
                          ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic text-sm mt-3">No public note left by diner.</p>
                          )}
                          
                          {/* Photo Thumbnail */}
                          {review.photo_url && (
                            <div className="mt-3 relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer" onClick={() => setSelectedImage(review.photo_url!)}>
                              <Image 
                                src={review.photo_url} 
                                alt="Diner review photo" 
                                fill 
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 96px, 128px"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 drop-shadow-md" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cinematic Glassmorphic Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-6 right-6 z-50">
            <button 
              onClick={() => setSelectedImage(null)}
              className="p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div 
            className="relative w-full max-w-4xl max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          >
            {/* Aspect ratio container for the high-res image */}
            <div className="relative w-full h-[80vh]">
              <Image 
                src={selectedImage} 
                alt="High resolution diner photo" 
                fill 
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority // Load instantly when modal opens
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
