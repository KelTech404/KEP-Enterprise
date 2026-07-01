-- Setup Test Data Script
-- Run this in Supabase SQL Editor after creating auth accounts
-- Use credentials from .env.test file

-- Create Ambassador Contact Record
-- Replace with actual email from .env.test
INSERT INTO ambassador_contacts (ambassador_name, church, email, is_active)
VALUES ('Test Ambassador', 'Church A', 'ambassador@test.com', true)
ON CONFLICT (email) DO NOTHING;

-- Verify the setup
SELECT 'Ambassador Contact Created' as status, * FROM ambassador_contacts WHERE email = 'ambassador@test.com';
