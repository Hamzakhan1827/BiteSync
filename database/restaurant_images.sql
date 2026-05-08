-- Update restaurant images with real food photography
-- Run this in Supabase SQL Editor

UPDATE restaurants SET logo_url = 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80'
WHERE name ILIKE '%Kolachi%';

UPDATE restaurants SET logo_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80'
WHERE name ILIKE '%Nihari%';

UPDATE restaurants SET logo_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80'
WHERE name ILIKE '%Xander%';

UPDATE restaurants SET logo_url = 'https://images.unsplash.com/photo-1626082893322-3c0caaf1e994?w=600&q=80'
WHERE name ILIKE '%Spicy%';

UPDATE restaurants SET logo_url = 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80'
WHERE name ILIKE '%Sakura%';
