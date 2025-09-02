import React from 'react';
import { Building2, Globe, Calendar, Users, TrendingUp, Award, ExternalLink } from 'lucide-react';

const CompanyBasicInfo = ({ companyData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Not specified';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `₹${amount}`;
    }
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return 'Not specified';
    try {
      return new Intl.NumberFormat('en-IN').format(num);
    } catch (error) {
      return num.toString();
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'SUSPENDED': 'bg-yellow-100 text-yellow-800',
      'LIQUIDATED': 'bg-red-100 text-red-800',
      'MERGED': 'bg-blue-100 text-blue-800',
      'ACQUIRED': 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCompanyTypeColor = (type) => {
    const typeColors = {
      'PRIVATE': 'bg-blue-100 text-blue-800',
      'PUBLIC': 'bg-green-100 text-green-800',
      'GOVERNMENT': 'bg-purple-100 text-purple-800',
      'NGO': 'bg-orange-100 text-orange-800',
      'PARTNERSHIP': 'bg-indigo-100 text-indigo-800',
      'PROPRIETORSHIP': 'bg-pink-100 text-pink-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSectorColor = (sector) => {
    const sectorColors = {
      'technology': 'bg-blue-100 text-blue-800',
      'healthcare': 'bg-green-100 text-green-800',
      'finance': 'bg-purple-100 text-purple-800',
      'manufacturing': 'bg-orange-100 text-orange-800',
      'retail': 'bg-pink-100 text-pink-800',
      'education': 'bg-indigo-100 text-indigo-800',
      'real-estate': 'bg-yellow-100 text-yellow-800'
    };
    return sectorColors[sector] || 'bg-indigo-100 text-indigo-800';
  };

  // Function to get proper Supabase storage URL
  const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already full URL
    // Construct Supabase storage URL
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    if (!supabaseUrl) return null;
    return `${supabaseUrl}/storage/v1/object/public/company-assets/${path}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Company Information</h3>
        <div className="text-xs text-gray-500">
          Last updated: {formatDate(companyData.updated_at)}
        </div>
      </div>
      
      {/* Company Logo and Name Section */}
      <div className="flex items-start space-x-6 mb-8">
        <div className="flex-shrink-0">
          {companyData.logo_url ? (
            <div className="relative">
              <img 
                src={getStorageUrl(companyData.logo_url)} 
                alt={`${companyData.name} logo`}
                className="h-24 w-24 object-contain border border-gray-200 rounded-lg shadow-sm bg-white p-2"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div 
                className="h-24 w-24 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hidden items-center justify-center"
              >
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="h-24 w-24 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{companyData.name}</h2>
          {companyData.legal_name && companyData.legal_name !== companyData.name && (
            <p className="text-lg text-gray-600 mb-2">Legal Name: {companyData.legal_name}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(companyData.status)}`}>
              {companyData.status}
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCompanyTypeColor(companyData.company_type)}`}>
              {companyData.company_type}
            </span>
            {companyData.sector && (
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getSectorColor(companyData.sector)}`}>
                {companyData.sector.charAt(0).toUpperCase() + companyData.sector.slice(1).replace('-', ' ')}
              </span>
            )}
            {companyData.is_listed && (
              <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                <Award className="h-4 w-4 mr-1" />
                Listed Company
              </span>
            )}
          </div>
          {companyData.description && (
            <p className="text-gray-700 leading-relaxed">{companyData.description}</p>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {companyData.founded_date && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-3">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h5 className="text-sm font-medium text-gray-500 text-center mb-1">Founded</h5>
            <p className="text-lg font-semibold text-gray-900 text-center">{formatDate(companyData.founded_date)}</p>
          </div>
        )}

        {companyData.employee_count && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-3">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <h5 className="text-sm font-medium text-gray-500 text-center mb-1">Employees</h5>
            <p className="text-lg font-semibold text-gray-900 text-center">{formatNumber(companyData.employee_count)}</p>
            {companyData.employee_range && (
              <p className="text-xs text-gray-500 text-center mt-1">Range: {companyData.employee_range}</p>
            )}
          </div>
        )}

        {companyData.market_cap && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h5 className="text-sm font-medium text-gray-500 text-center mb-1">Market Cap</h5>
            <p className="text-lg font-semibold text-gray-900 text-center">{formatCurrency(companyData.market_cap)}</p>
          </div>
        )}

        {companyData.annual_revenue_range && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <h5 className="text-sm font-medium text-gray-500 text-center mb-1">Revenue Range</h5>
            <p className="text-lg font-semibold text-gray-900 text-center">{companyData.annual_revenue_range}</p>
          </div>
        )}
      </div>

      {/* Regulatory Information */}
      {(companyData.cin || companyData.gst || companyData.pan) && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4">Regulatory Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companyData.cin && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="text-xs font-medium text-gray-500 mb-2">Corporate Identity Number (CIN)</h5>
                <p className="text-sm font-mono text-gray-900 break-all">{companyData.cin}</p>
              </div>
            )}
            {companyData.gst && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="text-xs font-medium text-gray-500 mb-2">GST Number</h5>
                <p className="text-sm font-mono text-gray-900 break-all">{companyData.gst}</p>
              </div>
            )}
            {companyData.pan && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="text-xs font-medium text-gray-500 mb-2">PAN</h5>
                <p className="text-sm font-mono text-gray-900">{companyData.pan}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Information */}
      {companyData.is_listed && (companyData.stock_exchange || companyData.stock_symbol || companyData.isin) && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Award className="h-5 w-5 text-yellow-600 mr-2" />
            Stock Exchange Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companyData.stock_exchange && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="text-xs font-medium text-gray-500 mb-2">Stock Exchange</h5>
                <p className="text-sm font-semibold text-gray-900">{companyData.stock_exchange}</p>
              </div>
            )}
            {companyData.stock_symbol && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="text-xs font-medium text-gray-500 mb-2">Stock Symbol</h5>
                <p className="text-sm font-mono font-semibold text-gray-900">{companyData.stock_symbol}</p>
              </div>
            )}
            {companyData.isin && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="text-xs font-medium text-gray-500 mb-2">ISIN</h5>
                <p className="text-sm font-mono text-gray-900">{companyData.isin}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Online Presence */}
      {(companyData.website || companyData.linkedin_url) && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Globe className="h-5 w-5 text-blue-600 mr-2" />
            Online Presence
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyData.website && (
              <a 
                href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <Globe className="h-5 w-5 text-blue-600 mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">Company Website</p>
                  <p className="text-sm text-blue-700 truncate">{companyData.website}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
            {companyData.linkedin_url && (
              <a 
                href={companyData.linkedin_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="w-5 h-5 bg-blue-600 rounded mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">LinkedIn Profile</p>
                  <p className="text-sm text-blue-700 truncate">View company profile</p>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {(companyData.employee_range && !companyData.employee_count) && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Additional Information</h4>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h5 className="text-xs font-medium text-gray-500 mb-2">Employee Range</h5>
            <p className="text-sm text-gray-900">{companyData.employee_range}</p>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Created:</span> {formatDate(companyData.created_at)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDate(companyData.updated_at)}
          </div>
          <div>
            <span className="font-medium">Company ID:</span> {companyData.id}
          </div>
          {companyData.name_lowercase && (
            <div>
              <span className="font-medium">Search Key:</span> {companyData.name_lowercase}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyBasicInfo;