import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import CompanyBasicInfo from '../components/display/CompanyBasicInfo';
import CompanyAddressContact from '../components/display/CompanyAddressContact';
import CompanyKeyOfficials from '../components/display/CompanyKeyOfficials';
import CompanyFinancialInfo from '../components/display/CompanyFinancialInfo';
import CompanyFinancialMetrics from '../components/display/CompanyFinancialMetrics';
import CompanyFundingInvestment from '../components/display/CompanyFundingInvestment';
import CompanyRegulatoryLegal from '../components/display/CompanyRegulatoryLegal';
import CompanyNewsRelationships from '../components/display/CompanyNewsRelationships';
import { ArrowLeft, Edit, Download, Share2, AlertCircle, RefreshCw, Star, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { hasSectionAccess, canModifyCompanyData, canExportData, canUseWatchlist, getRoleDisplayName, ACCESS_LEVELS, USER_ROLES } from '../utils/rbac';
import { activityService } from '../lib/activityService';
import { watchlistService } from '../lib/watchlistService';
import AddToWatchlistModal from '../components/common/AddToWatchlistModal';

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userProfile = useUserProfile(user);
  
  // Role-based access control
  const userRole = userProfile?.role || USER_ROLES.FREEMIUM;
  const canModify = canModifyCompanyData(userRole);
  
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState('basic');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const sections = useMemo(() => [
    { id: 'basic', name: 'Basic Info', component: CompanyBasicInfo, accessLevel: ACCESS_LEVELS.BASIC_INFO },
    { id: 'address', name: 'Address & Contact', component: CompanyAddressContact, accessLevel: ACCESS_LEVELS.ADDRESS_CONTACT },
    { id: 'officials', name: 'Key Officials', component: CompanyKeyOfficials, accessLevel: ACCESS_LEVELS.KEY_OFFICIALS },
    { id: 'financial', name: 'Financial Info', component: CompanyFinancialInfo, accessLevel: ACCESS_LEVELS.FINANCIAL_INFO },
    { id: 'metrics', name: 'Financial Metrics', component: CompanyFinancialMetrics, accessLevel: ACCESS_LEVELS.FINANCIAL_METRICS },
    { id: 'funding', name: 'Funding & Investments', component: CompanyFundingInvestment, accessLevel: ACCESS_LEVELS.FUNDING_INVESTMENTS },
    { id: 'regulatory', name: 'Regulatory & Legal', component: CompanyRegulatoryLegal, accessLevel: ACCESS_LEVELS.REGULATORY_LEGAL },
    { id: 'news', name: 'News & Relationships', component: CompanyNewsRelationships, accessLevel: ACCESS_LEVELS.NEWS_RELATIONSHIPS }
  ], []);

  // Check watchlist status
  const checkWatchlistStatus = useCallback(async () => {
    if (!user || !companyId) return;
    
    setWatchlistLoading(true);
    try {
      const watchlists = await watchlistService.getUserWatchlists(user.id);
      const isWatched = watchlists && Array.isArray(watchlists) && watchlists.some(watchlist => 
        watchlist.watchlist_companies && Array.isArray(watchlist.watchlist_companies) && watchlist.watchlist_companies.some(item => item.company_id === companyId)
      );
      setIsInWatchlist(isWatched);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    } finally {
      setWatchlistLoading(false);
    }
  }, [user, companyId]);

  // Ensure current section is accessible, if not, set to first accessible section
  useEffect(() => {
    const accessibleSections = sections.filter(section => hasSectionAccess(userRole, section.accessLevel));
    if (accessibleSections.length > 0 && !accessibleSections.find(section => section.id === currentSection)) {
      setCurrentSection(accessibleSections[0].id);
    }
  }, [userRole, currentSection, sections]);

  // Check watchlist status when user or companyId changes
  useEffect(() => {
    checkWatchlistStatus();
  }, [checkWatchlistStatus]);

  // Fetch company data
  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch company basic info first
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (companyError) {
          if (companyError.code === 'PGRST116') {
            throw new Error('Company not found');
          }
          throw companyError;
        }

        // Fetch related data in parallel
        const [
          { data: addresses },
          { data: contacts },
          { data: officials },
          { data: financials },
          { data: fundingRounds },
          { data: investments },
          { data: regulatoryFilings },
          { data: legalProceedings },
          { data: news },
          { data: relationships }
        ] = await Promise.all([
          supabase.from('company_addresses').select('*').eq('company_id', companyId),
          supabase.from('company_contacts').select('*').eq('company_id', companyId),
          supabase.from('key_officials').select('*').eq('company_id', companyId),
          supabase.from('financial_statements').select('*').eq('company_id', companyId),
          supabase.from('funding_rounds').select(`
            *,
            funding_investors (
              *,
              investors (
                id,
                name,
                investor_type,
                description
              )
            )
          `).eq('company_id', companyId),
          supabase.from('company_investments').select('*').eq('company_id', companyId),
          supabase.from('regulatory_filings').select('*').eq('company_id', companyId),
          supabase.from('legal_proceedings').select('*').eq('company_id', companyId),
          supabase.from('company_news').select('*').eq('company_id', companyId),
          supabase.from('company_relationships').select(`
            *,
            parent_company:parent_company_id(name),
            subsidiary_company:subsidiary_company_id(name)
          `).or(`parent_company_id.eq.${companyId},subsidiary_company_id.eq.${companyId}`)
        ]);

        // Process company relationships to include related company names
        let processedRelationships = [];
        if (relationships && relationships.length > 0) {
          processedRelationships = relationships.map((relationship) => {
              let relatedCompanyName = '';
              let relatedCompanyId = '';

              if (relationship.parent_company_id === companyId) {
                relatedCompanyId = relationship.subsidiary_company_id;
              } else {
                relatedCompanyId = relationship.parent_company_id;
              }

              if (relatedCompanyId) {
                // Use the joined company name from the query
                if (relationship.parent_company_id === companyId) {
                  relatedCompanyName = relationship.subsidiary_company?.name || 'Unknown Company';
                } else {
                  relatedCompanyName = relationship.parent_company?.name || 'Unknown Company';
                }
              }

              let relationshipType = '';
              if (relationship.parent_company_id === companyId) {
                relationshipType = 'PARENT_COMPANY';
              } else if (relationship.subsidiary_company_id === companyId) {
                relationshipType = 'SUBSIDIARY_COMPANY';
              }

              const processedRelationship = {
                ...relationship,
                related_company_name: relatedCompanyName,
                related_company_id: relatedCompanyId,
                relationship_type: relationshipType
              };
              return processedRelationship;
            });
        }

        // Process funding rounds to map funding_investors to investors for display
        const processedFundingRounds = (fundingRounds || []).map(round => ({
          ...round,
          investors: round.funding_investors || [] // Map funding_investors to investors for display component
        }));

        console.log('🔍 Debug - Funding rounds data:', {
          rawFundingRounds: fundingRounds,
          rawFundingRoundsLength: fundingRounds?.length,
          processedFundingRounds: processedFundingRounds,
          processedFundingRoundsLength: processedFundingRounds?.length,
          investments: investments,
          investmentsLength: investments?.length,
          userRole: userRole,
          companyId: companyId
        });

        // Combine all data
        const fullCompanyData = {
          ...company,
          addresses: addresses || [],
          contacts: contacts || [],
          company_addresses: addresses || [],
          company_contacts: contacts || [],
          key_officials: officials || [],
          financial_statements: financials || [],
          funding_rounds: processedFundingRounds,
          company_investments: investments || [],
          regulatory_filings: regulatoryFilings || [],
          legal_proceedings: legalProceedings || [],
          company_news: news || [],
          company_relationships: processedRelationships || []
        };

        // Sort data by created_at (newest first)
        const sortedData = {
          ...fullCompanyData,
          addresses: fullCompanyData.addresses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          contacts: fullCompanyData.contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          company_addresses: fullCompanyData.company_addresses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          company_contacts: fullCompanyData.company_contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          key_officials: fullCompanyData.key_officials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          financial_statements: fullCompanyData.financial_statements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          funding_rounds: fullCompanyData.funding_rounds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          company_investments: fullCompanyData.company_investments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          regulatory_filings: fullCompanyData.regulatory_filings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          legal_proceedings: fullCompanyData.legal_proceedings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          company_news: fullCompanyData.company_news.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          company_relationships: fullCompanyData.company_relationships.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        };

        setCompanyData(sortedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err.message || 'Failed to load company data');
        setCompanyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Log profile view activity
    if (user && companyId) {
      activityService.logActivity({
        user_id: user.id,
        activity_type: 'VIEW_PROFILE',
        company_id: companyId,
        resource_type: 'company_profile',
        ip_address: null,
        user_agent: navigator.userAgent,
        session_id: sessionStorage.getItem('sessionId') || null
      }).catch(error => {
        console.error('Error logging profile view activity:', error);
      });
    }
  }, [companyId, user, userRole]);

  const handleRefresh = async () => {
    if (!companyId) return;
    
    setRefreshing(true);
    try {
      setError(null);

      // Fetch company basic info first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          throw new Error('Company not found');
        }
        throw companyError;
      }

      // Fetch related data in parallel
             const [
         { data: addresses },
         { data: contacts },
         { data: officials },
         { data: financials },
         { data: fundingRounds },
         { data: investments },
        { data: regulatoryFilings },
        { data: legalProceedings },
         { data: news },
        { data: relationships }
       ] = await Promise.all([
        supabase.from('company_addresses').select('*').eq('company_id', companyId),
        supabase.from('company_contacts').select('*').eq('company_id', companyId),
        supabase.from('key_officials').select('*').eq('company_id', companyId),
        supabase.from('financial_statements').select('*').eq('company_id', companyId),
        supabase.from('funding_rounds').select(`
          *,
          funding_investors (
            *,
            investors (
              id,
              name,
              investor_type,
              description
            )
          )
        `).eq('company_id', companyId),
        supabase.from('company_investments').select('*').eq('company_id', companyId),
        supabase.from('regulatory_filings').select('*').eq('company_id', companyId),
        supabase.from('legal_proceedings').select('*').eq('company_id', companyId),
        supabase.from('company_news').select('*').eq('company_id', companyId),
        supabase.from('company_relationships').select(`
          *,
          parent_company:parent_company_id(name),
          subsidiary_company:subsidiary_company_id(name)
        `).or(`parent_company_id.eq.${companyId},subsidiary_company_id.eq.${companyId}`)
      ]);

      // Process company relationships to include related company names
      let processedRelationships = [];
      if (relationships && relationships.length > 0) {
        processedRelationships = await Promise.all(
          relationships.map(async (relationship) => {
            let relatedCompanyName = '';
            let relatedCompanyId = '';

            if (relationship.parent_company_id === companyId) {
              relatedCompanyId = relationship.subsidiary_company_id;
            } else {
              relatedCompanyId = relationship.parent_company_id;
            }

            if (relatedCompanyId) {
              // Use the joined company name from the query
              if (relationship.parent_company_id === companyId) {
                relatedCompanyName = relationship.subsidiary_company?.name || 'Unknown Company';
        } else {
                relatedCompanyName = relationship.parent_company?.name || 'Unknown Company';
              }
            }

            let relationshipType = '';
            if (relationship.parent_company_id === companyId) {
              relationshipType = 'PARENT_COMPANY';
            } else if (relationship.subsidiary_company_id === companyId) {
              relationshipType = 'SUBSIDIARY_COMPANY';
            }

            const processedRelationship = {
              ...relationship,
              related_company_name: relatedCompanyName,
              related_company_id: relatedCompanyId,
              relationship_type: relationshipType
            };
            return processedRelationship;
          })
        );
      }

      // Process funding rounds to map funding_investors to investors for display
      const processedFundingRounds = (fundingRounds || []).map(round => ({
        ...round,
        investors: round.funding_investors || [] // Map funding_investors to investors for display component
      }));

      console.log('🔄 Debug - Refresh funding rounds data:', {
        rawFundingRounds: fundingRounds,
        rawFundingRoundsLength: fundingRounds?.length,
        processedFundingRounds: processedFundingRounds,
        processedFundingRoundsLength: processedFundingRounds?.length,
        investments: investments,
        investmentsLength: investments?.length,
        userRole: userRole,
        companyId: companyId
      });

      // Combine all data
      const fullCompanyData = {
        ...company,
        addresses: addresses || [],
        contacts: contacts || [],
        company_addresses: addresses || [],
        company_contacts: contacts || [],
        key_officials: officials || [],
        financial_statements: financials || [],
        funding_rounds: processedFundingRounds,
        company_investments: investments || [],
        regulatory_filings: regulatoryFilings || [],
        legal_proceedings: legalProceedings || [],
        company_news: news || [],
        company_relationships: processedRelationships || []
      };

      // Sort data by created_at (newest first)
      const sortedData = {
        ...fullCompanyData,
        addresses: fullCompanyData.addresses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        contacts: fullCompanyData.contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        company_addresses: fullCompanyData.company_addresses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        company_contacts: fullCompanyData.company_contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        key_officials: fullCompanyData.key_officials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        financial_statements: fullCompanyData.financial_statements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        funding_rounds: fullCompanyData.funding_rounds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        company_investments: fullCompanyData.company_investments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        regulatory_filings: fullCompanyData.regulatory_filings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        legal_proceedings: fullCompanyData.legal_proceedings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        company_news: fullCompanyData.company_news.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        company_relationships: fullCompanyData.company_relationships.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      };

      setCompanyData(sortedData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing company data:', err);
      setError(err.message || 'Failed to refresh company data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = () => {
    if (!canModify) {
      alert('You do not have permission to edit company data. Only ADMIN users can perform this action.');
      return;
    }
    navigate(`/company/edit/${companyId}`);
  };

  // Helper function to filter export data based on user role
  const getFilteredExportData = (userRole) => {
    const baseData = {
        company: {
          id: companyData.id,
          name: companyData.name,
          legal_name: companyData.legal_name,
          cin: companyData.cin,
          gst: companyData.gst,
          pan: companyData.pan,
          sector: companyData.sector,
          company_type: companyData.company_type,
          status: companyData.status,
          description: companyData.description,
          website: companyData.website,
          linkedin_url: companyData.linkedin_url,
          founded_date: companyData.founded_date,
          employee_count: companyData.employee_count,
          employee_range: companyData.employee_range,
          annual_revenue_range: companyData.annual_revenue_range,
          market_cap: companyData.market_cap,
          is_listed: companyData.is_listed,
          stock_exchange: companyData.stock_exchange,
          stock_symbol: companyData.stock_symbol,
          isin: companyData.isin
        },
        addresses: companyData.addresses,
        contacts: companyData.contacts,
        exported_at: new Date().toISOString(),
      exported_by: user?.email,
      user_role: userRole
    };

    // Add data based on user role access
    if (hasSectionAccess(userRole, ACCESS_LEVELS.KEY_OFFICIALS)) {
      baseData.key_officials = companyData.key_officials;
    }

    if (hasSectionAccess(userRole, ACCESS_LEVELS.FINANCIAL_INFO)) {
      baseData.financial_statements = companyData.financial_statements;
    }

    if (hasSectionAccess(userRole, ACCESS_LEVELS.FUNDING_INVESTMENTS)) {
      baseData.funding_rounds = companyData.funding_rounds;
      baseData.company_investments = companyData.company_investments;
    }

    if (hasSectionAccess(userRole, ACCESS_LEVELS.REGULATORY_LEGAL)) {
      baseData.regulatory_filings = companyData.regulatory_filings;
      baseData.legal_proceedings = companyData.legal_proceedings;
    }

    if (hasSectionAccess(userRole, ACCESS_LEVELS.NEWS_RELATIONSHIPS)) {
      baseData.company_news = companyData.company_news;
      baseData.company_relationships = companyData.company_relationships;
    }

    return baseData;
  };

  const handleDownload = async () => {
    try {
      // Log export activity
      if (user && companyData) {
        try {
          await activityService.logActivity({
            user_id: user.id,
            activity_type: 'EXPORT_DATA',
            company_id: companyData.id,
            resource_type: 'company_report',
            ip_address: null,
            user_agent: navigator.userAgent,
            session_id: sessionStorage.getItem('sessionId') || null
          });
        } catch (error) {
          console.error('Error logging export activity:', error);
        }
      }

      // Create role-filtered company report
      const report = getFilteredExportData(userRole);

      // Add export metadata
      report.export_metadata = {
        user_role: userRole,
        role_display_name: getRoleDisplayName(userRole),
        accessible_sections: sections
          .filter(section => hasSectionAccess(userRole, section.accessLevel))
          .map(section => section.name),
        export_limitations: userRole === USER_ROLES.FREEMIUM 
          ? 'Limited to Basic Info and Address & Contact data only'
          : userRole === USER_ROLES.PREMIUM
          ? 'Includes Basic Info, Address & Contact, Key Officials, Financial Info, and Financial Metrics'
          : userRole === USER_ROLES.ENTERPRISE
          ? 'Includes all company data sections'
          : 'Full administrative access to all data'
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${companyData.name}_${getRoleDisplayName(userRole).toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      linkElement.remove();

      console.log('Company data exported successfully');
    } catch (error) {
      console.error('Error exporting company data:', error);
      setError('Failed to export company data');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `${companyData.name} - Company Profile`,
        text: `Check out ${companyData.name}'s company profile on Venture Flow IQ`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToWatchlist = () => {
    if (!user) {
      alert('Please log in to add companies to your watchlist');
      return;
    }
    
    if (isInWatchlist) {
      // If already in watchlist, navigate to watchlist page
      navigate('/watchlist');
      return;
    }
    
    // Open the modal to let user choose watchlist
    setShowWatchlistModal(true);
  };

  const handleWatchlistSuccess = () => {
    // Refresh watchlist status after successful addition
    checkWatchlistStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user}
          user={userProfile}
          onLogin={() => navigate('/login')}
          onLogout={() => navigate('/')}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user}
          user={userProfile}
          onLogin={() => navigate('/login')}
          onLogout={() => navigate('/')}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Company</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user}
          user={userProfile}
          onLogin={() => navigate('/login')}
          onLogout={() => navigate('/')}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600 mb-4">The company you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const CurrentComponent = sections.find(section => section.id === currentSection)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={() => navigate('/login')}
        onLogout={() => navigate('/')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
              <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
              </button>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
                {companyData.logo_url && (
                  <img 
                    src={companyData.logo_url} 
                    alt={`${companyData.name} logo`}
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div>
                <h1 className="text-2xl font-bold text-gray-900">{companyData.name}</h1>
                {companyData.legal_name && companyData.legal_name !== companyData.name && (
                  <p className="text-gray-600 text-sm mt-1">Legal Name: {companyData.legal_name}</p>
                )}
                  <div className="flex items-center space-x-4 mt-2">
                  {companyData.sector && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {companyData.sector}
                    </span>
                  )}
                  {companyData.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      companyData.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {companyData.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Refresh button - Admin only */}
              {userRole === USER_ROLES.ADMIN && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              )}
              {/* Edit button - Admin only */}
              {userRole === USER_ROLES.ADMIN && (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              )}
              {/* Export button - Premium and above */}
              {canExportData(userRole) && (
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              )}
              {/* Share button - All users */}
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              {/* Watchlist button - All users */}
              {user && canUseWatchlist(userRole) && (
                <button
                  onClick={handleAddToWatchlist}
                  disabled={watchlistLoading}
                  className={`flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                    isInWatchlist ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  <Star className={`h-4 w-4 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
                  {watchlistLoading ? 'Checking...' : isInWatchlist ? 'Added to Watchlist' : 'Add to Watchlist'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Role-based Access Notice */}
        {userRole !== USER_ROLES.ENTERPRISE && userRole !== USER_ROLES.ADMIN && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{getRoleDisplayName(userRole)} Plan - Limited Access</p>
              <p className="text-sm">
                {userRole === USER_ROLES.FREEMIUM 
                  ? 'Upgrade to Premium for financial data access, or Enterprise for complete company insights.' 
                  : 'Upgrade to Enterprise for funding, regulatory, and relationship data access.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {sections.map((section) => {
                const hasAccess = hasSectionAccess(userRole, section.accessLevel);
                const isCurrentSection = currentSection === section.id;
                
                return (
              <button
                key={section.id}
                    onClick={() => hasAccess && setCurrentSection(section.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isCurrentSection
                        ? hasAccess 
                    ? 'border-blue-500 text-blue-600'
                          : 'border-gray-400 text-gray-400'
                        : hasAccess
                          ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          : 'border-transparent text-gray-400 cursor-not-allowed'
                }`}
                    title={!hasAccess ? `Upgrade to ${section.accessLevel === ACCESS_LEVELS.KEY_OFFICIALS ? 'Premium' : 'Enterprise'} to access this section` : ''}
              >
                    <div className="flex items-center">
                {section.name}
                      {!hasAccess && <Lock className="h-3 w-3 ml-1" />}
                    </div>
              </button>
                );
              })}
          </nav>
        </div>

          {/* Content Area */}
          <div className="p-6">
            {hasSectionAccess(userRole, sections.find(s => s.id === currentSection)?.accessLevel) ? (
              CurrentComponent && <CurrentComponent companyData={companyData} />
            ) : (
              <div className="p-8 text-center">
                <Lock className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Upgrade Plan to View Details</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  This section requires {getRoleDisplayName(userRole) === 'Freemium' ? 'Premium or higher' : 'higher'} access to view detailed company information.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800 font-medium mb-2">Available Plans:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Premium:</strong> Key Officials, Financial Info, Financial Metrics</li>
                    <li>• <strong>Enterprise:</strong> All sections including Funding, Regulatory, News</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/contact')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Contact Us to Upgrade
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Watchlist Modal */}
      {showWatchlistModal && companyData && (
        <AddToWatchlistModal
          isOpen={showWatchlistModal}
          onClose={() => setShowWatchlistModal(false)}
          company={companyData}
          onSuccess={handleWatchlistSuccess}
        />
      )}
    </div>
  );
};

export default CompanyDetails;