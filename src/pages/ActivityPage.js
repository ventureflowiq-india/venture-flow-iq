import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Filter, 
  Calendar, 
  Search, 
  Eye, 
  Download, 
  Star, 
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Header from '../components/common/Header';
import { activityService } from '../lib/activityService';

const ActivityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    activityType: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (user) {
      fetchActivities();
      fetchStats();
    }
  }, [user, filters, timeRange]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const options = {
        activityType: filters.activityType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: 100
      };
      
      const data = await activityService.getUserActivityLogs(user.id, options);
      const formattedActivities = data.map(activity => activityService.formatActivity(activity));
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await activityService.getActivityStats(user.id, parseInt(timeRange));
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchActivities(), fetchStats()]);
    setRefreshing(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      activityType: '',
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
  };

  const filteredActivities = activities.filter(activity => {
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      return (
        activity.label.toLowerCase().includes(searchLower) ||
        (activity.companies?.name && activity.companies.name.toLowerCase().includes(searchLower)) ||
        (activity.search_query && activity.search_query.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const getActivityTypeColor = (activityType) => {
    const colors = {
      'SEARCH': 'bg-blue-100 text-blue-800',
      'VIEW_PROFILE': 'bg-green-100 text-green-800',
      'EXPORT_DATA': 'bg-purple-100 text-purple-800',
      'CREATE_WATCHLIST': 'bg-yellow-100 text-yellow-800',
      'ADD_TO_WATCHLIST': 'bg-pink-100 text-pink-800',
      'SAVE_SEARCH': 'bg-indigo-100 text-indigo-800',
      'DOWNLOAD_REPORT': 'bg-orange-100 text-orange-800',
      'API_CALL': 'bg-gray-100 text-gray-800'
    };
    return colors[activityType] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Activity className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your activity</h2>
            <p className="text-gray-600 mb-6">Track your activity and usage patterns</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={() => navigate('/login')}
        onLogout={() => navigate('/')}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-gray-600">Track your activity and usage patterns</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activityTypes.SEARCH || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activityTypes.VIEW_PROFILE || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Watchlist Actions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.activityTypes.CREATE_WATCHLIST || 0) + (stats.activityTypes.ADD_TO_WATCHLIST || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select
                    value={filters.activityType}
                    onChange={(e) => handleFilterChange('activityType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Activities</option>
                    {activityService.getActivityTypes().map(type => (
                      <option key={type} value={type}>{activityService.formatActivity({ activity_type: type }).label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your activity...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {filters.activityType || filters.startDate || filters.endDate || filters.searchQuery
                  ? 'Try adjusting your filters to see more activities.'
                  : 'Start using the platform to see your activity here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{activity.label}</p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeColor(activity.activity_type)}`}>
                          {activity.activity_type}
                        </span>
                      </div>
                      
                      {activity.companies && (
                        <p className="text-sm text-gray-600 mb-1">
                          Company: <span className="font-medium">{activity.companies.name}</span>
                          {activity.companies.sector && (
                            <span className="text-gray-500"> • {activity.companies.sector}</span>
                          )}
                        </p>
                      )}
                      
                      {activity.search_query && (
                        <p className="text-sm text-gray-600 mb-1">
                          Search: <span className="font-medium">"{activity.search_query}"</span>
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.relativeTime}
                        </span>
                        <span>{activity.formattedTime}</span>
                      </div>
                    </div>
                    
                    {activity.companies && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => navigate(`/company/${activity.company_id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Company
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
