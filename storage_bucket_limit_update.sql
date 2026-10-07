-- ================================================
-- RAISE THE product-images FILE SIZE LIMIT
-- ================================================
-- Uploads that exceed the bucket's limit fail with
-- "The object exceeded the maximum allowed size" (HTTP 413), which the admin
-- product forms surface as "Error updating product: ...".
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor). The storage
-- schema is not exposed over the REST API, so the anon and service-role keys
-- cannot make this change from the app.

-- ================================================
-- STEP 1: Check the current limit
-- ================================================
-- file_size_limit is in bytes; NULL means "fall back to the project limit".

SELECT
  id,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 AS limit_mb,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'product-images';

-- ================================================
-- STEP 2: Raise it to 10MB
-- ================================================

UPDATE storage.buckets
SET file_size_limit = 10485760  -- 10 * 1024 * 1024
WHERE id = 'product-images';

-- ================================================
-- STEP 3: Confirm the new value
-- ================================================

SELECT
  id,
  file_size_limit,
  file_size_limit / 1024 / 1024 AS limit_mb
FROM storage.buckets
WHERE id = 'product-images';

-- ================================================
-- NOTES
-- ================================================
-- The project-wide upload limit caps this one: if Settings -> Storage ->
-- "Upload file size limit" is below 10MB, uploads keep failing with the same
-- 413 no matter what this bucket says. Raise the project limit there first.
-- (Free plan tops out at 50MB.)
--
-- To pick a different ceiling, change the byte value in STEP 2:
--   5MB  =  5242880
--  10MB  = 10485760
--  20MB  = 20971520
--  50MB  = 52428800
