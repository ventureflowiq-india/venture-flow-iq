import React from 'react';
import { TrendingUp, Calendar, BarChart3, PieChart, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const CompanyFinancialInfo = ({ companyData }) => {
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
    if (!value && value !== 0) return 'Not specified';
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'Not specified';
      if (numValue === 0) return '0.00%';
      return `${numValue.toFixed(2)}%`;
    } catch (error) {
      return 'Not specified';
    }
  };

  const formatRatio = (value) => {
    if (!value && value !== 0) return 'Not specified';
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'Not specified';
      if (numValue === 0) return '0.00';
      return numValue.toFixed(2);
    } catch (error) {
      return 'Not specified';
    }
  };

  const getQuarterLabel = (quarter) => {
    const quarterLabels = {
      'Q1': 'Q1 (Apr-Jun)',
      'Q2': 'Q2 (Jul-Sep)',
      'Q3': 'Q3 (Oct-Dec)',
      'Q4': 'Q4 (Jan-Mar)',
      'ANNUAL': 'Annual'
    };
    return quarterLabels[quarter] || quarter;
  };

  const getStatementTypeLabel = (type) => {
    const typeLabels = {
      'STANDALONE': 'Standalone',
      'CONSOLIDATED': 'Consolidated',
      'INCOME_STATEMENT': 'Income Statement',
      'BALANCE_SHEET': 'Balance Sheet',
      'CASH_FLOW': 'Cash Flow Statement'
    };
    return typeLabels[type] || type?.replace('_', ' ') || 'Unknown';
  };

  const getCurrencyLabel = (currency) => {
    const currencyLabels = {
      'INR': 'Indian Rupee (₹)',
      'USD': 'US Dollar ($)',
      'EUR': 'Euro (€)',
      'GBP': 'British Pound (£)'
    };
    return currencyLabels[currency] || currency;
  };

  const getVariationIcon = (current, previous) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    if (diff > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (diff < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getVariationColor = (current, previous) => {
    if (!current || !previous) return 'text-gray-600';
    const diff = current - previous;
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const calculateGrowth = (current, previous) => {
    if (!current || !previous || previous === 0) return null;
    const growth = ((current - previous) / Math.abs(previous)) * 100;
    return growth.toFixed(1);
  };

  const getMetricIcon = (metricType) => {
    const iconMap = {
      'revenue': <span className="text-green-600 font-bold">₹</span>,
      'profit': <TrendingUp className="h-5 w-5 text-blue-600" />,
      'assets': <BarChart3 className="h-5 w-5 text-purple-600" />,
      'cash': <Activity className="h-5 w-5 text-orange-600" />,
      'ratio': <PieChart className="h-5 w-5 text-indigo-600" />
    };
    return iconMap[metricType] || <BarChart3 className="h-5 w-5 text-gray-600" />;
  };

  const getRatioHealthColor = (ratio, type) => {
    if (!ratio || ratio === 0) return 'text-gray-600';
    
    const numRatio = parseFloat(ratio);
    if (isNaN(numRatio)) return 'text-gray-600';
    
    switch (type) {
      case 'current_ratio':
        if (numRatio >= 1.5 && numRatio <= 3) return 'text-green-600';
        if (numRatio >= 1 && numRatio < 1.5) return 'text-yellow-600';
        return 'text-red-600';
      case 'debt_to_equity_ratio':
        if (numRatio <= 0.4) return 'text-green-600';
        if (numRatio <= 1) return 'text-yellow-600';
        return 'text-red-600';
      case 'return_on_equity':
      case 'return_on_assets':
        if (numRatio >= 15) return 'text-green-600';
        if (numRatio >= 5) return 'text-yellow-600';
        return 'text-red-600';
      case 'profit_margin':
        if (numRatio >= 10) return 'text-green-600';
        if (numRatio >= 5) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const shouldShowRatio = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return false;
    return num !== 0; // hide zero values to avoid lone "0"/"00" rendering
  };

  if (!companyData.financial_statements || companyData.financial_statements.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Information</h3>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Financial Information</h4>
          <p className="text-gray-500">
            This company doesn't have any financial statements uploaded yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Information</h3>
      
      {/* Financial Summary */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Total Statements</span>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {companyData.financial_statements.length}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Latest Year</span>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {Math.max(...companyData.financial_statements.map(s => s.financial_year || 0))}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Statements Type</span>
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm font-bold text-purple-900">
              {[...new Set(companyData.financial_statements.map(s => s.statement_type))].join(', ')}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Currency</span>
              <span className="text-orange-600 font-bold">₹</span>
            </div>
            <div className="text-sm font-bold text-orange-900">
              {[...new Set(companyData.financial_statements.map(s => s.currency))].join(', ')}
            </div>
          </div>
        </div>
      </div>
      
      {companyData.financial_statements.map((statement, index) => {
        const previousStatement = companyData.financial_statements[index + 1]; // Next in array (older)
        
        return (
          <div key={statement.id || index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6 hover:shadow-sm transition-shadow">
            {/* Statement Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Financial Year {statement.financial_year}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getQuarterLabel(statement.quarter)} • {getStatementTypeLabel(statement.statement_type)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Period: {formatDate(statement.period_start_date)} - {formatDate(statement.period_end_date)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Currency</div>
                <div className="text-sm font-medium text-gray-900">{getCurrencyLabel(statement.currency)}</div>
                {statement.filed_date && (
                  <div className="text-xs text-gray-500 mt-1">Filed: {formatDate(statement.filed_date)}</div>
                )}
              </div>
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {statement.total_revenue && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Total Revenue</span>
                    {getMetricIcon('revenue')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(statement.total_revenue, statement.currency)}
                  </div>
                  {previousStatement?.total_revenue && (
                    <div className={`flex items-center text-xs ${getVariationColor(statement.total_revenue, previousStatement.total_revenue)}`}>
                      {getVariationIcon(statement.total_revenue, previousStatement.total_revenue)}
                      <span className="ml-1">
                        {calculateGrowth(statement.total_revenue, previousStatement.total_revenue)}% YoY
                      </span>
                    </div>
                  )}
                </div>
              )}

              {statement.net_profit && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Net Profit</span>
                    {getMetricIcon('profit')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(statement.net_profit, statement.currency)}
                  </div>
                  {previousStatement?.net_profit && (
                    <div className={`flex items-center text-xs ${getVariationColor(statement.net_profit, previousStatement.net_profit)}`}>
                      {getVariationIcon(statement.net_profit, previousStatement.net_profit)}
                      <span className="ml-1">
                        {calculateGrowth(statement.net_profit, previousStatement.net_profit)}% YoY
                      </span>
                    </div>
                  )}
                </div>
              )}

              {statement.gross_profit && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Gross Profit</span>
                    {getMetricIcon('profit')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(statement.gross_profit, statement.currency)}
                  </div>
                  {previousStatement?.gross_profit && (
                    <div className={`flex items-center text-xs ${getVariationColor(statement.gross_profit, previousStatement.gross_profit)}`}>
                      {getVariationIcon(statement.gross_profit, previousStatement.gross_profit)}
                      <span className="ml-1">
                        {calculateGrowth(statement.gross_profit, previousStatement.gross_profit)}% YoY
                      </span>
                    </div>
                  )}
                </div>
              )}

              {statement.ebitda && (
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">EBITDA</span>
                    {getMetricIcon('profit')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(statement.ebitda, statement.currency)}
                  </div>
                  {previousStatement?.ebitda && (
                    <div className={`flex items-center text-xs ${getVariationColor(statement.ebitda, previousStatement.ebitda)}`}>
                      {getVariationIcon(statement.ebitda, previousStatement.ebitda)}
                      <span className="ml-1">
                        {calculateGrowth(statement.ebitda, previousStatement.ebitda)}% YoY
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Balance Sheet & Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  {getMetricIcon('assets')}
                  <span className="ml-2">Assets & Liabilities</span>
                </h5>
                
                {statement.total_assets && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-gray-600">Total Assets</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statement.total_assets, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.current_assets && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-gray-600">Current Assets</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statement.current_assets, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.fixed_assets && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-gray-600">Fixed Assets</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statement.fixed_assets, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.total_liabilities && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-medium text-red-700">Total Liabilities</span>
                    <span className="text-sm font-bold text-red-900">
                      {formatCurrency(statement.total_liabilities, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.shareholders_equity && (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-green-700">Shareholders' Equity</span>
                    <span className="text-sm font-bold text-green-900">
                      {formatCurrency(statement.shareholders_equity, statement.currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Cash Flow */}
              <div className="space-y-4">
                <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  {getMetricIcon('cash')}
                  <span className="ml-2">Cash Flow</span>
                </h5>
                
                {statement.operating_cash_flow && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-gray-600">Operating Cash Flow</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statement.operating_cash_flow, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.investing_cash_flow && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-gray-600">Investing Cash Flow</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statement.investing_cash_flow, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.financing_cash_flow && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-gray-600">Financing Cash Flow</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statement.financing_cash_flow, statement.currency)}
                    </span>
                  </div>
                )}
                
                {statement.net_cash_flow && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-700">Net Cash Flow</span>
                    <span className="text-sm font-bold text-blue-900">
                      {formatCurrency(statement.net_cash_flow, statement.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Ratios */}
            {(statement.debt_to_equity_ratio || statement.current_ratio || statement.return_on_equity || statement.return_on_assets || statement.profit_margin) && (
              <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                  {getMetricIcon('ratio')}
                  <span className="ml-2">Key Financial Ratios</span>
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {shouldShowRatio(statement.debt_to_equity_ratio) && (
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <div className={`text-2xl font-bold ${getRatioHealthColor(statement.debt_to_equity_ratio, 'debt_to_equity_ratio')}`}>
                        {formatRatio(statement.debt_to_equity_ratio)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Debt/Equity</div>
                    </div>
                  )}
                  {shouldShowRatio(statement.current_ratio) && (
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <div className={`text-2xl font-bold ${getRatioHealthColor(statement.current_ratio, 'current_ratio')}`}>
                        {formatRatio(statement.current_ratio)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Current Ratio</div>
                    </div>
                  )}
                  {shouldShowRatio(statement.return_on_equity) && (
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <div className={`text-2xl font-bold ${getRatioHealthColor(statement.return_on_equity, 'return_on_equity')}`}>
                        {formatPercentage(statement.return_on_equity)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">ROE</div>
                    </div>
                  )}
                  {shouldShowRatio(statement.return_on_assets) && (
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <div className={`text-2xl font-bold ${getRatioHealthColor(statement.return_on_assets, 'return_on_assets')}`}>
                        {formatPercentage(statement.return_on_assets)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">ROA</div>
                    </div>
                  )}
                  {shouldShowRatio(statement.profit_margin) && (
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <div className={`text-2xl font-bold ${getRatioHealthColor(statement.profit_margin, 'profit_margin')}`}>
                        {formatPercentage(statement.profit_margin)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Profit Margin</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CompanyFinancialInfo;