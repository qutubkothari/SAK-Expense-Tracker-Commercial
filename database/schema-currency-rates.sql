-- Insert current exchange rates (as of November 2024)
-- These are approximate rates and will be updated via API

-- AED to INR (UAE Dirham to Indian Rupee)
INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at)
VALUES ('AED', 'INR', 22.75, NOW())
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = 22.75, updated_at = NOW();

-- USD to INR (US Dollar to Indian Rupee)
INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at)
VALUES ('USD', 'INR', 83.50, NOW())
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = 83.50, updated_at = NOW();

-- EUR to INR (Euro to Indian Rupee)
INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at)
VALUES ('EUR', 'INR', 90.25, NOW())
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = 90.25, updated_at = NOW();

-- GBP to INR (British Pound to Indian Rupee)
INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at)
VALUES ('GBP', 'INR', 105.80, NOW())
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = 105.80, updated_at = NOW();

-- SGD to INR (Singapore Dollar to Indian Rupee)
INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at)
VALUES ('SGD', 'INR', 62.30, NOW())
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = 62.30, updated_at = NOW();

-- Verify the inserted rates
SELECT 
  from_currency,
  to_currency,
  rate,
  updated_at
FROM exchange_rates
ORDER BY from_currency;
