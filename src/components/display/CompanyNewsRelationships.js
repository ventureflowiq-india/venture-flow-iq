import React from 'react';
import { 
  Newspaper, 
  Tag, 
  ExternalLink, 
  Link, 
  TrendingUp, 
  TrendingDown, 
  Building,
  Star,
  Globe
} from 'lucide-react';

const CompanyNewsRelationships = ({ companyData }) => {
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

  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'Not specified';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const getSentimentColor = (sentiment) => {
    const sentimentColors = {
      'POSITIVE': 'bg-green-100 text-green-800 border-green-200',
      'NEGATIVE': 'bg-red-100 text-red-800 border-red-200',
      'NEUTRAL': 'bg-gray-100 text-gray-800 border-gray-200',
      'MIXED': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return sentimentColors[sentiment] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <TrendingUp className="h-4 w-4" />;
      case 'NEGATIVE':
        return <TrendingDown className="h-4 w-4" />;
      case 'NEUTRAL':
        return <Newspaper className="h-4 w-4" />;
      case 'MIXED':
        return <Globe className="h-4 w-4" />;
      default:
        return <Newspaper className="h-4 w-4" />;
    }
  };

  const formatRelationshipType = (type) => {
    if (!type) return 'Other';
    
    const typeLabels = {
      // Current database enum values
      'SUBSIDIARY': 'Subsidiary',
      'JOINT_VENTURE': 'Joint Venture',
      'ASSOCIATE': 'Associate',
      'BRANCH': 'Branch',
      'DIVISION': 'Division',
      'OTHER': 'Other',
      // New proposed relationship types (will work once added to database)
      'WHOLLY_OWNED_SUBSIDIARY': 'Wholly Owned Subsidiary',
      'PARENT_COMPANY': 'Parent Company',
      'MINORITY_INVESTMENT': 'Minority Investment (<20% ownership)',
      'SISTER_COMPANY': 'Sister Company',
      'AFFILIATE': 'Affiliate',
      'PARTNERSHIP': 'Partnership'
    };
    
    return typeLabels[type] || type.replace(/_/g, ' ');
  };

  const getRelationshipTypeColor = (type) => {
    const typeColors = {
      'SUBSIDIARY': 'bg-blue-100 text-blue-800 border-blue-200',
      'WHOLLY_OWNED_SUBSIDIARY': 'bg-blue-200 text-blue-900 border-blue-300',
      'PARENT_COMPANY': 'bg-green-100 text-green-800 border-green-200',
      'JOINT_VENTURE': 'bg-purple-100 text-purple-800 border-purple-200',
      'ASSOCIATE': 'bg-teal-100 text-teal-800 border-teal-200',
      'MINORITY_INVESTMENT': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'BRANCH': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'DIVISION': 'bg-lime-100 text-lime-800 border-lime-200',
      'SISTER_COMPANY': 'bg-pink-100 text-pink-800 border-pink-200',
      'AFFILIATE': 'bg-orange-100 text-orange-800 border-orange-200',
      'PARTNERSHIP': 'bg-amber-100 text-amber-800 border-amber-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRelationshipStatusColor = (status) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'INACTIVE': 'bg-gray-100 text-gray-800 border-gray-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'TERMINATED': 'bg-red-100 text-red-800 border-red-200',
      'SUSPENDED': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRelationshipIcon = (type) => {
    const iconMap = {
      'SUBSIDIARY': <Building className="h-5 w-5 text-blue-600" />,
      'WHOLLY_OWNED_SUBSIDIARY': <Building className="h-5 w-5 text-blue-700" />,
      'PARENT_COMPANY': <Building className="h-5 w-5 text-green-600" />,
      'JOINT_VENTURE': <Link className="h-5 w-5 text-purple-600" />,
      'ASSOCIATE': <Link className="h-5 w-5 text-teal-600" />,
      'MINORITY_INVESTMENT': <TrendingUp className="h-5 w-5 text-indigo-600" />,
      'BRANCH': <Building className="h-5 w-5 text-cyan-600" />,
      'DIVISION': <Building className="h-5 w-5 text-lime-600" />,
      'SISTER_COMPANY': <Building className="h-5 w-5 text-pink-600" />,
      'AFFILIATE': <Link className="h-5 w-5 text-orange-600" />,
      'PARTNERSHIP': <Link className="h-5 w-5 text-amber-600" />,
      'OTHER': <Link className="h-5 w-5 text-gray-600" />
    };
    return iconMap[type] || <Link className="h-5 w-5 text-gray-600" />;
  };

  const getRelevanceStars = (score) => {
    if (!score) return null;
    const rating = Math.min(Math.max(parseFloat(score), 0), 10);
    const filledStars = Math.round(rating / 2);
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < filledStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-600">{rating}/10</span>
      </div>
    );
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">News & Relationships Information</h3>
      
      {/* Summary Stats */}
      {(companyData.company_news?.length > 0 || companyData.company_relationships?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">News Articles</span>
              <Newspaper className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {companyData.company_news?.length || 0}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Relationships</span>
              <Link className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {companyData.company_relationships?.filter(rel => rel.parent_company_id !== rel.subsidiary_company_id).length || 0}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Positive News</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {companyData.company_news?.filter(news => news.sentiment === 'POSITIVE').length || 0}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Active Relations</span>
              <Building className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {companyData.company_relationships?.filter(rel => rel.parent_company_id !== rel.subsidiary_company_id && rel.relationship_status !== 'TERMINATED').length || 0}
            </div>
          </div>
        </div>
      )}
      
      {/* Company News */}
      {companyData.company_news && companyData.company_news.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Newspaper className="h-5 w-5 text-purple-600 mr-2" />
            Company News & Updates ({companyData.company_news.length})
          </h4>
          
          <div className="space-y-4">
            {companyData.company_news.map((news, index) => (
              <div key={news.id || index} className="bg-purple-50 rounded-lg p-6 border border-purple-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Newspaper className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xl font-bold text-gray-900 mb-2">
                        <span className="text-gray-900">
                          {news.title || 'News Article'}
                        </span>
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        {news.source_name || 'News Source'} • {formatDate(news.published_date)}
                      </p>
                      {news.relevance_score && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-gray-500 mr-2">Relevance:</span>
                          {getRelevanceStars(news.relevance_score)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border flex-shrink-0 ${getSentimentColor(news.sentiment)}`}>
                    {getSentimentIcon(news.sentiment)}
                    <span className="ml-2">{news.sentiment || 'Neutral'}</span>
                  </span>
                </div>
                
                {news.summary && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Summary</h6>
                    <p className="text-sm text-gray-900 leading-relaxed">{news.summary}</p>
                  </div>
                )}
                
                {news.content && (
                  <div className="mb-4">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Content</h6>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {truncateText(news.content, 300)}
                    </p>
                  </div>
                )}
                
                {news.tags && news.tags.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Tags
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {news.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium bg-white text-purple-800 rounded-full border border-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-purple-200">
                  <div className="text-xs text-gray-500">
                    Published: {formatDate(news.published_date)}
                  </div>
                  
                                     {news.source_url && (
                     <div className="flex space-x-2">
                       <a
                         href={news.source_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors font-medium"
                       >
                         <ExternalLink className="h-4 w-4 mr-2" />
                         Read Full Article
                       </a>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Relationships */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
          <Link className="h-5 w-5 text-blue-600 mr-2" />
          Company Relationships ({companyData.company_relationships?.filter(rel => rel.parent_company_id !== rel.subsidiary_company_id).length || 0})
        </h4>
        
        {companyData.company_relationships && companyData.company_relationships.filter(rel => rel.parent_company_id !== rel.subsidiary_company_id).length > 0 ? (
          <div className="space-y-4">
            {companyData.company_relationships
              .filter(relationship => relationship.parent_company_id !== relationship.subsidiary_company_id) // Filter out invalid relationships
              .map((relationship, index) => (
                <div key={relationship.id || index} className="bg-blue-50 rounded-lg p-6 border border-blue-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getRelationshipIcon(relationship.relationship_type)}
                      </div>
                      <div>
                                                                         <h5 className="text-xl font-bold text-gray-900">
                          {relationship.related_company_name || 'Related Company'}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {formatDate(relationship.effective_date)} • {formatRelationshipType(relationship.relationship_type)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getRelationshipTypeColor(relationship.relationship_type)}`}>
                        {formatRelationshipType(relationship.relationship_type)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getRelationshipStatusColor(relationship.relationship_status)}`}>
                        {relationship.relationship_status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    <div className="space-y-3">
                      <h6 className="text-sm font-semibold text-gray-700 uppercase">Relationship Details</h6>
                      
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Effective Date:</span>
                        <span className="text-gray-900 ml-2">{formatDate(relationship.effective_date)}</span>
                      </div>
                      
                      {relationship.end_date && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">End Date:</span>
                          <span className="text-gray-900 ml-2">{formatDate(relationship.end_date)}</span>
                        </div>
                      )}
                      
                      {relationship.business_nature && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Business Nature:</span>
                          <p className="text-gray-900 mt-1">{relationship.business_nature}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h6 className="text-sm font-semibold text-gray-700 uppercase">Financial Terms</h6>
                      
                      {relationship.ownership_percentage && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Ownership:</span>
                          <span className="text-gray-900 ml-2 font-semibold">{formatPercentage(relationship.ownership_percentage)}</span>
                        </div>
                      )}
                      
                      {relationship.acquisition_value && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Acquisition Value:</span>
                          <span className="text-gray-900 ml-2 font-semibold">{formatCurrency(relationship.acquisition_value)}</span>
                        </div>
                      )}
                      
                      {relationship.contract_value && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Contract Value:</span>
                          <span className="text-gray-900 ml-2 font-semibold">{formatCurrency(relationship.contract_value)}</span>
                        </div>
                      )}
                      
                      {relationship.contract_terms && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Contract Terms:</span>
                          <span className="text-gray-900 ml-2">{relationship.contract_terms}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h6 className="text-sm font-semibold text-gray-700 uppercase">Additional Information</h6>
                      
                      {relationship.description && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Description:</span>
                          <p className="text-gray-900 mt-1 text-xs leading-relaxed">{relationship.description}</p>
                        </div>
                      )}
                      
                      {relationship.remarks && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Remarks:</span>
                          <p className="text-gray-900 mt-1 text-xs leading-relaxed">{relationship.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
            <Link className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Company Relationships</h4>
            <p className="text-gray-500">
              This company doesn't have any relationship information uploaded yet.
            </p>
          </div>
        )}
      </div>

      {/* No Data Message */}
      {(!companyData.company_news || companyData.company_news.length === 0) && (
        <div className="text-center py-12">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No News Information</h4>
          <p className="text-gray-500">
            This company doesn't have any news articles uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyNewsRelationships;