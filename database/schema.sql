-- CraveSync Database Schema
-- Optimized for PostgreSQL (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Diners)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Restaurants Table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Menu Categories
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Stored as whole number (e.g., PKR 1500)
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Item Attributes (The core mechanism for specific, granular feedback)
CREATE TABLE item_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL, -- e.g., 'Spice Level', 'Meat Doneness', 'Crispiness'
    attribute_type VARCHAR(50) NOT NULL, -- Options: 'slider', 'boolean', 'text'
    min_label VARCHAR(50), -- e.g., 'Too Mild' (for sliders)
    max_label VARCHAR(50), -- e.g., 'Too Spicy' (for sliders)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Reviews (Acts as both the Food Diary for users and Feedback for restaurants)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    rating_thumbs BOOLEAN, -- True = Thumbs Up, False = Thumbs Down, Null = Unrated
    private_note TEXT, -- ONLY visible to the user (Food Diary Note)
    public_note TEXT, -- Visible to the restaurant admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Review Attribute Values (Stores the specific data points linked to the item attributes)
CREATE TABLE review_attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    item_attribute_id UUID REFERENCES item_attributes(id) ON DELETE CASCADE,
    value_numeric INTEGER, -- For sliders (e.g., 85 out of 100 for Spice)
    value_boolean BOOLEAN, -- For toggles
    value_text TEXT, -- For custom attribute notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for blazing fast querying (Crucial for scaling to 10k+ users without lag)
CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_item_attributes_item ON item_attributes(menu_item_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_item ON reviews(menu_item_id);
CREATE INDEX idx_review_values_review ON review_attribute_values(review_id);
