-- Add billing-related columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'FREEMIUM',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(255);

-- Update the role check constraint to ensure ADMIN is not a paid tier
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role = ANY (ARRAY['FREEMIUM'::text, 'PREMIUM'::text, 'ENTERPRISE'::text, 'ADMIN'::text]));

-- Add subscription_plan check constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_plan_check 
CHECK (subscription_plan = ANY (ARRAY['FREEMIUM'::text, 'PREMIUM'::text, 'ENTERPRISE'::text]));

-- Add subscription_status check constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status = ANY (ARRAY['active'::text, 'inactive'::text, 'cancelled'::text, 'past_due'::text, 'trialing'::text]));

-- Create user_billing table
CREATE TABLE IF NOT EXISTS user_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(20) DEFAULT 'pending',
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_usage table for tracking usage limits
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL, -- 'company_view', 'export', 'search'
  usage_count INTEGER DEFAULT 1,
  usage_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_billing_user_id ON user_billing(user_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_payment_status ON user_billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_type_date ON user_usage(usage_type, usage_date);
