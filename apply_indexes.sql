-- Essential indexes for search performance
-- Run these SQL commands in your Supabase SQL editor

-- Basic company search indexes
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_market_cap ON companies(market_cap);
CREATE INDEX IF NOT EXISTS idx_companies_annual_revenue_range ON companies(annual_revenue_range);
CREATE INDEX IF NOT EXISTS idx_companies_name_lowercase ON companies(name_lowercase);
CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_is_listed ON companies(is_listed);

-- Address search indexes
CREATE INDEX IF NOT EXISTS idx_company_addresses_state_city ON company_addresses(state, city);

-- Financial search indexes
CREATE INDEX IF NOT EXISTS idx_financial_statements_revenue ON financial_statements(total_revenue);
CREATE INDEX IF NOT EXISTS idx_financial_statements_company_year ON financial_statements(company_id, financial_year);
CREATE INDEX IF NOT EXISTS idx_financial_statements_net_profit ON financial_statements(net_profit);
CREATE INDEX IF NOT EXISTS idx_financial_statements_profit_margin ON financial_statements(profit_margin);

-- Text search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name_search ON companies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_companies_sector_search ON companies USING gin(to_tsvector('english', sector));
