import { supabase } from './supabase';
import { activityService } from './activityService';

export const searchService = {
  // Search companies with autocomplete (for hero section)
  async searchCompanies(query, limit = 6) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          sector,
          company_type,
          is_listed,
          market_cap,
          annual_revenue_range,
          logo_url,
          founded_date
        `)
        .or(`name_lowercase.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%,cin.ilike.%${searchTerm}%`)
        .eq('status', 'ACTIVE')
        .order('name')
        .limit(limit);

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  },

  // Advanced search with filters
  async advancedSearch(filters, page = 1, limit = 20, userId = null) {
    try {
      // Log search activity if user is provided and there's a search query
      if (userId && filters.searchQuery && filters.searchQuery.trim()) {
        try {
          await activityService.logActivity({
            user_id: userId,
            activity_type: 'SEARCH',
            search_query: filters.searchQuery.trim(),
            resource_type: 'company_search',
            ip_address: null, // Could be added later
            user_agent: navigator.userAgent,
            session_id: sessionStorage.getItem('sessionId') || null
          });
        } catch (error) {
          console.error('Error logging search activity:', error);
        }
      }

      let query = supabase
        .from('companies')
        .select(`
          id,
          name,
          sector,
          company_type,
          is_listed,
          market_cap,
          annual_revenue_range,
          logo_url,
          founded_date,
          employee_count,
          employee_range,
          status,
          description
        `)
        .eq('status', 'ACTIVE');

      // Apply text search
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim().toLowerCase();
        query = query.or(`name_lowercase.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%,cin.ilike.%${searchTerm}%`);
      }

      // Apply sector filter
      if (filters.sector && filters.sector !== 'all') {
        console.log('Applying sector filter:', filters.sector);
        query = query.eq('sector', filters.sector);
      }

      // Apply company type filter
      if (filters.companyType && filters.companyType !== 'all') {
        query = query.eq('company_type', filters.companyType);
      }

      // Apply listing status filter
      if (filters.isListed !== null && filters.isListed !== undefined) {
        query = query.eq('is_listed', filters.isListed);
      }

      // Apply revenue range filter
      if (filters.revenueRange && filters.revenueRange !== 'all') {
        query = query.eq('annual_revenue_range', filters.revenueRange);
      }

      // Apply employee range filter
      if (filters.employeeRange && filters.employeeRange !== 'all') {
        query = query.eq('employee_range', filters.employeeRange);
      }

      // Apply location filter
      if (filters.location && filters.location.trim()) {
        query = query.select(`
          *,
          company_addresses!inner(state, city)
        `).eq('company_addresses.state', filters.location);
      }

      // Apply financial filters
      if (filters.minRevenue || filters.maxRevenue || filters.minProfit || filters.maxProfit) {
        query = query.select(`
          *,
          financial_statements!inner(total_revenue, net_profit, financial_year)
        `);

        if (filters.minRevenue) {
          query = query.gte('financial_statements.total_revenue', filters.minRevenue);
        }
        if (filters.maxRevenue) {
          query = query.lte('financial_statements.total_revenue', filters.maxRevenue);
        }
        if (filters.minProfit) {
          query = query.gte('financial_statements.net_profit', filters.minProfit);
        }
        if (filters.maxProfit) {
          query = query.lte('financial_statements.net_profit', filters.maxProfit);
        }
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'name':
            query = query.order('name', { ascending: true });
            break;
          case 'revenue':
            query = query.order('financial_statements.total_revenue', { ascending: false });
            break;
          case 'profit':
            query = query.order('financial_statements.net_profit', { ascending: false });
            break;
          case 'market_cap':
            query = query.order('market_cap', { ascending: false });
            break;
          case 'founded_date':
            query = query.order('founded_date', { ascending: false });
            break;
          default:
            query = query.order('name', { ascending: true });
        }
      } else {
        query = query.order('name', { ascending: true });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Advanced search error:', error);
        return { results: [], total: 0, page, limit };
      }

      return {
        results: data || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Advanced search service error:', error);
      return { results: [], total: 0, page, limit };
    }
  },

  // Get available filter options
  async getFilterOptions() {
    try {
      // Get sectors
      const { data: sectors } = await supabase
        .from('companies')
        .select('sector')
        .not('sector', 'is', null)
        .eq('status', 'ACTIVE');

      // Get revenue ranges
      const { data: revenueRanges } = await supabase
        .from('companies')
        .select('annual_revenue_range')
        .not('annual_revenue_range', 'is', null)
        .eq('status', 'ACTIVE');

      // Get employee ranges
      const { data: employeeRanges } = await supabase
        .from('companies')
        .select('employee_range')
        .not('employee_range', 'is', null)
        .eq('status', 'ACTIVE');

      // Get locations
      const { data: locations } = await supabase
        .from('company_addresses')
        .select('state')
        .not('state', 'is', null);

      return {
        sectors: [...new Set(sectors?.map(s => s.sector).filter(Boolean))].sort(),
        revenueRanges: [...new Set(revenueRanges?.map(r => r.annual_revenue_range).filter(Boolean))].sort(),
        employeeRanges: [...new Set(employeeRanges?.map(e => e.employee_range).filter(Boolean))].sort(),
        locations: [...new Set(locations?.map(l => l.state).filter(Boolean))].sort()
      };
    } catch (error) {
      console.error('Get filter options error:', error);
      return {
        sectors: [],
        revenueRanges: [],
        employeeRanges: [],
        locations: []
      };
    }
  }
};
