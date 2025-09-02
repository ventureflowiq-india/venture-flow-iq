import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Search, 
  TrendingUp, 
  FileText, 
  Eye, 
  User, 
  BarChart3, 
  Download,
  Star,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Header from '../components/common/Header';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserProfile } from '../hooks/useUserProfile';
import { watchlistService } from '../lib/watchlistService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistStats, setWatchlistStats] = useState({ totalWatchlists: 0, totalCompanies: 0 });

  const fetchWatchlistStats = useCallback(async () => {
    try {
      const stats = await watchlistService.getWatchlistStats(user.id);
      setWatchlistStats(stats);
    } catch (error) {
      console.error('Error fetching watchlist stats:', error);
    }
  }, [user?.id]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, sector, company_type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    if (user) {
      fetchWatchlistStats();
    }
  }, [user, fetchWatchlistStats]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const quickStats = [
    {
      title: "Companies Tracked",
      value: companies.length.toString(),
      change: "+12%",
      changeType: "increase",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Searches This Month",
      value: "47",
      change: "+8%",
      changeType: "increase",
      icon: Search,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Reports Generated",
      value: "12",
      change: "+23%",
      changeType: "increase",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Watchlist Items",
      value: watchlistStats.totalCompanies.toString(),
      change: "+2",
      changeType: "increase",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const marketInsights = [
    {
      title: "Technology Sector Growth",
      value: "+15.2%",
      description: "Q3 2024 performance",
      trend: "up",
      color: "text-green-600"
    },
    {
      title: "Healthcare Investments",
      value: "₹2.4B",
      description: "Total funding raised",
      trend: "up",
      color: "text-blue-600"
    },
    {
      title: "Manufacturing Index",
      value: "142.3",
      description: "PMI for September",
      trend: "down",
      color: "text-red-600"
    }
  ];

  const quickActions = [
    {
      title: "Advanced Search",
      description: "Find companies with filters",
      icon: Search,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: () => navigate('/search')
    },
    {
      title: "Create Watchlist",
      description: "Track important companies",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      action: () => navigate('/watchlist')
    },
    {
      title: "Generate Report",
      description: "Export company data",
      icon: Download,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: () => navigate('/reports')
    },
    {
      title: "Market Analysis",
      description: "View sector insights",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: () => navigate('/market-analysis')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userProfile.name}! 👋
              </h1>
              <p className="text-gray-600">
                Here's your market intelligence overview for today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Upgrade Plan
              </button>
              <Link 
                to="/profile" 
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className={`flex items-center text-sm ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Company Search</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Advanced Filters
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for companies, CINs, or sectors..."
                  className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Market Insights</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      {insight.trend === 'up' ? (
                        <ArrowUpRight className={`h-4 w-4 ${insight.color}`} />
                      ) : (
                        <ArrowDownRight className={`h-4 w-4 ${insight.color}`} />
                      )}
                    </div>
                    <p className={`text-xl font-bold ${insight.color}`}>{insight.value}</p>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Companies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Companies</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/search')}
                    className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>

                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : companies.length > 0 ? (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">
                          {company.sector} • {company.company_type} • {company.status}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/company/${company.id}`)}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => navigate('/companies')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View All Companies →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by uploading your first company to the database.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate('/search')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Browse Companies
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">Freemium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Searches Left</span>
                  <span className="font-medium">10/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Renewal</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Calls</span>
                  <span className="font-medium">0/100</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                Upgrade Now
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                    >
                      <div className={`${action.bgColor} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        <IconComponent className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="text-xs font-medium text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Company "TechCorp" added</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Search performed</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Report generated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;