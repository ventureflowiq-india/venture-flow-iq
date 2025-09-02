import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { activityService } from './activityService';

export const watchlistService = {
  // Get all watchlists for a user
  async getUserWatchlists(userId) {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select(`
          *,
          watchlist_companies (
            id,
            company_id,
            notes,
            added_at,
            companies (
              id,
              name,
              sector,
              company_type,
              market_cap,
              annual_revenue_range,
              is_listed,
              status
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      throw error;
    }
  },

  // Get a single watchlist with companies
  async getWatchlist(watchlistId) {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select(`
          *,
          watchlist_companies (
            id,
            company_id,
            notes,
            added_at,
            companies (
              id,
              name,
              sector,
              company_type,
              market_cap,
              annual_revenue_range,
              is_listed,
              status,
              logo_url,
              description
            )
          )
        `)
        .eq('id', watchlistId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },

  // Create a new watchlist
  async createWatchlist(userId, name, description = '') {
    try {
      const watchlistId = uuidv4();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('watchlists')
        .insert({
          id: watchlistId,
          user_id: userId,
          name,
          description,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await activityService.logActivity({
          user_id: userId,
          activity_type: 'CREATE_WATCHLIST',
          resource_type: 'watchlist',
          resource_id: watchlistId,
          ip_address: null,
          user_agent: navigator.userAgent,
          session_id: sessionStorage.getItem('sessionId') || null
        });
      } catch (activityError) {
        console.error('Error logging watchlist creation activity:', activityError);
      }

      return data;
    } catch (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }
  },

  // Update a watchlist
  async updateWatchlist(watchlistId, updates) {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', watchlistId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating watchlist:', error);
      throw error;
    }
  },

  // Delete a watchlist
  async deleteWatchlist(watchlistId) {
    try {
      // First delete all companies in the watchlist
      await supabase
        .from('watchlist_companies')
        .delete()
        .eq('watchlist_id', watchlistId);

      // Then delete the watchlist
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      throw error;
    }
  },

  // Add a company to a watchlist
  async addCompanyToWatchlist(watchlistId, companyId, notes = '') {
    try {
      // Check if company is already in the watchlist
      const { data: existing } = await supabase
        .from('watchlist_companies')
        .select('id')
        .eq('watchlist_id', watchlistId)
        .eq('company_id', companyId)
        .single();

      if (existing) {
        throw new Error('Company is already in this watchlist');
      }

      const { data, error } = await supabase
        .from('watchlist_companies')
        .insert({
          id: uuidv4(),
          watchlist_id: watchlistId,
          company_id: companyId,
          notes
        })
        .select()
        .single();

      if (error) throw error;

      // Get user_id from watchlist for activity logging
      const { data: watchlistData } = await supabase
        .from('watchlists')
        .select('user_id')
        .eq('id', watchlistId)
        .single();

      // Log activity
      if (watchlistData?.user_id) {
        try {
          await activityService.logActivity({
            user_id: watchlistData.user_id,
            activity_type: 'ADD_TO_WATCHLIST',
            company_id: companyId,
            resource_type: 'watchlist_company',
            resource_id: data.id,
            ip_address: null,
            user_agent: navigator.userAgent,
            session_id: sessionStorage.getItem('sessionId') || null
          });
        } catch (activityError) {
          console.error('Error logging add to watchlist activity:', activityError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error adding company to watchlist:', error);
      throw error;
    }
  },

  // Remove a company from a watchlist
  async removeCompanyFromWatchlist(watchlistId, companyId) {
    try {
      const { error } = await supabase
        .from('watchlist_companies')
        .delete()
        .eq('watchlist_id', watchlistId)
        .eq('company_id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing company from watchlist:', error);
      throw error;
    }
  },

  // Update notes for a company in a watchlist
  async updateCompanyNotes(watchlistId, companyId, notes) {
    try {
      const { data, error } = await supabase
        .from('watchlist_companies')
        .update({ notes })
        .eq('watchlist_id', watchlistId)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company notes:', error);
      throw error;
    }
  },

  // Check if a company is in any of user's watchlists
  async isCompanyInWatchlists(userId, companyId) {
    try {
      const { data, error } = await supabase
        .from('watchlist_companies')
        .select(`
          watchlist_id,
          watchlists!inner(name)
        `)
        .eq('company_id', companyId)
        .eq('watchlists.user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking company in watchlists:', error);
      throw error;
    }
  },

  // Get watchlist statistics for a user
  async getWatchlistStats(userId) {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select(`
          id,
          name,
          watchlist_companies(count)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      const stats = {
        totalWatchlists: data?.length || 0,
        totalCompanies: data?.reduce((sum, wl) => sum + (wl.watchlist_companies?.[0]?.count || 0), 0) || 0,
        watchlists: data || []
      };

      return stats;
    } catch (error) {
      console.error('Error fetching watchlist stats:', error);
      throw error;
    }
  }
};
