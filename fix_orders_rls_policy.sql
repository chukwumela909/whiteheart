-- ================================================
-- FIX: guest checkout was blocked at two layers
-- ================================================
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).
--
-- The checkout UI treats sign-in as optional ("Already have an account?
-- Sign in") — guest orders are intended to work. Two things were stopping
-- them:
--   1. orders.user_id is NOT NULL, so a guest order (no session, user_id =
--      null) can never be inserted, regardless of RLS. This is why the
--      error changed from an RLS violation to a not-null violation once
--      order creation moved to the service-role client, which bypasses RLS
--      but not table constraints.
--   2. No RLS policy allowed the insert in the first place (the original bug).
--
-- Order creation now happens server-side via /api/orders/create using the
-- service-role key, which bypasses RLS entirely — so the app no longer
-- *needs* the policies below to function. They're added anyway as
-- defense-in-depth, so the tables aren't silently wide open if anything
-- ever inserts from the browser again, and so guest/authenticated checkout
-- would still work even without the server route.
--
-- Guard rails baked into the WITH CHECK clauses:
--   - user_id must be NULL (guest order) or match the caller's own auth.uid()
--     — nobody can attach an order to someone else's account.
--   - status/payment_status must be 'pending' on insert — nobody can insert
--     a pre-marked-paid order from the client.
--   - order_items can only be inserted for an order that is still pending
--     and (for logged-in orders) belongs to the caller.

-- ---- allow guest orders (user_id nullable) ----

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- ---- orders ----

CREATE POLICY "Allow order creation (own or guest)"
ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND status = 'pending'
    AND payment_status = 'pending'
);

-- ---- order_items ----

CREATE POLICY "Allow order item creation for pending own/guest orders"
ON order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = order_items.order_id
          AND o.status = 'pending'
          AND (o.user_id IS NULL OR o.user_id = auth.uid())
    )
);

-- ================================================
-- VERIFY
-- ================================================
-- List policies on both tables to confirm they were created:

SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
