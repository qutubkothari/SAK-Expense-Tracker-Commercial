-- Add user preferences columns to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS language_name TEXT DEFAULT 'English';

-- Default currency options: INR, AED, USD, EUR, GBP, etc.
-- Default language codes: en, ar, hi, ur, gu, fr, bn, ta, es, de, zh, etc.

COMMENT ON COLUMN users.default_currency IS 'User preferred currency (INR, AED, USD, EUR, etc.)';
COMMENT ON COLUMN users.default_language IS 'User preferred language code (en, ar, hi, ur, gu, fr, etc.)';
COMMENT ON COLUMN users.language_name IS 'Display name of language (English, العربية, हिन्दी, etc.)';
