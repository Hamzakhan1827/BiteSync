-- CraveSync Initial Seed Data
-- 5 Top Karachi Restaurants with their signature items

-- 1. Insert Restaurants
INSERT INTO restaurants (id, name, address) VALUES 
('11111111-1111-1111-1111-111111111111', 'Kolachi', 'Beach Avenue, Do Darya, Karachi'),
('22222222-2222-2222-2222-222222222222', 'Javed Nihari', 'Dastagir, F.B. Area, Karachi'),
('33333333-3333-3333-3333-333333333333', 'Xanders', 'Clifton Block 4, Karachi'),
('44444444-4444-4444-4444-444444444444', 'Hot N Spicy', 'Khadda Market, DHA, Karachi'),
('55555555-5555-5555-5555-555555555555', 'Sakura (Pearl Continental)', 'Club Road, Karachi');

-- 2. Insert Menu Categories
-- Kolachi
INSERT INTO menu_categories (id, restaurant_id, name) VALUES 
('c1000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'BBQ Specials'),
('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Karahi & Handi');
-- Javed Nihari
INSERT INTO menu_categories (id, restaurant_id, name) VALUES 
('c2000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Special Nihari');
-- Xanders
INSERT INTO menu_categories (id, restaurant_id, name) VALUES 
('c3000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Gourmet Burgers'),
('c3000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Wood Fired Pizza');
-- Hot N Spicy
INSERT INTO menu_categories (id, restaurant_id, name) VALUES 
('c4000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Rolls & Fast Food');
-- Sakura
INSERT INTO menu_categories (id, restaurant_id, name) VALUES 
('c5000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Sushi & Sashimi');

-- 3. Insert Menu Items
-- Kolachi Items
INSERT INTO menu_items (id, category_id, name, price) VALUES 
('d1000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001', 'Chicken Peshawari Karahi', 2200),
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000000', 'Mutton Chops', 2800);
-- Javed Nihari
INSERT INTO menu_items (id, category_id, name, price) VALUES 
('d2000000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Nalli Nihari', 1200);
-- Xanders
INSERT INTO menu_items (id, category_id, name, price) VALUES 
('d3000000-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000000', 'Jalapeno Beef Burger', 1650),
('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Feta & Spinach Pizza', 1850);
-- Hot N Spicy
INSERT INTO menu_items (id, category_id, name, price) VALUES 
('d4000000-0000-0000-0000-000000000000', 'c4000000-0000-0000-0000-000000000000', 'Chicken Chutney Roll', 350);
-- Sakura
INSERT INTO menu_items (id, category_id, name, price) VALUES 
('d5000000-0000-0000-0000-000000000000', 'c5000000-0000-0000-0000-000000000000', 'Spicy Tuna Maki', 2500);

-- 4. Insert Item Attributes (The specific feedback sliders)
-- Karahi Attributes
INSERT INTO item_attributes (menu_item_id, attribute_name, attribute_type, min_label, max_label) VALUES 
('d1000000-0000-0000-0000-000000000000', 'Spice Level', 'slider', 'Too Mild', 'Too Spicy'),
('d1000000-0000-0000-0000-000000000000', 'Oil Level', 'slider', 'Too Dry', 'Too Oily');
-- Nalli Nihari Attributes
INSERT INTO item_attributes (menu_item_id, attribute_name, attribute_type, min_label, max_label) VALUES 
('d2000000-0000-0000-0000-000000000000', 'Bone Marrow Quantity', 'slider', 'Too Little', 'Too Much');
-- Burger Attributes
INSERT INTO item_attributes (menu_item_id, attribute_name, attribute_type, min_label, max_label) VALUES 
('d3000000-0000-0000-0000-000000000000', 'Meat Doneness', 'slider', 'Under-cooked', 'Over-cooked'),
('d3000000-0000-0000-0000-000000000000', 'Bun Freshness', 'boolean', null, null);
-- Roll Attributes
INSERT INTO item_attributes (menu_item_id, attribute_name, attribute_type, min_label, max_label) VALUES 
('d4000000-0000-0000-0000-000000000000', 'Paratha Crispiness', 'slider', 'Too Soft', 'Too Hard');
