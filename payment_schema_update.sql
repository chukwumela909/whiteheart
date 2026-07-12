-- ================================================
-- PAYMENT COLUMNS FOR PAYSTACK RECONCILIATION
-- ================================================
-- Run this in the Supabase SQL Editor (SQL Editor → New Query → Run).
--
-- These columns are OPTIONAL: the payment flow works without them (the
-- webhook / verify code falls back to updating only payment_status + status).
-- Adding them gives you a full audit trail of each successful charge.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- Look orders up quickly by their Paystack reference.
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference
    ON orders (payment_reference);
