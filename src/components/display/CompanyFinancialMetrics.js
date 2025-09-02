import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CompanyFinancialMetrics = ({ companyData }) => {
  const [tab, setTab] = useState('overview');

  // Configuration for ratio health thresholds
  const RATIO_THRESHOLDS = {
    current_ratio: { good: [1.5, 3], average: [1, 1.5] },
    debt_to_equity_ratio: { good: [0, 0.4], average: [0.4, 1] },
    return_on_equity: { good: [15, Infinity], average: [5, 15] },
    return_on_assets: { good: [15, Infinity], average: [5, 15] },
    profit_margin: { good: [10, Infinity], average: [5, 10] }
  };

  // Utility functions
  const formatCurrency = useMemo(() => (value) => {
    if (!value && value !== 0) return '₹0';
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '₹0';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(numValue);
    } catch (error) {
      return '₹0';
    }
  }, []);

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

  const convertToNumbers = (arr) => arr.map(v => (typeof v === 'number' ? v : (v ? parseFloat(v) : 0)) || 0);

  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getTrendIcon = (current, previous) => {
    if (!previous || previous === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    const growth = calculateGrowthRate(current, previous);
    if (growth > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (growth < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Build chart data from financial statements
  const charts = useMemo(() => {
    const statements = (companyData.financial_statements || [])
      .slice()
      .sort((a, b) => (a.financial_year || 0) - (b.financial_year || 0));

    const labels = statements.map(s => s.financial_year || new Date(s.period_end_date || s.period_start_date || 0).getFullYear());

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { position: 'top' },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const datasetLabel = context.dataset.label || '';
              const value = context.raw;
              if (datasetLabel.includes('Ratio') || datasetLabel.includes('ROE') || datasetLabel.includes('ROA')) {
                return `${datasetLabel}: ${value}`;
              }
              return `${datasetLabel}: ${formatCurrency(value)}`;
            }
          }
        }
      },
      scales: { 
        y: { 
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (this.chart.data.datasets[0].label?.includes('Ratio') || 
                  this.chart.data.datasets[0].label?.includes('ROE') || 
                  this.chart.data.datasets[0].label?.includes('ROA')) {
                return value;
              }
              return formatCurrency(value);
            }
          }
        }
      }
    };

    return {
      revenue: {
        labels,
        datasets: [{ 
          label: 'Total Revenue', 
          backgroundColor: 'rgba(34,197,94,0.5)', 
          borderColor: 'rgba(34,197,94,1)', 
          borderWidth: 2,
          data: convertToNumbers(statements.map(s => s.total_revenue)) 
        }],
        options: chartOptions
      },
      profit: {
        labels,
        datasets: [{ 
          label: 'Net Profit', 
          backgroundColor: 'rgba(59,130,246,0.5)', 
          borderColor: 'rgba(59,130,246,1)', 
          borderWidth: 2,
          data: convertToNumbers(statements.map(s => s.net_profit)) 
        }],
        options: chartOptions
      },
      assets: {
        labels,
        datasets: [
          { 
            label: 'Total Assets', 
            backgroundColor: 'rgba(139,92,246,0.5)', 
            borderColor: 'rgba(139,92,246,1)', 
            borderWidth: 2,
            data: convertToNumbers(statements.map(s => s.total_assets)) 
          },
          { 
            label: 'Total Liabilities', 
            backgroundColor: 'rgba(239,68,68,0.5)', 
            borderColor: 'rgba(239,68,68,1)', 
            borderWidth: 2,
            data: convertToNumbers(statements.map(s => s.total_liabilities)) 
          }
        ],
        options: chartOptions
      },
      ratios: {
        labels,
        datasets: [
          { 
            label: 'Current Ratio', 
            borderColor: 'rgba(99,102,241,1)', 
            backgroundColor: 'rgba(99,102,241,0.2)', 
            borderWidth: 2,
            fill: false,
            data: convertToNumbers(statements.map(s => s.current_ratio)) 
          },
          { 
            label: 'Debt/Equity Ratio', 
            borderColor: 'rgba(234,88,12,1)', 
            backgroundColor: 'rgba(234,88,12,0.2)', 
            borderWidth: 2,
            fill: false,
            data: convertToNumbers(statements.map(s => s.debt_to_equity_ratio)) 
          }
        ],
        options: {
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => value.toFixed(2)
              }
            }
          }
        }
      },
      profitability: {
        labels,
        datasets: [
          { 
            label: 'ROE (%)', 
            borderColor: 'rgba(16,185,129,1)', 
            backgroundColor: 'rgba(16,185,129,0.2)', 
            borderWidth: 2,
            fill: false,
            data: convertToNumbers(statements.map(s => s.return_on_equity)) 
          },
          { 
            label: 'ROA (%)', 
            borderColor: 'rgba(245,101,101,1)', 
            backgroundColor: 'rgba(245,101,101,0.2)', 
            borderWidth: 2,
            fill: false,
            data: convertToNumbers(statements.map(s => s.return_on_assets)) 
          },
          { 
            label: 'Profit Margin (%)', 
            borderColor: 'rgba(168,85,247,1)', 
            backgroundColor: 'rgba(168,85,247,0.2)', 
            borderWidth: 2,
            fill: false,
            data: convertToNumbers(statements.map(s => s.profit_margin)) 
          }
        ],
        options: {
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value}%`
              }
            }
          }
        }
      }
    };
  }, [companyData.financial_statements, formatCurrency]);

  // Check if we have financial statements with ratios
  const hasFinancialRatios = companyData.financial_statements && 
    companyData.financial_statements.some(stmt => 
      stmt.debt_to_equity_ratio || stmt.current_ratio || stmt.return_on_equity || 
      stmt.return_on_assets || stmt.profit_margin
    );

  if (!hasFinancialRatios) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Metrics</h3>
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Financial Metrics Available</h4>
          <p className="text-gray-500">
            This company doesn't have any financial metrics uploaded yet.
          </p>
        </div>
      </div>
    );
  }

  const getRatioHealthColor = (ratio, type) => {
    if (!ratio && ratio !== 0) return 'text-gray-600';
    
    const numRatio = parseFloat(ratio);
    if (isNaN(numRatio)) return 'text-gray-600';
    
    const thresholds = RATIO_THRESHOLDS[type];
    if (!thresholds) return 'text-gray-600';
    
    const [goodMin, goodMax] = thresholds.good;
    const [avgMin, avgMax] = thresholds.average;
    
    if (numRatio >= goodMin && numRatio <= goodMax) return 'text-green-600';
    if (numRatio >= avgMin && numRatio <= avgMax) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatioHealthBg = (ratio, type) => {
    if (!ratio && ratio !== 0) return 'bg-gray-50';
    
    const numRatio = parseFloat(ratio);
    if (isNaN(numRatio)) return 'bg-gray-50';
    
    const thresholds = RATIO_THRESHOLDS[type];
    if (!thresholds) return 'bg-gray-50';
    
    const [goodMin, goodMax] = thresholds.good;
    const [avgMin, avgMax] = thresholds.average;
    
    if (numRatio >= goodMin && numRatio <= goodMax) return 'bg-green-50 border-green-200';
    if (numRatio >= avgMin && numRatio <= avgMax) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Metrics</h3>

      <div className="mb-6">
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setTab('overview')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setTab('charts')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'charts' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Charts
          </button>
        </div>
      </div>

      {tab === 'charts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend</h4>
            <div className="h-64">
              <Bar data={charts.revenue} options={charts.revenue.options} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Net Profit Trend</h4>
            <div className="h-64">
              <Bar data={charts.profit} options={charts.profit.options} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Assets vs Liabilities</h4>
            <div className="h-64">
              <Bar data={charts.assets} options={charts.assets.options} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Financial Ratios</h4>
            <div className="h-64">
              <Line data={charts.ratios} options={charts.ratios.options} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Profitability Metrics</h4>
            <div className="h-64">
              <Line data={charts.profitability} options={charts.profitability.options} />
            </div>
          </div>
        </div>
      )}

      {tab === 'overview' && companyData.financial_statements.map((statement, index) => {
        const hasRatios = statement.debt_to_equity_ratio || statement.current_ratio || 
                          statement.return_on_equity || statement.return_on_assets || statement.profit_margin;
        
        if (!hasRatios) return null;

        // Get previous year's data for trend calculation
        const previousStatement = companyData.financial_statements.find(s => 
          s.financial_year === (statement.financial_year - 1)
        );

        return (
          <div key={statement.id || index} className="bg-white rounded-lg p-6 border border-gray-200 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Financial Year {statement.financial_year || 'N/A'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {statement.quarter || 'N/A'} • {statement.statement_type || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Financial Figures */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {statement.total_revenue && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(statement.total_revenue)}
                    </div>
                    {previousStatement && getTrendIcon(statement.total_revenue, previousStatement.total_revenue)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Total Revenue</div>
                  {previousStatement && (
                    <div className="text-xs text-gray-400 mt-1">
                      {calculateGrowthRate(statement.total_revenue, previousStatement.total_revenue)?.toFixed(1)}% YoY
                    </div>
                  )}
                </div>
              )}
              
              {statement.net_profit && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(statement.net_profit)}
                    </div>
                    {previousStatement && getTrendIcon(statement.net_profit, previousStatement.net_profit)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Net Profit</div>
                  {previousStatement && (
                    <div className="text-xs text-gray-400 mt-1">
                      {calculateGrowthRate(statement.net_profit, previousStatement.net_profit)?.toFixed(1)}% YoY
                    </div>
                  )}
                </div>
              )}
              
              {statement.total_assets && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(statement.total_assets)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Total Assets</div>
                </div>
              )}
              
              {statement.ebitda && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(statement.ebitda)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">EBITDA</div>
                </div>
              )}
            </div>

            {/* Financial Ratios Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statement.debt_to_equity_ratio && (
                <div className={`rounded-lg p-4 border text-center ${getRatioHealthBg(statement.debt_to_equity_ratio, 'debt_to_equity_ratio')}`}>
                  <div className={`text-2xl font-bold ${getRatioHealthColor(statement.debt_to_equity_ratio, 'debt_to_equity_ratio')}`}>
                    {formatRatio(statement.debt_to_equity_ratio)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Debt/Equity</div>
                </div>
              )}
              
              {statement.current_ratio && (
                <div className={`rounded-lg p-4 border text-center ${getRatioHealthBg(statement.current_ratio, 'current_ratio')}`}>
                  <div className={`text-2xl font-bold ${getRatioHealthColor(statement.current_ratio, 'current_ratio')}`}>
                    {formatRatio(statement.current_ratio)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Current Ratio</div>
                </div>
              )}
              
              {statement.return_on_equity && (
                <div className={`rounded-lg p-4 border text-center ${getRatioHealthBg(statement.return_on_equity, 'return_on_equity')}`}>
                  <div className={`text-2xl font-bold ${getRatioHealthColor(statement.return_on_equity, 'return_on_equity')}`}>
                    {formatPercentage(statement.return_on_equity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">ROE</div>
                </div>
              )}
              
              {statement.return_on_assets && (
                <div className={`rounded-lg p-4 border text-center ${getRatioHealthBg(statement.return_on_assets, 'return_on_assets')}`}>
                  <div className={`text-2xl font-bold ${getRatioHealthColor(statement.return_on_assets, 'return_on_assets')}`}>
                    {formatPercentage(statement.return_on_assets)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">ROA</div>
                </div>
              )}
              
              {statement.profit_margin && (
                <div className={`rounded-lg p-4 border text-center ${getRatioHealthBg(statement.profit_margin, 'profit_margin')}`}>
                  <div className={`text-2xl font-bold ${getRatioHealthColor(statement.profit_margin, 'profit_margin')}`}>
                    {formatPercentage(statement.profit_margin)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Profit Margin</div>
                </div>
              )}
            </div>

            {/* Ratio Health Legend */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-medium text-blue-800 mb-3">Ratio Health Indicators</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Good Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-700 font-medium">Average Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Needs Attention</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompanyFinancialMetrics;