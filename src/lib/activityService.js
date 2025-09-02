import { supabase } from './supabase';

export const activityService = {
  // Get user activity logs with optional filtering
  async getUserActivityLogs(userId, options = {}) {
    try {
      let query = supabase
        .from('user_activity_logs')
        .select(`
          *,
          companies (
            id,
            name,
            sector,
            company_type
          )
        `)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (options.activityType) {
        query = query.eq('activity_type', options.activityType);
      }

      if (options.startDate) {
        query = query.gte('timestamp', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('timestamp', options.endDate);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      throw error;
    }
  },

  // Get activity statistics for a user
  async getActivityStats(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('activity_type, timestamp')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalActivities: data?.length || 0,
        activityTypes: {},
        dailyActivity: {},
        recentActivity: data?.slice(0, 10) || []
      };

      // Count by activity type
      data?.forEach(activity => {
        stats.activityTypes[activity.activity_type] = 
          (stats.activityTypes[activity.activity_type] || 0) + 1;
      });

      // Count by day
      data?.forEach(activity => {
        const date = new Date(activity.timestamp).toDateString();
        stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  },

  // Log a new activity
  async logActivity(activityData) {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .insert({
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...activityData,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  // Get activity types for filtering
  getActivityTypes() {
    return [
      'SEARCH',
      'VIEW_PROFILE',
      'EXPORT_DATA',
      'CREATE_WATCHLIST',
      'ADD_TO_WATCHLIST',
      'SAVE_SEARCH',
      'DOWNLOAD_REPORT',
      'API_CALL'
    ];
  },

  // Format activity for display
  formatActivity(activity) {
    const activityLabels = {
      'SEARCH': 'Search',
      'VIEW_PROFILE': 'Viewed Company Profile',
      'EXPORT_DATA': 'Exported Data',
      'CREATE_WATCHLIST': 'Created Watchlist',
      'ADD_TO_WATCHLIST': 'Added to Watchlist',
      'SAVE_SEARCH': 'Saved Search',
      'DOWNLOAD_REPORT': 'Downloaded Report',
      'API_CALL': 'API Call'
    };

    const activityIcons = {
      'SEARCH': '🔍',
      'VIEW_PROFILE': '👁️',
      'EXPORT_DATA': '📊',
      'CREATE_WATCHLIST': '📋',
      'ADD_TO_WATCHLIST': '⭐',
      'SAVE_SEARCH': '💾',
      'DOWNLOAD_REPORT': '📥',
      'API_CALL': '🔌'
    };

    return {
      ...activity,
      label: activityLabels[activity.activity_type] || activity.activity_type,
      icon: activityIcons[activity.activity_type] || '📝',
      formattedTime: new Date(activity.timestamp).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      relativeTime: this.getRelativeTime(activity.timestamp)
    };
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(timestamp) {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }
};
