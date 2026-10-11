-- ==============================================================================
-- E-COMMERCE DATABASE SCHEMA FOR SUPABASE (PostgreSQL)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'Placed' CHECK (status IN ('Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash on Delivery', 'Demo Payment')),
    shipping_name TEXT NOT NULL,
    shipping_email TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PROFILES POLICIES ---
-- Users can view their own profile; Admins can view all profiles
CREATE POLICY "Users can view own profile or admin can view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Users can insert their own profile on registration
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile (name, etc. but cannot grant admin role themselves)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin() OR 
        (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    );

-- --- PRODUCTS POLICIES ---
-- Anyone (authenticated or anonymous) can view active products
CREATE POLICY "Public can view products"
    ON public.products FOR SELECT
    TO public
    USING (true);

-- Only admins can insert, update, delete products
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- --- ORDERS POLICIES ---
-- Users can view their own orders; Admins can view all orders
CREATE POLICY "Users can view own orders, admins view all"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert orders for themselves
CREATE POLICY "Users can insert own orders"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Only admins can update order status
CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --- ORDER ITEMS POLICIES ---
-- Users can view their own order items; Admins can view all
CREATE POLICY "Users can view own order items, admins view all"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Users can insert order items for their own orders
CREATE POLICY "Users can insert order items for their orders"
    ON public.order_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (Optional Convenience)
-- Automatically inserts a profile record when a user signs up via Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Customer'),
    new.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROLE PRIVILEGES & PERMISSIONS (Standard Supabase Data API Grants)
-- Required for PostgREST to evaluate Row Level Security (RLS) policies
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant select to anon & authenticated so RLS policies can control row-level visibility
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;

-- Service role full access for backend admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

