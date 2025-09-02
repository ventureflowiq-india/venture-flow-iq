import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Plus } from 'lucide-react';
import { watchlistService } from '../../lib/watchlistService';
import AddToWatchlistModal from './AddToWatchlistModal';

const WatchlistStatus = ({ company, size = 'sm', showModal = true }) => {
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistNames, setWatchlistNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user && company) {
      checkWatchlistStatus();
    }
  }, [user, company]);

  const checkWatchlistStatus = async () => {
    try {
      setLoading(true);
      const watchlists = await watchlistService.isCompanyInWatchlists(user.id, company.id);
      setIsInWatchlist(watchlists.length > 0);
      setWatchlistNames(watchlists.map(w => w.watchlists.name));
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (e) => {
    // Stop event propagation to prevent parent click handlers
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login or show login modal
      return;
    }
    if (showModal) {
      setShowAddModal(true);
    }
  };

  const handleSuccess = () => {
    checkWatchlistStatus();
  };

  if (!user) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  if (loading) {
    return (
      <div className={`${buttonClasses[size]} text-gray-400`}>
        <div className="animate-spin rounded-full h-full w-full border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (isInWatchlist) {
    return (
      <div className="relative group">
        <button
          onClick={(e) => e.stopPropagation()}
          className={`${buttonClasses[size]} text-yellow-500 hover:text-yellow-600 transition-colors`}
          title={`In watchlist${watchlistNames.length > 1 ? 's' : ''}: ${watchlistNames.join(', ')}`}
        >
          <Star className={sizeClasses[size]} fill="currentColor" />
        </button>
        {watchlistNames.length > 0 && (
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            In: {watchlistNames.join(', ')}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleAddToWatchlist}
        className={`${buttonClasses[size]} text-gray-400 hover:text-yellow-500 transition-colors`}
        title="Add to watchlist"
      >
        <Plus className={sizeClasses[size]} />
      </button>
      
      {showAddModal && (
        <AddToWatchlistModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          company={company}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default WatchlistStatus;
