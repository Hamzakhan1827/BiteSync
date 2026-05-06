import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, Alert, ActivityIndicator, Image, Animated, KeyboardAvoidingView, Platform, StatusBar, RefreshControl
} from 'react-native';
import { supabase } from './lib/supabase';
import { ChevronRight, X, ThumbsUp, ThumbsDown, Send, Book, Store, ArrowLeft, Clock, Search, Eye, EyeOff, Home, Compass, PlusCircle, User, Menu } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';

// Placeholder HD food image (until restaurants upload real photos)
const FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80';
const getFoodImage = (_name: string) => FOOD_PLACEHOLDER;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'review' | 'profile'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [diarySearchQuery, setDiarySearchQuery] = useState('');
  const [expandedDiaryRest, setExpandedDiaryRest] = useState<string | null>(null);
  const [diaryReviewLimit, setDiaryReviewLimit] = useState(3);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [itemReviews, setItemReviews] = useState<any[]>([]);
  const [reviewOffset, setReviewOffset] = useState(0);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [ratingThumbs, setRatingThumbs] = useState<boolean | null>(null);
  const [privateNote, setPrivateNote] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reviewStats, setReviewStats] = useState<Record<string, { up: number; total: number }>>({});
  const [refreshing, setRefreshing] = useState(false);
  // Profile state
  const [profileUsername, setProfileUsername] = useState('');
  const [profileAvatar, setProfileAvatar] = useState(0);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameLastChanged, setUsernameLastChanged] = useState<Date | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  const CARTOON_AVATARS = [
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Zara',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Kiki',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Chef',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Foodie',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Momo',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Taco',
  ];

  const AVATAR_EMOJIS = ['🧑‍🍳', '🦊', '🐼', '🐨', '🐸', '🦁', '🐻', '🐙'];

  const canEditUsername = () => {
    if (!usernameLastChanged) return true;
    const diffDays = (Date.now() - usernameLastChanged.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 30;
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.timing(sidebarAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, { toValue: -300, duration: 220, useNativeDriver: true }).start(() => setSidebarOpen(false));
  };

  const navigateFromSidebar = (tab: 'home' | 'explore' | 'review' | 'profile') => {
    closeSidebar();
    setTimeout(() => { setCurrentTab(tab); setSelectedRestaurant(null); setDetailItem(null); }, 250);
  };

  const validateUsername = (u: string) => {
    if (u.length < 3) return 'Username must be at least 3 characters';
    if (!/[a-zA-Z]/.test(u)) return 'Username must contain at least one letter';
    if (/^[0-9]+$/.test(u)) return 'Username cannot be only numbers';
    return null;
  };
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every 30 seconds for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date(currentTime);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Animation refs for menu items
  const fadeAnims = useRef<Animated.Value[]>([]);
  const slideAnims = useRef<Animated.Value[]>([]);

  // Load user profile (username + avatar) from Supabase metadata
  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.username) setProfileUsername(user.user_metadata.username);
      if (typeof user?.user_metadata?.avatar_index === 'number') setProfileAvatar(user.user_metadata.avatar_index);
      if (user?.user_metadata?.username_last_changed) {
        setUsernameLastChanged(new Date(user.user_metadata.username_last_changed));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchRestaurants(); fetchDiary(); loadUserProfile(); } else { setLoading(false); }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchRestaurants(); fetchDiary(); loadUserProfile(); }
    });
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error) throw error;
      setRestaurants(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMenu = async (restaurantId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, description, menu_categories!inner (restaurant_id)')
        .eq('menu_categories.restaurant_id', restaurantId);
      if (error) throw error;
      const items = data || [];
      setMenuItems(items);

      // Animate items staggered
      fadeAnims.current = items.map(() => new Animated.Value(0));
      slideAnims.current = items.map(() => new Animated.Value(20));
      items.forEach((_, i) => {
        Animated.parallel([
          Animated.timing(fadeAnims.current[i], { toValue: 1, duration: 400, delay: i * 80, useNativeDriver: true }),
          Animated.timing(slideAnims.current[i], { toValue: 0, duration: 400, delay: i * 80, useNativeDriver: true }),
        ]).start();
      });

      // Fetch review stats for these items
      if (items.length > 0) {
        const ids = items.map((it: any) => it.id);
        const { data: reviews } = await supabase
          .from('reviews')
          .select('menu_item_id, rating_thumbs')
          .in('menu_item_id', ids)
          .not('rating_thumbs', 'is', null);
        const stats: Record<string, { up: number; total: number }> = {};
        (reviews || []).forEach((r: any) => {
          if (!stats[r.menu_item_id]) stats[r.menu_item_id] = { up: 0, total: 0 };
          stats[r.menu_item_id].total++;
          if (r.rating_thumbs) stats[r.menu_item_id].up++;
        });
        setReviewStats(stats);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDiary = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id, created_at, rating_thumbs, private_note, public_note, 
          menu_items (
            name, 
            menu_categories (
              restaurants (name)
            )
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDiaryEntries(data || []);
    } catch (err) { console.error(err); }
  };

  const handleRestaurantSelect = (rest: any) => {
    setSelectedRestaurant(rest);
    fetchMenu(rest.id);
  };

  const handleAuth = async (isSignUp: boolean) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (!email.includes('@') || email.length < 5) throw new Error('Invalid email format');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      
      if (isSignUp) {
        const usernameErr = validateUsername(username);
        if (usernameErr) throw new Error(usernameErr);
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username: username.trim() } }
        });
        if (error) throw error;
        setProfileUsername(username.trim());
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login')) throw new Error('Incorrect email or password');
          throw error;
        }
        // Load username + last changed from metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.username) setProfileUsername(user.user_metadata.username);
        if (user?.user_metadata?.username_last_changed) {
          setUsernameLastChanged(new Date(user.user_metadata.username_last_changed));
        }
      }
    } catch (error: any) { 
      setAuthError(error.message); 
    }
    finally { setAuthLoading(false); }
  };

  const saveUsername = async () => {
    const err = validateUsername(newUsername);
    if (err) { Alert.alert('Invalid Username', err); return; }
    if (!canEditUsername()) {
      Alert.alert('Too Soon', 'You can only change your username once every 30 days.');
      return;
    }
    try {
      const now = new Date();
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername.trim(), username_last_changed: now.toISOString() }
      });
      if (error) throw error;
      setProfileUsername(newUsername.trim());
      setUsernameLastChanged(now);
      setEditingUsername(false);
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const closeModal = () => {
    setSelectedItem(null); setRatingThumbs(null); setPrivateNote(''); setPublicNote('');
  };

  const submitReview = async () => {
    if (!selectedItem || !session?.user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: session.user.id, menu_item_id: selectedItem.id,
        rating_thumbs: ratingThumbs, private_note: privateNote, public_note: publicNote,
      });
      if (error) throw error;
      closeModal();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      fetchDiary();
      if (selectedRestaurant) fetchMenu(selectedRestaurant.id);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setSubmitting(false); }
  };

  const getScoreBadge = (itemId: string) => {
    const stat = reviewStats[itemId];
    if (!stat || stat.total < 3) return null;
    const pct = Math.round((stat.up / stat.total) * 100);
    if (pct < 70) return null;
    return `🔥 ${pct}% loved this`;
  };

  const getScorePercent = (itemId: string) => {
    const stat = reviewStats[itemId];
    if (!stat || stat.total === 0) return null;
    return { pct: Math.round((stat.up / stat.total) * 100), total: stat.total };
  };

  const openDetailPage = async (item: any) => {
    if (currentTab === 'review') {
      setSelectedItem(item);
    } else {
      setDetailItem(item);
      setItemReviews([]);
      setReviewOffset(0);
      setReviewTotal(0);
      fetchItemReviews(item.id, 0, false);
    }
  };

  const fetchItemReviews = async (itemId: string, offset: number, append: boolean) => {
    setLoadingMoreReviews(true);
    try {
      // Get total count first
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('menu_item_id', itemId)
        .neq('public_note', '');
      setReviewTotal(count || 0);

      const { data } = await supabase
        .from('reviews')
        .select('id, rating_thumbs, public_note, created_at, users(full_name)')
        .eq('menu_item_id', itemId)
        .neq('public_note', '')
        .order('created_at', { ascending: false })
        .range(offset, offset + 2); // fetch 3 at a time

      if (append) {
        setItemReviews(prev => [...prev, ...(data || [])]);
      } else {
        setItemReviews(data || []);
      }
      setReviewOffset(offset + 3);
    } catch (err) { console.error(err); }
    finally { setLoadingMoreReviews(false); }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !session) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#00A86B" /></View>;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentTab === 'home') {
      if (selectedRestaurant) {
        await fetchMenu(selectedRestaurant.id);
        if (detailItem) await fetchItemReviews(detailItem.id, 0);
      } else {
        await fetchRestaurants();
      }
    } else {
      await fetchDiary();
    }
    setRefreshing(false);
  };

  // --- AUTH SCREEN ---
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>BiteSync</Text>
          <Text style={styles.authSubtitle}>Your personal food memory, every bite.</Text>
          
          {authError ? <Text style={{ color: '#ef4444', marginBottom: 8, fontSize: 13, fontWeight: '600', marginLeft: 4 }}>{authError}</Text> : null}

          {isSignUp && (
            <TextInput
              style={[styles.textInput, { marginBottom: 12 }]}
              placeholder="Username (e.g. hamza_eats)"
              placeholderTextColor="#888"
              value={username}
              onChangeText={(t) => { setUsername(t); setAuthError(''); }}
              autoCapitalize="none"
            />
          )}
          
          <TextInput style={[styles.textInput, { marginBottom: 12 }]} placeholder="Email address" placeholderTextColor="#888"
            value={email} onChangeText={(t) => {setEmail(t); setAuthError('');}} autoCapitalize="none" keyboardType="email-address" />
            
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 14, borderWidth: 1, borderColor: '#EAEAEA', paddingRight: 16 }}>
            <TextInput style={{ flex: 1, color: '#111', fontSize: 16, padding: 15 }} placeholder="Password"
              placeholderTextColor="#888" value={password} onChangeText={(t) => {setPassword(t); setAuthError('');}} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff color="#888" size={20} /> : <Eye color="#888" size={20} />}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.submitButton, { marginTop: 20 }]} onPress={() => handleAuth(isSignUp)} disabled={authLoading}>
            {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity style={{ marginTop: 24, padding: 10 }} onPress={() => { setIsSignUp(!isSignUp); setAuthError(''); setUsername(''); }} disabled={authLoading}>
            <Text style={{ color: '#666', textAlign: 'center', fontSize: 14 }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: '#00A86B', fontWeight: '700' }}>
                {isSignUp ? 'Sign In' : 'Create an account'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- MAIN APP ---
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {selectedRestaurant && (currentTab === 'explore' || currentTab === 'home') ? (
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
            if (detailItem) { setDetailItem(null); setItemReviews([]); }
            else setSelectedRestaurant(null);
          }}>
            <ArrowLeft color="#111" size={22} style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, { color: '#111', fontSize: 18 }]}>{detailItem ? detailItem.name : selectedRestaurant.name}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={openSidebar}><Menu color="#111" size={24} /></TouchableOpacity>
            <Text style={styles.headerTitle}>BiteSync</Text>
            <TouchableOpacity onPress={() => setCurrentTab('profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00A86B' }}>
              <Text style={{ fontSize: 18 }}>{AVATAR_EMOJIS[profileAvatar]}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A86B" colors={['#00A86B']} progressBackgroundColor="#fff" />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#00A86B" style={{ marginTop: 60 }} />
        ) : currentTab === 'home' ? (
          <>
            <TouchableOpacity style={styles.searchBar} onPress={() => setCurrentTab('explore')}>
              <Search color="#888" size={18} style={{ marginRight: 10 }} />
              <Text style={{ color: '#888', flex: 1, fontSize: 15 }}>Search for 'Spicy Ramen' or 'Italian'</Text>
              <Text style={{ color: '#00A86B', fontWeight: '700', fontSize: 13 }}>Filter</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Trending Near You</Text>
            <Text style={{ color: '#666', fontSize: 14, marginBottom: 16, marginTop: -10 }}>Highly-rated spots everyone is talking about</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 30 }}>
              {restaurants.map((rest, idx) => (
                <TouchableOpacity key={'trend-'+rest.id} style={[styles.restaurantCard, { width: 260, flexDirection: 'column', alignItems: 'flex-start', marginRight: 16, padding: 16 }]} onPress={() => { handleRestaurantSelect(rest); setCurrentTab('explore'); }}>
                  <Image source={{ uri: getFoodImage(rest.name) }} style={{ width: '100%', height: 120, borderRadius: 12, marginBottom: 12 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: '#111', fontSize: 16, fontWeight: '800' }}>{rest.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ color: '#00A86B', fontSize: 12 }}>★</Text>
                      <Text style={{ color: '#444', fontWeight: '700', fontSize: 12 }}>4.8</Text>
                    </View>
                  </View>
                  <Text style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>📍 {rest.address || '0.4 miles away'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}><Text style={{ color: '#00A86B', fontSize: 10, fontWeight: '700' }}>Fusion</Text></View>
                    <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}><Text style={{ color: '#00A86B', fontSize: 10, fontWeight: '700' }}>Craft Cocktails</Text></View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Top Recommended</Text>
            {restaurants.slice().reverse().map((rest, idx) => (
               <TouchableOpacity key={'rec-'+rest.id} style={styles.restaurantCard} onPress={() => { handleRestaurantSelect(rest); setCurrentTab('explore'); }}>
                 <View style={styles.restaurantIcon}><Text style={{ fontSize: 22 }}>🍴</Text></View>
                 <View style={styles.menuInfo}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                     <Text style={styles.menuName}>{rest.name}</Text>
                     {idx === 0 && <View style={{ backgroundColor: '#00A86B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>AD</Text></View>}
                   </View>
                   <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{rest.address || 'Perfect for morning meetings.'}</Text>
                 </View>
                 <ChevronRight color="#555" size={22} />
               </TouchableOpacity>
            ))}
          </>
        ) : (currentTab === 'explore' || currentTab === 'review') ? (
          selectedRestaurant ? (
            /* --- MENU SCREEN --- */
            detailItem ? (
              /* --- ITEM DETAIL PAGE --- */
              <>
                <Image source={{ uri: getFoodImage(detailItem.name) }} style={{ width: '100%', height: 220, borderRadius: 20, marginBottom: 16 }} resizeMode="cover" />
                <Text style={styles.sectionTitle}>{detailItem.name}</Text>
                <Text style={{ color: '#00A86B', fontWeight: '700', fontSize: 16, marginBottom: 16 }}>PKR {detailItem.price}</Text>

                {(() => {
                  const score = getScorePercent(detailItem.id);
                  const isPopular = score && score.total >= 5;
                  return (
                    <View style={{ marginBottom: 20 }}>
                      {isPopular && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', padding: 10, borderRadius: 12, marginBottom: 10, gap: 8 }}>
                          <Text style={{ fontSize: 16 }}>🔥</Text>
                          <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 13 }}>Popular Item</Text>
                        </View>
                      )}
                      {score && score.pct >= 70 ? (
                        <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DCFCE7', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                          <Text style={{ fontSize: 32 }}>🔥</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#00A86B', fontWeight: '900', fontSize: 20 }}>{score.pct}%</Text>
                            <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 13 }}>would order this again</Text>
                            <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Based on {score.total} votes</Text>
                          </View>
                        </View>
                      ) : !score ? (
                        <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DCFCE7', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 28 }}>✨</Text>
                          <View>
                            <Text style={{ color: '#00A86B', fontWeight: '800', fontSize: 15 }}>Be the first to review!</Text>
                            <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Your vote shapes what others order</Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  );
                })()}

                <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  {/* Header */}
                  <View style={{ padding: 14, borderBottomWidth: itemReviews.length > 0 || loadingMoreReviews ? 1 : 0, borderBottomColor: '#EAEAEA' }}>
                    <Text style={{ color: '#00A86B', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>💬 What Diners Are Saying</Text>
                    {reviewTotal > 0 && <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{reviewTotal} public review{reviewTotal > 1 ? 's' : ''}</Text>}
                  </View>
                  {/* Reviews */}
                  {itemReviews.length === 0 && !loadingMoreReviews ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ fontSize: 28, marginBottom: 8 }}>🤫</Text>
                      <Text style={{ color: '#555', fontWeight: '700', fontSize: 14 }}>No public reviews yet</Text>
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Tap below to share your experience</Text>
                    </View>
                  ) : (
                    <View>
                      {itemReviews.map((r: any, idx: number) => (
                        <View key={r.id} style={{ padding: 14, borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: '#EAEAEA' }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ color: '#111', fontWeight: '700' }}>{r.users?.full_name || 'Anonymous Diner'}</Text>
                            {r.rating_thumbs === true ? <ThumbsUp color="#10b981" size={16} /> : r.rating_thumbs === false ? <ThumbsDown color="#ef4444" size={16} /> : null}
                          </View>
                          <Text style={{ color: '#444', fontSize: 14, lineHeight: 20 }}>{r.public_note}</Text>
                          <Text style={{ color: '#888', fontSize: 11, marginTop: 6, fontWeight: '500' }}>{getRelativeTime(r.created_at)}</Text>
                        </View>
                      ))}
                      {itemReviews.length < reviewTotal && (
                        <TouchableOpacity
                          style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#EAEAEA', alignItems: 'center' }}
                          onPress={() => fetchItemReviews(detailItem.id, reviewOffset, true)}
                          disabled={loadingMoreReviews}
                        >
                          {loadingMoreReviews
                            ? <ActivityIndicator color="#00A86B" />
                            : <Text style={{ color: '#00A86B', fontWeight: '700' }}>Load More ({reviewTotal - itemReviews.length} remaining)</Text>
                          }
                        </TouchableOpacity>
                      )}
                      {itemReviews.length > 3 && (
                        <TouchableOpacity
                          style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#EAEAEA', alignItems: 'center' }}
                          onPress={() => { setItemReviews(itemReviews.slice(0, 3)); setReviewOffset(3); }}
                        >
                          <Text style={{ color: '#888', fontWeight: '600' }}>− See Less</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

              </>
            ) : (
              /* --- MENU LIST --- */
              <>
                <Text style={styles.sectionTitle}>{currentTab === 'review' ? 'Select an item to review' : 'What are you having?'}</Text>
                {menuItems.map((item, i) => {
                  const score = getScoreBadge(item.id);
                  const fadeAnim = fadeAnims.current[i] || new Animated.Value(1);
                  const slideAnim = slideAnims.current[i] || new Animated.Value(0);
                  return (
                    <Animated.View key={item.id} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                      <TouchableOpacity style={styles.menuCard} onPress={() => openDetailPage(item)}>
                        <Image source={{ uri: getFoodImage(item.name) }} style={styles.menuImage} resizeMode="cover" />
                        <View style={styles.menuInfo}>
                          <Text style={styles.menuName}>{item.name}</Text>
                          <Text style={styles.menuPrice}>PKR {item.price}</Text>
                          {score && <Text style={styles.scoreBadge}>{score}</Text>}
                          {reviewStats[item.id]?.total >= 5 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: '800' }}>🔥 Popular</Text>
                              </View>
                            </View>
                          )}
                        </View>
                        <ChevronRight color="#555" size={22} />
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </>
            )
          ) : (
            /* --- RESTAURANT LIST SCREEN --- */
            <>
              {/* SEARCH BAR */}
              <View style={styles.searchBar}>
                <Search color="#888" size={18} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Craving something? Search here... 🤤"
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X color="#888" size={16} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.sectionTitle}>{currentTab === 'review' ? 'Where are you eating to review?' : 'Where are you eating?'}</Text>
              {filteredRestaurants.length === 0 ? (
                <Text style={styles.emptyText}>No restaurants match "{searchQuery}"</Text>
              ) : (
                filteredRestaurants.map((rest) => (
                  <TouchableOpacity key={rest.id} style={styles.restaurantCard} onPress={() => handleRestaurantSelect(rest)}>
                    <View style={styles.restaurantIcon}>
                      <Text style={{ fontSize: 22 }}>🍴</Text>
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{rest.name}</Text>
                      <Text style={styles.menuPrice}>{rest.address || 'Karachi'}</Text>
                    </View>
                    <ChevronRight color="#555" size={22} />
                  </TouchableOpacity>
                ))
              )}
            </>
          )
        ) : currentTab === 'profile' ? (
          /* --- PROFILE & DIARY SCREEN --- */
          <>
            {/* AVATAR SECTION */}
            <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
              <TouchableOpacity onPress={() => setShowAvatarPicker(!showAvatarPicker)} style={{ position: 'relative' }}>
                <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#00A86B', marginBottom: 6 }}>
                  <Text style={{ fontSize: 44 }}>{AVATAR_EMOJIS[profileAvatar]}</Text>
                </View>
                <View style={{ position: 'absolute', bottom: 8, right: 0, backgroundColor: '#00A86B', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>✏️</Text>
                </View>
              </TouchableOpacity>

              {/* AVATAR PICKER */}
              {showAvatarPicker && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 12, backgroundColor: '#fff', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#EAEAEA', width: '100%' }}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#666', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Choose your avatar</Text>
                  {AVATAR_EMOJIS.map((emoji, idx) => (
                    <TouchableOpacity key={idx} onPress={async () => {
                      setProfileAvatar(idx);
                      setShowAvatarPicker(false);
                      // Save to Supabase so it persists
                      await supabase.auth.updateUser({ data: { avatar_index: idx } });
                    }}
                      style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: profileAvatar === idx ? '#F0FDF4' : '#F8F9FA', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: profileAvatar === idx ? '#00A86B' : '#EAEAEA' }}>
                      <Text style={{ fontSize: 28 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* USERNAME DISPLAY & EDIT */}
              {!editingUsername ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <Text style={{ color: '#111', fontSize: 20, fontWeight: '900' }}>{profileUsername || 'Set a username'}</Text>
                  <TouchableOpacity onPress={() => {
                    if (!canEditUsername()) {
                      Alert.alert('Too Soon', 'You can only change your username once every 30 days.');
                      return;
                    }
                    setNewUsername(profileUsername);
                    setEditingUsername(true);
                  }}>
                    <Text style={{ fontSize: 14 }}>✏️</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, width: '80%' }}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, padding: 10, fontSize: 15 }]}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    autoFocus
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={saveUsername} style={{ backgroundColor: '#00A86B', padding: 10, borderRadius: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingUsername(false)}>
                    <X color="#888" size={20} />
                  </TouchableOpacity>
                </View>
              )}

              <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{diaryEntries.length} bites tracked 🍽️</Text>
              {usernameLastChanged && (
                <Text style={{ color: '#bbb', fontSize: 11, marginTop: 2 }}>Username last changed: {usernameLastChanged.toLocaleDateString()}</Text>
              )}


            </View>

            <Text style={styles.sectionTitle}>My Private Diary 📔</Text>
            {/* DIARY SEARCH BAR */}
            {diaryEntries.length > 0 && (
              <View style={styles.searchBar}>
                <Search color="#888" size={20} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search your history..."
                  placeholderTextColor="#666"
                  value={diarySearchQuery}
                  onChangeText={setDiarySearchQuery}
                />
                {diarySearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setDiarySearchQuery('')}>
                    <X color="#888" size={16} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {diaryEntries.length === 0 ? (
              <Text style={styles.emptyText}>Your diary is empty. Rate your first bite! 🍽️</Text>
            ) : (
              (() => {
                const grouped = diaryEntries.reduce((groups: any, entry: any) => {
                  const restName = entry.menu_items?.menu_categories?.restaurants?.name || 'Unknown Restaurant';
                  if (!groups[restName]) groups[restName] = [];
                  groups[restName].push(entry);
                  return groups;
                }, {});

                const filteredRestNames = Object.keys(grouped).filter(name => 
                  name.toLowerCase().includes(diarySearchQuery.toLowerCase())
                );

                if (filteredRestNames.length === 0) {
                  return <Text style={styles.emptyText}>No diary entries match "{diarySearchQuery}"</Text>;
                }

                return filteredRestNames.map((restName: string) => {
                  const entries = grouped[restName];
                  const isExpanded = expandedDiaryRest === restName;
                  const limit = isExpanded ? diaryReviewLimit : 0;
                  const visibleEntries = isExpanded ? entries.slice(0, limit) : [];

                  return (
                    <View key={restName} style={{ marginBottom: 14 }}>
                      <TouchableOpacity 
                        style={[styles.restaurantCard, { marginBottom: isExpanded ? 14 : 0 }]}
                        onPress={() => {
                          if (expandedDiaryRest === restName) {
                            setExpandedDiaryRest(null);
                          } else {
                            setExpandedDiaryRest(restName);
                            setDiaryReviewLimit(3);
                          }
                        }}
                      >
                        <View style={styles.restaurantIcon}>
                          <Text style={{ fontSize: 22 }}>🍴</Text>
                        </View>
                        <View style={styles.menuInfo}>
                          <Text style={styles.menuName}>{restName}</Text>
                          <Text style={styles.menuPrice}>{entries.length} review{entries.length !== 1 ? 's' : ''}</Text>
                        </View>
                        <ChevronRight color="#555" size={22} style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} />
                      </TouchableOpacity>

                      {isExpanded && visibleEntries.map((entry: any) => (
                        <View key={entry.id} style={[styles.diaryCard, { marginLeft: 16, borderLeftColor: '#00A86B', borderLeftWidth: 2 }]}>
                          <View style={styles.diaryHeader}>
                            <Text style={styles.diaryItemName}>{entry.menu_items?.name || 'Unknown Item'}</Text>
                            {entry.rating_thumbs === true ? <ThumbsUp color="#10b981" size={18} /> :
                              entry.rating_thumbs === false ? <ThumbsDown color="#ef4444" size={18} /> : null}
                          </View>
                          <View style={styles.diaryDate}>
                            <Clock color="#666" size={13} style={{ marginRight: 4 }} />
                            <Text style={styles.diaryDateText}>{getRelativeTime(entry.created_at)}</Text>
                          </View>
                          {entry.private_note ? (
                            <View style={styles.privateNoteContainer}>
                              <Text style={styles.noteLabel}>🔒 Private Note</Text>
                              <Text style={styles.privateNoteText}>{entry.private_note}</Text>
                            </View>
                          ) : null}
                          {entry.public_note ? (
                            <View style={styles.publicNoteContainer}>
                              <Text style={styles.noteLabel}>💬 Chef Message</Text>
                              <Text style={styles.publicNoteText}>{entry.public_note}</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}

                      {isExpanded && entries.length > 3 && (
                        <View style={{ marginLeft: 16, flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 12 }}>
                          {limit < entries.length && (
                            <TouchableOpacity style={{ padding: 10 }} onPress={() => setDiaryReviewLimit(limit + 3)}>
                              <Text style={{ color: '#00A86B', fontWeight: '600' }}>Load More</Text>
                            </TouchableOpacity>
                          )}
                          {limit > 3 && (
                            <TouchableOpacity style={{ padding: 10 }} onPress={() => setDiaryReviewLimit(3)}>
                              <Text style={{ color: '#666', fontWeight: '600' }}>See Less</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  );
                });
              })()
            )}
          </>
        ) : null}
      </ScrollView>

      {/* STICKY RATE BUTTON — absolutely positioned above bottom nav */}
      {detailItem && !selectedItem && (
        <View style={{ position: 'absolute', bottom: 90, left: 20, right: 20, zIndex: 99 }}>
          <TouchableOpacity style={styles.submitButton} onPress={() => setSelectedItem(detailItem)}>
            <Text style={styles.submitButtonText}>Would you order this again? 🍽️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SUCCESS TOAST */}
      {showSuccess && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 999, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 36, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', width: '75%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
            <Text style={{ fontSize: 56, marginBottom: 14 }}>🎉</Text>
            <Text style={{ color: '#111', fontWeight: '900', fontSize: 22, marginBottom: 6 }}>Saved!</Text>
            <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>Your bite is in the diary.{'\n'}Chef has been notified.</Text>
          </View>
        </View>
      )}

      {/* BOTTOM NAV — hidden when modal is open */}
      {!selectedItem && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('home'); setSelectedRestaurant(null); setDetailItem(null); }}>
            <Home color={currentTab === 'home' ? '#00A86B' : '#888'} size={24} />
            <Text style={[styles.navText, currentTab === 'home' && styles.navTextActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('explore'); setSelectedRestaurant(null); setDetailItem(null); }}>
            <Compass color={currentTab === 'explore' ? '#00A86B' : '#888'} size={24} />
            <Text style={[styles.navText, currentTab === 'explore' && styles.navTextActive]}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('review'); setSelectedRestaurant(null); setDetailItem(null); }}>
            <PlusCircle color={currentTab === 'review' ? '#00A86B' : '#888'} size={24} />
            <Text style={[styles.navText, currentTab === 'review' && styles.navTextActive]}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('profile')}>
            <User color={currentTab === 'profile' ? '#00A86B' : '#888'} size={24} />
            <Text style={[styles.navText, currentTab === 'profile' && styles.navTextActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REVIEW MODAL */}
      {selectedItem && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Would you order this again?</Text>
              <TouchableOpacity onPress={closeModal}><X color="#fff" size={24} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Image source={{ uri: getFoodImage(selectedItem.name) }} style={styles.modalImage} resizeMode="cover" />
              <Text style={styles.modalItemName}>{selectedItem.name}</Text>

              <View style={styles.thumbsContainer}>
                <TouchableOpacity style={[styles.thumbButton, ratingThumbs === true && styles.thumbActive]} onPress={() => setRatingThumbs(true)}>
                  <ThumbsUp color={ratingThumbs === true ? '#00A86B' : '#888'} size={30} />
                  <Text style={[styles.thumbLabel, ratingThumbs === true && { color: '#00A86B' }]}>Yes, definitely!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.thumbButton, ratingThumbs === false && { borderColor: '#DC2626', backgroundColor: '#FEF2F2' }]} onPress={() => setRatingThumbs(false)}>
                  <ThumbsDown color={ratingThumbs === false ? '#DC2626' : '#888'} size={30} />
                  <Text style={[styles.thumbLabel, ratingThumbs === false && { color: '#DC2626' }]}>Not this time</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MESSAGE TO CHEF (OPTIONAL)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. The chef absolutely nailed the spices today!"
                  placeholderTextColor="#666"
                  value={publicNote}
                  onChangeText={setPublicNote}
                  multiline
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRIVATE FOOD DIARY NOTE 🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. A note to my future self: order this again!"
                  placeholderTextColor="#666"
                  value={privateNote}
                  onChangeText={setPrivateNote}
                  multiline
                />
              </View>

              <TouchableOpacity style={[styles.submitButton, { marginBottom: 8 }]} onPress={submitReview} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.submitButtonText}>{publicNote ? 'Send to Chef & Diary' : 'Save to Private Diary'}</Text>
                    <Send color="#fff" size={18} />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* WELCOME TOAST */}
      {showWelcome && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 999, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 36, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', width: '75%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
            <Text style={{ fontSize: 56, marginBottom: 14 }}>🥳</Text>
            <Text style={{ color: '#111', fontWeight: '900', fontSize: 22, marginBottom: 6 }}>Welcome!</Text>
            <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>Your account is created.{'\n'}Let's start reviewing.</Text>
          </View>
        </View>
      )}

      {/* SIDEBAR DRAWER */}
      {sidebarOpen && (
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 200 }}
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <Animated.View
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, backgroundColor: '#fff', zIndex: 201, transform: [{ translateX: sidebarAnim }], shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20 }}
          >
            {/* Sidebar Header */}
            <View style={{ backgroundColor: '#00A86B', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 44 }}>{AVATAR_EMOJIS[profileAvatar]}</Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 10 }}>{profileUsername || 'BiteSync User'}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>{diaryEntries.length} bites tracked 🍽️</Text>
            </View>

            {/* Nav Items */}
            <View style={{ padding: 16, flex: 1 }}>
              {[
                { label: 'Home', emoji: '🏠', tab: 'home' as const },
                { label: 'Explore', emoji: '🔍', tab: 'explore' as const },
                { label: 'Review', emoji: '✍️', tab: 'review' as const },
                { label: 'My Profile', emoji: '👤', tab: 'profile' as const },
              ].map(({ label, emoji, tab }) => (
                <TouchableOpacity key={tab} onPress={() => navigateFromSidebar(tab)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: currentTab === tab ? '#F0FDF4' : 'transparent', marginBottom: 4 }}>
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  <Text style={{ fontSize: 16, fontWeight: currentTab === tab ? '800' : '600', color: currentTab === tab ? '#00A86B' : '#333' }}>{label}</Text>
                </TouchableOpacity>
              ))}

              <View style={{ height: 1, backgroundColor: '#EAEAEA', marginVertical: 16 }} />

              <TouchableOpacity onPress={closeSidebar}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14 }}>
                <Text style={{ fontSize: 20 }}>ℹ️</Text>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>About Us</Text>
                  <Text style={{ fontSize: 11, color: '#888', marginTop: 1 }}>Built to capture every bite</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={closeSidebar}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14 }}>
                <Text style={{ fontSize: 20 }}>💬</Text>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Contact Support</Text>
                  <Text style={{ fontSize: 11, color: '#888', marginTop: 1 }}>support@bitesync.app</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <TouchableOpacity
              onPress={() => { closeSidebar(); setTimeout(() => { supabase.auth.signOut(); setEmail(''); setPassword(''); setAuthError(''); setProfileUsername(''); }, 300); }}
              style={{ margin: 16, padding: 14, backgroundColor: '#FEF2F2', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FECACA' }}>
              <Text style={{ fontSize: 18 }}>🚪</Text>
              <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  loadingContainer: { flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },

  // Auth
  authContainer: { flex: 1, justifyContent: 'center', padding: 28 },
  authTitle: { color: '#111', fontSize: 42, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: -1 },
  authSubtitle: { color: '#666', fontSize: 16, textAlign: 'center', marginBottom: 40 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  headerTitle: { color: '#00A86B', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  signOutBtn: { backgroundColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  signOutText: { color: '#555', fontWeight: '600', fontSize: 12 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EAEAEA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, color: '#111', fontSize: 15 },

  // Scroll
  scrollContent: { padding: 20, paddingBottom: 180 },
  sectionTitle: { color: '#111', fontSize: 22, fontWeight: '800', marginBottom: 16 },
  emptyText: { color: '#888', fontSize: 15, textAlign: 'center', marginTop: 60 },

  // Restaurant Cards
  restaurantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: '#EAEAEA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 },
  restaurantIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 14 },

  // Menu Cards
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: '#EAEAEA', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 },
  menuImage: { width: 90, height: 90 },
  menuInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 8 },
  menuName: { color: '#111', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  menuPrice: { color: '#00A86B', fontWeight: '600', fontSize: 13 },
  scoreBadge: { color: '#00A86B', fontSize: 12, fontWeight: '700', marginTop: 6 },

  // Diary & Reviews
  diaryCard: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: '#EAEAEA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  diaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  diaryItemName: { color: '#111', fontSize: 17, fontWeight: '700', flex: 1, marginRight: 8 },
  diaryDate: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  diaryDateText: { color: '#888', fontSize: 12, fontWeight: '500' },
  privateNoteContainer: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  publicNoteContainer: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EAEAEA' },
  noteLabel: { color: '#666', fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  privateNoteText: { color: '#00A86B', fontSize: 14, lineHeight: 20 },
  publicNoteText: { color: '#444', fontSize: 14, lineHeight: 20 },

  // Bottom Nav
  bottomNav: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EAEAEA', paddingVertical: 12, paddingBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { color: '#888', fontSize: 11, marginTop: 4, fontWeight: '600' },
  navTextActive: { color: '#00A86B' },

  // Modal
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#111', fontSize: 18, fontWeight: '800' },
  modalImage: { width: '100%', height: 160, borderRadius: 18, marginBottom: 16 },
  modalItemName: { color: '#00A86B', fontSize: 22, fontWeight: '900', marginBottom: 24 },
  thumbsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 28 },
  thumbButton: { alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', width: '45%', backgroundColor: '#F8F9FA' },
  thumbActive: { borderColor: '#00A86B', backgroundColor: '#F0FDF4' },
  thumbLabel: { color: '#555', marginTop: 8, fontWeight: '600', fontSize: 13 },

  // Shared inputs
  inputGroup: { marginBottom: 18 },
  inputLabel: { color: '#666', marginBottom: 8, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  textInput: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 14, color: '#111', padding: 15, fontSize: 15 },
  submitButton: { backgroundColor: '#00A86B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, marginTop: 8, gap: 10, shadowColor: '#00A86B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryButton: { marginTop: 14, padding: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#00A86B', fontSize: 16, fontWeight: '700' },
});
