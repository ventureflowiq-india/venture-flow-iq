import React from 'react';
import { DollarSign, TrendingUp, Users, Target, Activity, ArrowUpRight, ArrowDownLeft, Percent } from 'lucide-react';

const CompanyFundingInvestment = ({ companyData }) => {
  console.log('📊 CompanyFundingInvestment received data:', {
    funding_rounds: companyData.funding_rounds,
    company_investments: companyData.company_investments,
    funding_rounds_length: companyData.funding_rounds?.length,
    company_investments_length: companyData.company_investments?.length,
    fullCompanyData: companyData
  });
  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount || amount === 0) return 'Not specified';
    try {
      const currencyCode = currency || 'INR';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `${currency || '₹'}${amount}`;
    }
  };

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

  const formatPercentage = (value) => {
    if (!value || value === 0) return 'Not specified';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const formatMultiple = (value) => {
    if (!value || value === 0) return 'Not specified';
    return `${parseFloat(value).toFixed(2)}x`;
  };

  const getRoundTypeColor = (type) => {
    const typeColors = {
      'SEED': 'bg-green-100 text-green-800 border-green-200',
      'SERIES_A': 'bg-blue-100 text-blue-800 border-blue-200',
      'SERIES_B': 'bg-purple-100 text-purple-800 border-purple-200',
      'SERIES_C': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'SERIES_D': 'bg-pink-100 text-pink-800 border-pink-200',
      'SERIES_E': 'bg-orange-100 text-orange-800 border-orange-200',
      'SERIES_F': 'bg-red-100 text-red-800 border-red-200',
      'PRE_IPO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'IPO': 'bg-yellow-200 text-yellow-900 border-yellow-300',
      'POST_IPO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'DEBT': 'bg-gray-100 text-gray-800 border-gray-200',
      'GRANT': 'bg-teal-100 text-teal-800 border-teal-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoundStatusColor = (status) => {
    const statusColors = {
      'ANNOUNCED': 'bg-blue-100 text-blue-800 border-blue-200',
      'CLOSED': 'bg-green-100 text-green-800 border-green-200',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getInvestmentStatusColor = (status) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'EXITED': 'bg-blue-100 text-blue-800 border-blue-200',
      'LIQUIDATED': 'bg-red-100 text-red-800 border-red-200',
      'HOLDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PARTIAL_EXIT': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getExitTypeColor = (type) => {
    const typeColors = {
      'IPO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ACQUISITION': 'bg-blue-100 text-blue-800 border-blue-200',
      'MERGER': 'bg-purple-100 text-purple-800 border-purple-200',
      'BUYBACK': 'bg-green-100 text-green-800 border-green-200',
      'SECONDARY_SALE': 'bg-orange-100 text-orange-800 border-orange-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoundTypeLabel = (type) => {
    const typeLabels = {
      'SEED': 'Seed Round',
      'SERIES_A': 'Series A',
      'SERIES_B': 'Series B',
      'SERIES_C': 'Series C',
      'SERIES_D': 'Series D',
      'SERIES_E': 'Series E',
      'SERIES_F': 'Series F',
      'PRE_IPO': 'Pre-IPO',
      'IPO': 'Initial Public Offering',
      'POST_IPO': 'Post-IPO',
      'DEBT': 'Debt Financing',
      'GRANT': 'Grant',
      'OTHER': 'Other'
    };
    return typeLabels[type] || type?.replace('_', ' ') || 'Unknown';
  };

  const getInvestmentTypeLabel = (type) => {
    const typeLabels = {
      'EQUITY': 'Equity Investment',
      'DEBT': 'Debt Investment',
      'CONVERTIBLE_NOTE': 'Convertible Note',
      'PREFERRED_SHARES': 'Preferred Shares',
      'WARRANTS': 'Warrants',
      'VENTURE_CAPITAL': 'Venture Capital',
      'OTHER': 'Other'
    };
    return typeLabels[type] || type?.replace('_', ' ') || 'Unknown';
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Funding & Investment Information</h3>
      
      {/* Funding Rounds */}
      {companyData.funding_rounds && companyData.funding_rounds.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <ArrowDownLeft className="h-5 w-5 text-green-600 mr-2" />
            Funding Rounds Received ({companyData.funding_rounds.length})
          </h4>
          
          <div className="space-y-4">
            {companyData.funding_rounds.map((round, index) => (
              <div key={round.id || index} className="bg-green-50 rounded-lg p-6 border border-green-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {round.round_name || getRoundTypeLabel(round.round_type)}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {round.investors && round.investors.length > 0 
                          ? `${round.investors.length} Investor${round.investors.length > 1 ? 's' : ''}` 
                          : 'No Investors'} • {formatDate(round.funding_date || round.announcement_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getRoundTypeColor(round.round_type)}`}>
                      {getRoundTypeLabel(round.round_type)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getRoundStatusColor(round.round_status)}`}>
                      {round.round_status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {round.amount_raised && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Amount Raised</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(round.amount_raised, round.currency)}
                      </div>
                    </div>
                  )}
                  
                  {round.valuation_pre_money && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Pre-Money Valuation</span>
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(round.valuation_pre_money, round.currency)}
                      </div>
                    </div>
                  )}
                  
                  {round.valuation_post_money && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Post-Money Valuation</span>
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(round.valuation_post_money, round.currency)}
                      </div>
                    </div>
                  )}
                  
                  {round.total_investors_count && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Investors</span>
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {round.total_investors_count}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Funding Date:</span>
                    <span className="text-gray-900 ml-1">{formatDate(round.funding_date)}</span>
                  </div>
                  {round.announcement_date && (
                    <div>
                      <span className="font-medium text-gray-700">Announced:</span>
                      <span className="text-gray-900 ml-1">{formatDate(round.announcement_date)}</span>
                    </div>
                  )}
                  {round.currency && (
                    <div>
                      <span className="font-medium text-gray-700">Currency:</span>
                      <span className="text-gray-900 ml-1">{round.currency}</span>
                    </div>
                  )}
                </div>
                
                {round.investors && round.investors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 mb-3 block">Investors in this Round:</span>
                      <div className="space-y-2">
                        {round.investors.map((fundingInvestor, investorIndex) => {
                          const investor = fundingInvestor.investors;
                          if (!investor) return null;
                          
                          return (
                            <div key={investorIndex} className="bg-white rounded-lg p-3 border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium text-gray-800">{investor.name}</h6>
                                <div className="flex items-center space-x-2">
                                  {fundingInvestor.is_lead_investor && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                      Lead
                                    </span>
                                  )}
                                  {fundingInvestor.board_seat_obtained && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                      Board Seat
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-600">Type:</span>
                                  <span className="text-gray-800 ml-1 capitalize">
                                    {investor.investor_type?.replace('_', ' ').toLowerCase()}
                                  </span>
                                </div>
                                {fundingInvestor.investment_amount && (
                                  <div>
                                    <span className="font-medium text-gray-600">Amount:</span>
                                    <span className="text-gray-800 ml-1 font-semibold">
                                      {formatCurrency(fundingInvestor.investment_amount, round.currency)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {round.use_of_funds && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Use of Funds:</span>
                      <p className="text-gray-900 mt-1">{round.use_of_funds}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Investments */}
      {companyData.company_investments && companyData.company_investments.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <ArrowUpRight className="h-5 w-5 text-blue-600 mr-2" />
            Investments Made by Company ({companyData.company_investments.length})
          </h4>
          
          <div className="space-y-4">
            {companyData.company_investments.map((investment, index) => (
              <div key={investment.id || index} className="bg-blue-50 rounded-lg p-6 border border-blue-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {investment.investment_target || 'Investment Target'}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {getInvestmentTypeLabel(investment.investment_type)} • {formatDate(investment.investment_date)}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getInvestmentStatusColor(investment.investment_status)}`}>
                    {investment.investment_status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {investment.investment_amount && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Investment Amount</span>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(investment.investment_amount, investment.currency)}
                      </div>
                    </div>
                  )}
                  
                  {investment.current_stake_percentage && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Current Stake</span>
                        <Percent className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPercentage(investment.current_stake_percentage)}
                      </div>
                    </div>
                  )}
                  
                  {investment.expected_return && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Expected Return</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPercentage(investment.expected_return)}
                      </div>
                    </div>
                  )}
                  
                  {investment.exit_multiple && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">Exit Multiple</span>
                        <Activity className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatMultiple(investment.exit_multiple)}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Exit Information */}
                {(investment.exit_date || investment.exit_amount || investment.exit_type) && (
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Activity className="h-4 w-4 text-orange-600 mr-2" />
                      Exit Information
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {investment.exit_date && (
                        <div>
                          <span className="font-medium text-gray-700">Exit Date:</span>
                          <span className="text-gray-900 ml-1">{formatDate(investment.exit_date)}</span>
                        </div>
                      )}
                      {investment.exit_amount && (
                        <div>
                          <span className="font-medium text-gray-700">Exit Amount:</span>
                          <span className="text-gray-900 ml-1 font-semibold">{formatCurrency(investment.exit_amount, investment.currency)}</span>
                        </div>
                      )}
                      {investment.exit_type && (
                        <div>
                          <span className="font-medium text-gray-700">Exit Type:</span>
                          <span className={`ml-1 px-2 py-1 text-xs rounded-full border ${getExitTypeColor(investment.exit_type)}`}>
                            {investment.exit_type.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Investment Date:</span>
                    <span className="text-gray-900 ml-1">{formatDate(investment.investment_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Investment Type:</span>
                    <span className="text-gray-900 ml-1">{getInvestmentTypeLabel(investment.investment_type)}</span>
                  </div>
                </div>
                
                {investment.description && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900 mt-1">{investment.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!companyData.funding_rounds || companyData.funding_rounds.length === 0) && 
       (!companyData.company_investments || companyData.company_investments.length === 0) && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Funding or Investment Information</h4>
          <p className="text-gray-500">
            This company doesn't have any funding rounds or investment information uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyFundingInvestment;