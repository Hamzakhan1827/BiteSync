# 🏢 BiteSync Client Onboarding Manual

This document outlines the standard operating procedure (SOP) for adding a new restaurant client (e.g., Burger Lab, KFC) to the BiteSync platform. 

By following these 3 steps, the client will instantly gain access to their secure, locked-down dashboard. No code changes are required.

---

### Step 1: Register the Restaurant
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/projects).
2. Go to **Table Editor** on the left menu.
3. Select the `restaurants` table.
4. Click **Insert Row** (top right).
5. Fill in the restaurant details:
   - `name`: e.g., "Burger Lab"
   - `address`: (Optional) e.g., "Clifton, Karachi"
6. Click **Save**. *(Supabase will automatically generate a unique `id` for this restaurant).*

### Step 2: Create the Manager's Account
1. Go to **Authentication** on the left menu.
2. Click **Add User** -> **Create New User** (top right).
3. Enter the client's email (e.g., `admin@burgerlab.com`).
4. Enter a temporary secure password (e.g., `BurgerLab2026!`).
5. Click **Create User**.

### Step 3: Link the Manager to the Restaurant (The Magic Step)
1. Go back to the **Table Editor** on the left menu.
2. Select the `users` table (Note: this is `public.users`, not auth).
3. Find the row with the email you just created (`admin@burgerlab.com`).
4. Scroll to the `managed_restaurant_id` column for that row.
5. Double-click the empty `NULL` cell. 
6. A visual dropdown menu will appear. **Select the Restaurant** you created in Step 1 (e.g., "Burger Lab").
7. Hit **Enter** or click outside to save.

---

### 🎉 Success!
You can now email the client their login credentials. The moment they log into `localhost:3000` (or your live domain), the dashboard will dynamically adapt to display their specific restaurant name and filter their analytics.

*(Note: In the future, this entire process will be automated via a 1-click "Add Client" button inside your BiteSync Network Super Admin Dashboard).*
