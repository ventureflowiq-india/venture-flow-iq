import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { supabase } from '../lib/supabase';
import { AlertCircle, Lock } from 'lucide-react';
import CompanyUpload from './CompanyUpload';
import { useUserProfile } from '../hooks/useUserProfile';
import { canModifyCompanyData, getRoleDisplayName, USER_ROLES } from '../utils/rbac';

const EditCompanyPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  
  // Role-based access control
  const userRole = userProfile?.role || USER_ROLES.FREEMIUM;
  const canModify = canModifyCompanyData(userRole);

  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch company basic info
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
        { data: filings },
        { data: legalCases },
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
        supabase.from('company_relationships').select('*').or(`parent_company_id.eq.${companyId},subsidiary_company_id.eq.${companyId}`)
      ]);

      // Process funding rounds to map funding_investors to investors for form
      const fundingRoundsWithInvestors = (fundingRounds || []).map(round => ({
        ...round,
        investors: (round.funding_investors || []).map(fi => ({
          id: fi.investors?.id,
          name: fi.investors?.name,
          investor_type: fi.investors?.investor_type,
          investment_amount: fi.investment_amount,
          is_lead_investor: fi.is_lead_investor,
          board_seat_obtained: fi.board_seat_obtained
        }))
      }));

      // Process company relationships to include related company names
      let processedRelationships = [];
      console.log('🔍 Raw relationships from database:', relationships);
      
      if (relationships && relationships.length > 0) {
        processedRelationships = await Promise.all(
          relationships.map(async (relationship) => {
            let relatedCompanyName = '';
            let relatedCompanyId = '';

            // Determine which company is the related one (not the current company)
            if (relationship.parent_company_id === companyId) {
              // Current company is the parent, so related company is the subsidiary
              relatedCompanyId = relationship.subsidiary_company_id;
            } else {
              // Current company is the subsidiary, so related company is the parent
              relatedCompanyId = relationship.parent_company_id;
            }

            // Fetch the related company details
            if (relatedCompanyId) {
              const { data: relatedCompany } = await supabase
                .from('companies')
                .select('name')
                .eq('id', relatedCompanyId)
                .single();

              if (relatedCompany) {
                relatedCompanyName = relatedCompany.name;
              }
            }

            // Determine relationship type from the perspective of the current company
            let relationshipType = relationship.relationship_type;
            if (relationship.parent_company_id === companyId) {
              // Current company is parent, so relationship type is "Subsidiary"
              relationshipType = 'SUBSIDIARY';
            } else {
              // Current company is subsidiary, so relationship type is "Parent Company"
              relationshipType = 'PARENT_COMPANY';
            }

            const processedRelationship = {
              ...relationship,
              related_company_name: relatedCompanyName,
              related_company_id: relatedCompanyId,
              relationship_type: relationshipType
            };

            console.log('🔍 Processed relationship:', processedRelationship);
            return processedRelationship;
          })
        );
      }
      
      console.log('🔍 Final processed relationships:', processedRelationships);

      // Combine all data
      const fullCompanyData = {
        ...company,
        company_addresses: addresses || [],
        company_contacts: contacts || [],
        key_officials: officials || [],
        financial_statements: financials || [],
        funding_rounds: fundingRoundsWithInvestors || [],
        company_investments: investments || [],
        regulatory_filings: filings || [],
        legal_proceedings: legalCases || [],
        company_news: news || [],
        company_relationships: processedRelationships || []
      };

      setCompanyData(fullCompanyData);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError(error.message || 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCompanyData();
  }, [user, navigate, fetchCompanyData]);

  const handleEditSuccess = () => {
    navigate(`/company/${companyId}`);
  };

  // Check if user has ADMIN access - if not, show access denied
  if (!canModify) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-sm mb-4">
              Only Administrators are allowed to edit company data.
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Your current role: <span className="font-medium">{getRoleDisplayName(userRole)}</span>
            </p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading company data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Company</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(`/company/${companyId}`)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Company Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CompanyUpload 
      mode="edit"
      existingData={companyData}
      onSuccess={handleEditSuccess}
    />
  );
};

export default EditCompanyPage;
