import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Building2, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  TrendingUp,
  Users,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import Header from '../components/common/Header';
import { watchlistService } from '../lib/watchlistService';

const WatchlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchWatchlists();
    }
  }, [user]);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const data = await watchlistService.getUserWatchlists(user.id);
      setWatchlists(data);
      if (data.length > 0 && !selectedWatchlist) {
        setSelectedWatchlist(data[0]);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    try {
      await watchlistService.createWatchlist(user.id, formData.name, formData.description);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchWatchlists();
    } catch (error) {
      console.error('Error creating watchlist:', error);
    }
  };

  const handleUpdateWatchlist = async (e) => {
    e.preventDefault();
    try {
      await watchlistService.updateWatchlist(editingWatchlist.id, formData);
      setShowEditModal(false);
      setEditingWatchlist(null);
      setFormData({ name: '', description: '' });
      fetchWatchlists();
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleDeleteWatchlist = async () => {
    try {
      await watchlistService.deleteWatchlist(editingWatchlist.id);
      setShowDeleteModal(false);
      setEditingWatchlist(null);
      setSelectedWatchlist(null);
      fetchWatchlists();
    } catch (error) {
      console.error('Error deleting watchlist:', error);
    }
  };

  const handleRemoveCompany = async (watchlistId, companyId) => {
    try {
      await watchlistService.removeCompanyFromWatchlist(watchlistId, companyId);
      
      // Update local state immediately instead of fetching all data again
      setWatchlists(prevWatchlists => 
        prevWatchlists.map(watchlist => {
          if (watchlist.id === watchlistId) {
            return {
              ...watchlist,
              watchlist_companies: watchlist.watchlist_companies.filter(
                company => company.company_id !== companyId
              )
            };
          }
          return watchlist;
        })
      );
      
      // Update selected watchlist if it's the one being modified
      if (selectedWatchlist && selectedWatchlist.id === watchlistId) {
        setSelectedWatchlist(prev => ({
          ...prev,
          watchlist_companies: prev.watchlist_companies.filter(
            company => company.company_id !== companyId
          )
        }));
      }
    } catch (error) {
      console.error('Error removing company:', error);
    }
  };

  const openEditModal = (watchlist) => {
    setEditingWatchlist(watchlist);
    setFormData({
      name: watchlist.name,
      description: watchlist.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (watchlist) => {
    setEditingWatchlist(watchlist);
    setShowDeleteModal(true);
  };

  const filteredWatchlists = watchlists.filter(watchlist => {
    const matchesSearch = watchlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (watchlist.description && watchlist.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'empty') return matchesSearch && (!watchlist.watchlist_companies || watchlist.watchlist_companies.length === 0);
    if (filterType === 'populated') return matchesSearch && watchlist.watchlist_companies && watchlist.watchlist_companies.length > 0;
    
    return matchesSearch;
  });

  const getCompanyCount = (watchlist) => {
    return watchlist.watchlist_companies?.length || 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Star className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to access your watchlists</h2>
            <p className="text-gray-600 mb-6">Create and manage your company watchlists</p>
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
              <h1 className="text-2xl font-bold text-gray-900">My Watchlists</h1>
              <p className="text-gray-600">Track and monitor your favorite companies</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Watchlist
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your watchlists...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Watchlist List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search watchlists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Watchlists</option>
                    <option value="populated">With Companies</option>
                    <option value="empty">Empty</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {filteredWatchlists.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-600 text-sm">No watchlists found</p>
                    </div>
                  ) : (
                    filteredWatchlists.map((watchlist) => (
                      <div
                        key={watchlist.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedWatchlist?.id === watchlist.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => setSelectedWatchlist(watchlist)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{watchlist.name}</h3>
                            <p className="text-sm text-gray-500">
                              {getCompanyCount(watchlist)} companies
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(watchlist);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(watchlist);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Content - Selected Watchlist */}
            <div className="lg:col-span-3">
              {selectedWatchlist ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  {/* Watchlist Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedWatchlist.name}</h2>
                        {selectedWatchlist.description && (
                          <p className="text-gray-600 mt-1">{selectedWatchlist.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Created {formatDate(selectedWatchlist.created_at)} • {getCompanyCount(selectedWatchlist)} companies
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate('/search')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Companies
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Companies List */}
                  <div className="p-6">
                    {selectedWatchlist.watchlist_companies && selectedWatchlist.watchlist_companies.length > 0 ? (
                      <div className="space-y-4">
                        {selectedWatchlist.watchlist_companies.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{item.companies.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {item.companies.sector} • {item.companies.company_type}
                                </p>
                                {item.notes && (
                                  <p className="text-sm text-gray-500 mt-1 italic">"{item.notes}"</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Added {formatDate(item.added_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/company/${item.company_id}`)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleRemoveCompany(selectedWatchlist.id, item.company_id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                        <p className="text-gray-600 mb-6">
                          Start building your watchlist by adding companies you want to track.
                        </p>
                        <button
                          onClick={() => navigate('/search')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Browse Companies
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                  <Star className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No watchlist selected</h3>
                  <p className="text-gray-600 mb-6">
                    Select a watchlist from the sidebar or create a new one to get started.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Watchlist
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Watchlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWatchlist}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Watchlist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Tech Companies, Investment Targets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional description of this watchlist"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Watchlist Modal */}
      {showEditModal && editingWatchlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Watchlist</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateWatchlist}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Watchlist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && editingWatchlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Watchlist</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{editingWatchlist.name}"? This action cannot be undone and will remove all companies from this watchlist.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWatchlist}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
