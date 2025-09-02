import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Plus, Star, Check, AlertCircle } from 'lucide-react';
import { watchlistService } from '../../lib/watchlistService';

const AddToWatchlistModal = ({ 
  isOpen, 
  onClose, 
  company, 
  onSuccess,
  showCreateOption = true 
}) => {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [notes, setNotes] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchWatchlists();
    }
  }, [isOpen, user]);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const data = await watchlistService.getUserWatchlists(user.id);
      setWatchlists(data);
      
      // Check if company is already in any watchlist
      const companyWatchlists = await watchlistService.isCompanyInWatchlists(user.id, company.id);
      if (companyWatchlists.length > 0) {
        setSelectedWatchlist(companyWatchlists[0].watchlist_id);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      setError('Failed to load watchlists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) {
      setError('Please select a watchlist');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await watchlistService.addCompanyToWatchlist(selectedWatchlist, company.id, notes);
      
      setSuccess('Company added to watchlist successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      setError(error.message || 'Failed to add company to watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const newWatchlist = await watchlistService.createWatchlist(
        user.id, 
        createFormData.name, 
        createFormData.description
      );
      
      // Add company to the new watchlist
      await watchlistService.addCompanyToWatchlist(newWatchlist.id, company.id, notes);
      
      setSuccess('Watchlist created and company added successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error creating watchlist:', error);
      setError(error.message || 'Failed to create watchlist');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedWatchlist('');
    setNotes('');
    setShowCreateForm(false);
    setCreateFormData({ name: '', description: '' });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add to Watchlist</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Company Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{company.name}</h4>
              <p className="text-sm text-gray-600">
                {company.sector} • {company.company_type}
              </p>
            </div>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6">
            <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-green-600 font-medium">{success}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {showCreateForm ? (
              // Create New Watchlist Form
              <form onSubmit={handleCreateWatchlist}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Watchlist Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Tech Companies"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add notes about this company..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create & Add'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // Add to Existing Watchlist
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Watchlist
                  </label>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : watchlists.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-3">No watchlists found</p>
                      {showCreateOption && (
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Create your first watchlist
                        </button>
                      )}
                    </div>
                  ) : (
                    <select
                      value={selectedWatchlist}
                      onChange={(e) => setSelectedWatchlist(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a watchlist...</option>
                      {watchlists.map((watchlist) => (
                        <option key={watchlist.id} value={watchlist.id}>
                          {watchlist.name} ({watchlist.watchlist_companies?.length || 0} companies)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about this company..."
                    rows={2}
                  />
                </div>

                {/* Fixed Button Layout */}
                <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
                  <div className="flex items-center space-x-3">
                    {showCreateOption && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Watchlist
                      </button>
                    )}
                    <button
                      onClick={handleAddToWatchlist}
                      disabled={loading || !selectedWatchlist}
                      className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add to Watchlist'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddToWatchlistModal;