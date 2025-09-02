import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Building2, 
  TrendingUp, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import Header from '../components/common/Header';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import { searchService } from '../lib/searchService';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import WatchlistStatus from '../components/common/WatchlistStatus';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  
  // State
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    sectors: [],
    revenueRanges: [],
    employeeRanges: [],
    locations: []
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('q') || '',
    sector: 'all',
    companyType: 'all',
    isListed: null,
    revenueRange: 'all',
    employeeRange: 'all',
    location: '',
    minRevenue: '',
    maxRevenue: '',
    minProfit: '',
    maxProfit: '',
    sortBy: 'name'
  });

  const resultsPerPage = 20;

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
    // Clear URL parameters on page load if no search query
    if (!searchParams.get('q')) {
      setSearchParams({});
    }
  }, []);

  // Clear search on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear search params when page is refreshed
      setSearchParams({});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [setSearchParams]);

  // Perform search when filters change
  useEffect(() => {
    if (filters.searchQuery || Object.values(filters).some(v => v !== 'all' && v !== '' && v !== null)) {
      performSearch();
    }
  }, [filters, currentPage]);

  const loadFilterOptions = async () => {
    try {
      const options = await searchService.getFilterOptions();
      console.log('Available filter options:', options);
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      console.log('Searching with filters:', filters);
      const searchResult = await searchService.advancedSearch(filters, currentPage, resultsPerPage, user?.id);
      console.log('Search results:', searchResult);
      setResults(searchResult.results);
      setTotalResults(searchResult.total);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchSubmit = (query) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      sector: 'all',
      companyType: 'all',
      isListed: null,
      revenueRange: 'all',
      employeeRange: 'all',
      location: '',
      minRevenue: '',
      maxRevenue: '',
      minProfit: '',
      maxProfit: '',
      sortBy: 'name'
    });
    setCurrentPage(1);
    // Clear URL parameters
    setSearchParams({});
  };

  const clearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
    setCurrentPage(1);
    // Clear URL parameters
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Check each filter explicitly (excluding searchQuery and sortBy)
    if (filters.sector !== 'all') count++;
    if (filters.companyType !== 'all') count++;
    if (filters.isListed !== null) count++;
    if (filters.revenueRange !== 'all') count++;
    if (filters.employeeRange !== 'all') count++;
    if (filters.location && filters.location.trim() !== '') count++;
    if (filters.minRevenue && filters.minRevenue.trim() !== '') count++;
    if (filters.maxRevenue && filters.maxRevenue.trim() !== '') count++;
    if (filters.minProfit && filters.minProfit.trim() !== '') count++;
    if (filters.maxProfit && filters.maxProfit.trim() !== '') count++;
    
    return count;
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
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    }
    return <Building2 className="h-5 w-5 text-blue-600" />;
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

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={() => navigate('/login')}
        onLogout={() => navigate('/')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Companies</h1>
          <p className="text-gray-600">
            Find and filter Indian companies with comprehensive financial data and insights
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchAutocomplete 
            placeholder="Search for companies, CINs, or sectors..."
            className="w-full"
            onSearch={handleSearchSubmit}
          />
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {totalResults > 0 && `${totalResults} results found`}
            </div>
            {filters.searchQuery && (
              <button
                onClick={clearSearch}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="Clear search"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                <select
                  value={filters.sector}
                  onChange={(e) => handleFilterChange('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sectors</option>
                  {filterOptions.sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector.charAt(0).toUpperCase() + sector.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Type</label>
                <select
                  value={filters.companyType}
                  onChange={(e) => handleFilterChange('companyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>

              {/* Listing Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Status</label>
                <select
                  value={filters.isListed === null ? 'all' : filters.isListed.toString()}
                  onChange={(e) => handleFilterChange('isListed', e.target.value === 'all' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Companies</option>
                  <option value="true">Listed Only</option>
                  <option value="false">Unlisted Only</option>
                </select>
              </div>

              {/* Revenue Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Range</label>
                <select
                  value={filters.revenueRange}
                  onChange={(e) => handleFilterChange('revenueRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Ranges</option>
                  <option value="under-1cr">Under ₹1 Cr</option>
                  <option value="1cr-10cr">₹1 Cr - ₹10 Cr</option>
                  <option value="10cr-50cr">₹10 Cr - ₹50 Cr</option>
                  <option value="50cr-100cr">₹50 Cr - ₹100 Cr</option>
                  <option value="above-100cr">Above ₹100 Cr</option>
                </select>
              </div>

              {/* Employee Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Range</label>
                <select
                  value={filters.employeeRange}
                  onChange={(e) => handleFilterChange('employeeRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Ranges</option>
                  {filterOptions.employeeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Custom Revenue Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Revenue (₹ Cr)</label>
                <input
                  type="number"
                  value={filters.minRevenue}
                  onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Company Name</option>
                  <option value="total_revenue">Revenue (High to Low)</option>
                  <option value="net_profit">Profit (High to Low)</option>
                  <option value="market_cap">Market Cap (High to Low)</option>
                  <option value="founded_date">Founded Date (Newest)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching companies...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find more results.
              </p>
            </div>
          ) : (
            <>
              {/* Results List */}
              <div className="divide-y divide-gray-200">
                {results.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => navigate(`/company/${company.id}`)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name}
                            className="h-12 w-12 rounded object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div className={`h-12 w-12 rounded bg-gray-100 flex items-center justify-center ${company.logo_url ? 'hidden' : ''}`}>
                          {getCompanyIcon(company)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {company.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <WatchlistStatus company={company} />
                            {company.is_listed && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Listed
                              </span>
                            )}
                            {company.market_cap && (
                              <span className="text-sm text-gray-600">
                                {formatMarketCap(company.market_cap)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {formatCompanyInfo(company)}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {company.founded_date && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Founded {new Date(company.founded_date).getFullYear()}
                            </div>
                          )}
                          {company.employee_count && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {company.employee_count} employees
                            </div>
                          )}
                          {company.annual_revenue_range && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {company.annual_revenue_range}
                            </div>
                          )}
                        </div>
                        
                        {company.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {company.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;