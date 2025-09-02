import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, TrendingUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../lib/searchService';
import WatchlistStatus from './WatchlistStatus';

const SearchAutocomplete = ({ placeholder = "Search for companies, CINs, or sectors...", className = "", onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchService.searchCompanies(searchQuery, 6);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (company) => {
    navigate(`/company/${company.id}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        // If onSearch prop is provided, use it (for SearchPage)
        onSearch(searchQuery.trim());
      } else {
        // Otherwise navigate to search page (for Hero section)
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleViewAll = () => {
    if (onSearch) {
      // If onSearch prop is provided, use it (for SearchPage)
      onSearch(searchQuery.trim());
    } else {
      // Otherwise navigate to search page (for Hero section)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setShowSuggestions(false);
  };

  const formatCompanyInfo = (company) => {
    const info = [];
    if (company.sector) info.push(company.sector);
    if (company.company_type) info.push(company.company_type);
    if (company.is_listed) info.push('Listed');
    return info.join(' • ');
  };

  const getCompanyIcon = (company) => {
    if (company.is_listed) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <Building2 className="h-4 w-4 text-blue-600" />;
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return null;
    
    if (marketCap >= 10000000000) { // 1000 crores
      return `₹${(marketCap / 10000000000).toFixed(1)}K Cr`;
    } else if (marketCap >= 100000000) { // 10 crores
      return `₹${(marketCap / 100000000).toFixed(1)} Cr`;
    } else if (marketCap >= 1000000) { // 10 lakhs
      return `₹${(marketCap / 1000000).toFixed(1)}M`;
    }
    return `₹${marketCap.toLocaleString()}`;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 text-lg border-2 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
                 <button 
           type="submit"
           className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
         >
          Search
        </button>
      </form>

             {/* Loading indicator */}
       {isLoading && (
         <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
           <div className="rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
         </div>
       )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((company, index) => (
            <div
              key={company.id}
              onClick={() => handleSuggestionClick(company)}
                             className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer ${
                 index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
               } ${index < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Company Logo/Icon */}
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="h-8 w-8 rounded object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`h-8 w-8 rounded bg-gray-100 flex items-center justify-center ${company.logo_url ? 'hidden' : ''}`}>
                  {getCompanyIcon(company)}
                </div>
              </div>
              
              {/* Company Info - Left Aligned */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 text-left">
                    {/* Company Name */}
                    <h4 className="text-sm font-semibold text-gray-900 truncate mb-1 text-left">
                      {company.name}
                    </h4>
                    
                    {/* Sector and Company Type */}
                    <p className="text-xs text-gray-500 truncate text-left">
                      {formatCompanyInfo(company)}
                    </p>
                  </div>
                  
                  {/* Right side tags and info */}
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <WatchlistStatus company={company} size="sm" />
                    {company.is_listed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Listed
                      </span>
                    )}
                    {company.market_cap && (
                      <span className="text-xs text-gray-500 font-medium">
                        {formatMarketCap(company.market_cap)}
                      </span>
                    )}
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* View all results */}
          <div className="border-t border-gray-200">
                         <button
               onClick={handleViewAll}
               className="w-full p-4 text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-center"
             >
              View all results for "{searchQuery}"
              <ExternalLink className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;