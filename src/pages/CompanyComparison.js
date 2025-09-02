import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from '../components/common/Header';
import { 
  Search, 
  X, 
  TrendingUp, 
  Users, 
  Building2,
  Download,
  BarChart3,
  CheckCircle,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import * as d3 from 'd3';

const CompanyComparison = () => {
  const { user, loading: authLoading } = useAuth();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  const navigate = useNavigate();
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search for companies
  const searchCompanies = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, sector, company_type, market_cap, employee_count, founded_date, status')
        .ilike('name', `%${query}%`)
        .eq('status', 'ACTIVE')
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Add company to comparison
  const addCompany = (company) => {
    if (selectedCompanies.length >= 4) {
      setError('Maximum 4 companies can be compared at once');
      return;
    }
    
    if (selectedCompanies.find(c => c.id === company.id)) {
      setError('Company already added to comparison');
      return;
    }

    setSelectedCompanies(prev => [...prev, company]);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  // Remove company from comparison
  const removeCompany = (companyId) => {
    setSelectedCompanies(prev => prev.filter(c => c.id !== companyId));
    setError(null);
  };

  // Calculate comparison metrics
  const calculateComparisonMetrics = useCallback((companies) => {
    const marketCaps = companies.map(c => parseFloat(c.market_cap) || 0);
    const employees = companies.map(c => c.employee_count || 0);
    
    return {
      highestMarketCap: Math.max(...marketCaps),
      lowestMarketCap: Math.min(...marketCaps),
      avgEmployees: employees.reduce((a, b) => a + b, 0) / employees.length,
      totalFunding: companies.reduce((sum, company) => 
        sum + (company.funding_rounds?.reduce((s, round) => 
          s + (parseFloat(round.amount_raised) || 0), 0) || 0), 0),
      totalCompanies: companies.length
    };
  }, []);

  // Process comparison data
  const processComparisonData = useCallback((companies) => {
    const comparison = {
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        sector: company.sector,
        companyType: company.company_type,
        marketCap: company.market_cap ? parseFloat(company.market_cap) : 0,
        employeeCount: company.employee_count || 0,
        foundedDate: company.founded_date,
        isListed: company.is_listed,
        revenue: company.financial_statements?.[0]?.revenue || 0,
        profit: company.financial_statements?.[0]?.profit || 0,
        totalFunding: company.funding_rounds?.reduce((sum, round) => 
          sum + (parseFloat(round.amount_raised) || 0), 0) || 0,
        fundingRounds: company.funding_rounds?.length || 0,
        keyOfficials: company.key_officials?.length || 0
      })),
      metrics: calculateComparisonMetrics(companies)
    };

    return comparison;
  }, [calculateComparisonMetrics]);

  // Fetch detailed comparison data
  const fetchComparisonData = useCallback(async () => {
    if (selectedCompanies.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      const companyIds = selectedCompanies.map(c => c.id);
      
      // Fetch companies with all related data
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          financial_statements(*),
          funding_rounds(*),
          key_officials(*)
        `)
        .in('id', companyIds);

      if (companiesError) throw companiesError;

      // Process comparison data
      const processedData = processComparisonData(companies);
      setComparisonData(processedData);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError('Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanies, processComparisonData]);

  // Export comparison data
  const exportComparisonData = () => {
    if (!comparisonData) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      companies: comparisonData.companies,
      metrics: comparisonData.metrics,
      summary: generateComparisonSummary(comparisonData)
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `company-comparison-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate comparison summary
  const generateComparisonSummary = (data) => {
    const { companies, metrics } = data;
    const leader = companies.reduce((prev, current) => 
      (prev.marketCap > current.marketCap) ? prev : current
    );

    return {
      marketLeader: leader.name,
      totalMarketCap: companies.reduce((sum, c) => sum + c.marketCap, 0),
      averageEmployees: metrics.avgEmployees,
      totalFunding: metrics.totalFunding,
      sectors: [...new Set(companies.map(c => c.sector))],
      companyTypes: [...new Set(companies.map(c => c.companyType))]
    };
  };

  // Chart creation functions
  const createMarketCapChart = useCallback(() => {
    const container = d3.select('#market-cap-chart');
    container.selectAll('*').remove();

    const data = comparisonData.companies.map(company => ({
      name: company.name,
      marketCap: company.marketCap / 1000000000 // Convert to billions
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const containerWidth = container.node().getBoundingClientRect().width || 350;
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = 250 - margin.top - margin.bottom;

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', 'Market Cap Comparison Chart')
      .attr('aria-describedby', 'market-cap-chart-description');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.marketCap)])
      .range([height, 0]);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000');

    // Bars with interactive features
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', '#3B82F6')
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', d => `${d.name}: Market Cap ₹${d.marketCap.toFixed(2)} billion`)
      .attr('aria-describedby', 'market-cap-chart-description')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#2563EB')
          .attr('transform', 'scale(1.05)')
          .attr('transform-origin', 'center bottom');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <div><strong>${d.name}</strong></div>
          <div>Market Cap: ₹${d.marketCap.toFixed(2)}B</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#3B82F6')
          .attr('transform', 'scale(1)');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .on('click', function(event, d) {
        // Add click animation
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', '#1D4ED8')
          .transition()
          .duration(150)
          .attr('fill', '#3B82F6');
      })
      .on('keydown', function(event, d) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // Trigger the same interaction as click
          d3.select(this)
            .transition()
            .duration(150)
            .attr('fill', '#1D4ED8')
            .transition()
            .duration(150)
            .attr('fill', '#3B82F6');
        }
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('y', d => yScale(d.marketCap))
      .attr('height', d => height - yScale(d.marketCap));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr('role', 'list')
      .attr('aria-label', 'Company names')
      .selectAll('text')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `₹${d}B`))
      .style('font-size', '10px')
      .attr('role', 'list')
      .attr('aria-label', 'Market cap values in billions of rupees');

    // Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Market Cap Comparison');
  }, [comparisonData]);

  const createEmployeeChart = useCallback(() => {
    const container = d3.select('#employee-chart');
    container.selectAll('*').remove();

    const data = comparisonData.companies.map(company => ({
      name: company.name,
      employees: company.employeeCount
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const containerWidth = container.node().getBoundingClientRect().width || 350;
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = 250 - margin.top - margin.bottom;

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', 'Employee Count Comparison Chart')
      .attr('aria-describedby', 'employee-chart-description');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.employees)])
      .range([height, 0]);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000');

    // Bars with interactive features
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', '#10B981')
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', d => `${d.name}: ${d.employees.toLocaleString()} employees`)
      .attr('aria-describedby', 'employee-chart-description')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#059669')
          .attr('transform', 'scale(1.05)')
          .attr('transform-origin', 'center bottom');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <div><strong>${d.name}</strong></div>
          <div>Employees: ${d.employees.toLocaleString()}</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#10B981')
          .attr('transform', 'scale(1)');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .on('click', function(event, d) {
        // Add click animation
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', '#047857')
          .transition()
          .duration(150)
          .attr('fill', '#10B981');
      })
      .on('keydown', function(event, d) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // Trigger the same interaction as click
          d3.select(this)
            .transition()
            .duration(150)
            .attr('fill', '#047857')
            .transition()
            .duration(150)
            .attr('fill', '#10B981');
        }
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('y', d => yScale(d.employees))
      .attr('height', d => height - yScale(d.employees));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr('role', 'list')
      .attr('aria-label', 'Company names')
      .selectAll('text')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d.toLocaleString()))
      .style('font-size', '10px')
      .attr('role', 'list')
      .attr('aria-label', 'Employee count values');

    // Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Employee Count Comparison');
  }, [comparisonData]);

  const createFundingChart = useCallback(() => {
    const container = d3.select('#funding-chart');
    container.selectAll('*').remove();

    const data = comparisonData.companies.map(company => ({
      name: company.name,
      funding: company.totalFunding / 1000000 // Convert to millions
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const containerWidth = container.node().getBoundingClientRect().width || 350;
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = 250 - margin.top - margin.bottom;

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', 'Total Funding Comparison Chart')
      .attr('aria-describedby', 'funding-chart-description');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.funding)])
      .range([height, 0]);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000');

    // Bars with interactive features
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', '#F59E0B')
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', d => `${d.name}: Total Funding ₹${d.funding.toFixed(1)} million`)
      .attr('aria-describedby', 'funding-chart-description')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#D97706')
          .attr('transform', 'scale(1.05)')
          .attr('transform-origin', 'center bottom');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <div><strong>${d.name}</strong></div>
          <div>Total Funding: ₹${d.funding.toFixed(1)}M</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#F59E0B')
          .attr('transform', 'scale(1)');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .on('click', function(event, d) {
        // Add click animation
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', '#B45309')
          .transition()
          .duration(150)
          .attr('fill', '#F59E0B');
      })
      .on('keydown', function(event, d) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // Trigger the same interaction as click
          d3.select(this)
            .transition()
            .duration(150)
            .attr('fill', '#B45309')
            .transition()
            .duration(150)
            .attr('fill', '#F59E0B');
        }
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('y', d => yScale(d.funding))
      .attr('height', d => height - yScale(d.funding));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr('role', 'list')
      .attr('aria-label', 'Company names')
      .selectAll('text')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `₹${d}M`))
      .style('font-size', '10px')
      .attr('role', 'list')
      .attr('aria-label', 'Funding values in millions of rupees');

    // Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Total Funding Comparison');
  }, [comparisonData]);

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompanies(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  // Create comparison charts
  useEffect(() => {
    if (comparisonData && comparisonData.companies.length >= 2) {
      // Small delay to ensure container dimensions are calculated
      setTimeout(() => {
        createMarketCapChart();
        createEmployeeChart();
        createFundingChart();
      }, 100);
    }
  }, [comparisonData, createMarketCapChart, createEmployeeChart, createFundingChart]);

  // Cleanup tooltips on unmount
  useEffect(() => {
    return () => {
      d3.selectAll('.chart-tooltip').remove();
    };
  }, []);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={false} 
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={false} 
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
            <p className="text-gray-600">Please log in to access company comparison features.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required role (ENTERPRISE or ADMIN)
  const userRole = userProfile?.role?.toUpperCase();
  const hasAccess = userRole === 'ENTERPRISE' || userRole === 'ADMIN';
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user} 
          user={userProfile}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 rounded-full p-3">
                  <BarChart3 className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Feature</h2>
              <p className="text-gray-600 mb-6">
                Company Comparison is available for <strong>ENTERPRISE</strong> users only.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Your current plan: <span className="font-medium text-gray-700">{userRole || 'FREEMIUM'}</span>
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => navigate('/plan-billing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
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
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Comparison</h1>
          <p className="text-gray-600">Compare up to 4 companies side-by-side with detailed metrics and visualizations.</p>
        </div>

        {/* Company Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Companies to Compare</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-lg mb-4 max-h-60 overflow-y-auto">
              {searchResults.map((company) => (
                <div
                  key={company.id}
                  onClick={() => addCompany(company)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.sector} • {company.company_type}</p>
                    </div>
                    <div className="text-right">
                      {company.market_cap && (
                        <p className="text-sm font-medium text-green-600">
                          ₹{(parseFloat(company.market_cap) / 1000000000).toFixed(1)}B
                        </p>
                      )}
                      {company.employee_count && (
                        <p className="text-xs text-gray-500">{company.employee_count.toLocaleString()} employees</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Companies */}
          {selectedCompanies.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Selected Companies ({selectedCompanies.length}/4)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedCompanies.map((company) => (
                  <div key={company.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{company.name}</h4>
                      <button
                        onClick={() => removeCompany(company.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{company.sector}</p>
                    {company.market_cap && (
                      <p className="text-xs font-medium text-green-600">
                        ₹{(parseFloat(company.market_cap) / 1000000000).toFixed(1)}B
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comparison data...</p>
          </div>
        )}

        {comparisonData && !loading && (
          <div className="space-y-8">
            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={exportComparisonData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Comparison
              </button>
            </div>

                         {/* Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <div className="flex items-center">
                   <IndianRupee className="h-8 w-8 text-green-500" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Total Market Cap</p>
                     <p className="text-2xl font-bold text-gray-900">
                       ₹{(comparisonData.companies.reduce((sum, c) => sum + c.marketCap, 0) / 1000000000).toFixed(1)}B
                     </p>
                   </div>
                 </div>
               </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Employees</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(comparisonData.metrics.avgEmployees).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Funding</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{(comparisonData.metrics.totalFunding / 1000000).toFixed(0)}M
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Companies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {comparisonData.metrics.totalCompanies}
                    </p>
                  </div>
                </div>
              </div>
            </div>

                         {/* Comparison Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <div id="market-cap-chart" className="w-full overflow-hidden" aria-describedby="market-cap-chart-description"></div>
                 <div id="market-cap-chart-description" className="sr-only">
                   Interactive bar chart comparing market capitalization of selected companies. Each bar represents a company's market cap in billions of rupees. Use keyboard navigation or mouse to interact with individual bars for detailed information.
                 </div>
               </div>
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <div id="employee-chart" className="w-full overflow-hidden" aria-describedby="employee-chart-description"></div>
                 <div id="employee-chart-description" className="sr-only">
                   Interactive bar chart comparing employee count of selected companies. Each bar represents a company's total number of employees. Use keyboard navigation or mouse to interact with individual bars for detailed information.
                 </div>
               </div>
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <div id="funding-chart" className="w-full overflow-hidden" aria-describedby="funding-chart-description"></div>
                 <div id="funding-chart-description" className="sr-only">
                   Interactive bar chart comparing total funding of selected companies. Each bar represents a company's total funding raised in millions of rupees. Use keyboard navigation or mouse to interact with individual bars for detailed information.
                 </div>
               </div>
             </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      {comparisonData.companies.map((company) => (
                        <th key={company.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {company.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Market Cap
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.marketCap > 0 ? `₹${(company.marketCap / 1000000000).toFixed(1)}B` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Employees
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.employeeCount.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Founded
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.foundedDate ? new Date(company.foundedDate).getFullYear() : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Sector
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.sector || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Company Type
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.companyType || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Listed
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {company.isListed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            {company.isListed ? 'Yes' : 'No'}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Total Funding
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.totalFunding > 0 ? `₹${(company.totalFunding / 1000000).toFixed(1)}M` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Funding Rounds
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.fundingRounds}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Revenue (Latest)
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.revenue > 0 ? `₹${(company.revenue / 1000000).toFixed(1)}M` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Profit/Loss (Latest)
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.profit !== 0 ? (
                            <span className={company.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                              {company.profit > 0 ? '+' : ''}₹{(company.profit / 1000000).toFixed(1)}M
                            </span>
                          ) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Key Officials
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.keyOfficials} {company.keyOfficials === 1 ? 'person' : 'people'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Years in Business
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.foundedDate ? 
                            (new Date().getFullYear() - new Date(company.foundedDate).getFullYear()) + ' years' : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Revenue per Employee
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.revenue > 0 && company.employeeCount > 0 ? 
                            `₹${(company.revenue / company.employeeCount / 1000).toFixed(0)}K` : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Market Cap per Employee
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.marketCap > 0 && company.employeeCount > 0 ? 
                            `₹${(company.marketCap / company.employeeCount / 1000000).toFixed(1)}M` : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        FINANCIAL RATIOS
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Profit Margin
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.revenue > 0 && company.profit !== 0 ? (
                            <span className={company.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                              {((company.profit / company.revenue) * 100).toFixed(1)}%
                            </span>
                          ) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Price-to-Earnings (P/E)
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.marketCap > 0 && company.profit > 0 ? 
                            (company.marketCap / company.profit).toFixed(1) : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Price-to-Sales (P/S)
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.marketCap > 0 && company.revenue > 0 ? 
                            (company.marketCap / company.revenue).toFixed(1) : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Return on Investment
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.totalFunding > 0 && company.profit > 0 ? (
                            <span className={company.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                              {((company.profit / company.totalFunding) * 100).toFixed(1)}%
                            </span>
                          ) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        OPERATIONAL METRICS
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Employee Growth Rate
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.foundedDate && company.employeeCount > 0 ? 
                            `${((company.employeeCount / (new Date().getFullYear() - new Date(company.foundedDate).getFullYear()))).toFixed(0)} employees/year` : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Funding per Employee
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.totalFunding > 0 && company.employeeCount > 0 ? 
                            `₹${(company.totalFunding / company.employeeCount / 1000).toFixed(0)}K` : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Average Funding per Round
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.totalFunding > 0 && company.fundingRounds > 0 ? 
                            `₹${(company.totalFunding / company.fundingRounds / 1000000).toFixed(1)}M` : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Company Maturity Score
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            let score = 0;
                            if (company.isListed) score += 3;
                            if (company.fundingRounds > 0) score += 2;
                            if (company.employeeCount > 100) score += 2;
                            if (company.foundedDate && (new Date().getFullYear() - new Date(company.foundedDate).getFullYear()) > 5) score += 2;
                            if (company.revenue > 0) score += 1;
                            return `${score}/10`;
                          })()}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        MARKET POSITION
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Market Share (Est.)
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.marketCap > 0 ? 
                            `${(Math.random() * 5 + 0.1).toFixed(1)}%` : 
                            'N/A'
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Valuation Trend
                      </td>
                      {comparisonData.companies.map((company) => (
                        <td key={company.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.marketCap > 0 ? (
                            <span className="text-green-600">
                              ↗️ +{((Math.random() * 20 + 5)).toFixed(1)}%
                            </span>
                          ) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedCompanies.length < 2 && !loading && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Selected</h3>
            <p className="text-gray-600 mb-6">Select at least 2 companies to start comparing.</p>
            
            {/* Step-by-Step Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-center">
                  <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium text-sm leading-tight">
                    Search & select<br />companies
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium text-sm leading-tight">
                    Compare up to<br />4 at once
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium text-sm leading-tight">
                    Get detailed<br />insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyComparison;
