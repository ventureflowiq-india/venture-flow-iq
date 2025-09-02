import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import BasicCompanyInfo from '../components/forms/BasicCompanyInfo';
import AddressContactForm from '../components/forms/AddressContactForm';
import KeyOfficialsForm from '../components/forms/KeyOfficialsForm';
import FinancialInfoForm from '../components/forms/FinancialInfoForm';
import FundingInvestmentForm from '../components/forms/FundingInvestmentForm';
import RegulatoryLegalForm from '../components/forms/RegulatoryLegalForm';
import NewsRelationshipsForm from '../components/forms/NewsRelationshipsForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase, uploadCompanyAsset, getPublicUrl } from '../lib/supabase';
import { Save, Upload, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  canModifyCompanyData, 
  getRoleDisplayName,
  USER_ROLES
} from '../utils/rbac';

// Helper function to generate UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

// Helper function to sanitize timestamp fields
const sanitizeTimestamp = (value) => {
  return value && value.trim() !== '' ? value : null;
};



// Helper function to add timestamps to data objects
const addTimestamps = (data) => {
  const timestamp = new Date().toISOString();
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, created_at: timestamp, updated_at: timestamp }));
  }
  return { ...data, created_at: timestamp, updated_at: timestamp };
};

const CompanyUpload = ({ mode = 'create', existingData = null, onSuccess = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  
  // Role-based access control
  const userRole = userProfile?.role || USER_ROLES.FREEMIUM;
  const canModify = canModifyCompanyData(userRole);
  const [currentStep, setCurrentStep] = useState(() => {
    // Always start from step 1 for new uploads, only restore step for edit mode
    if (mode === 'edit') {
      const savedStep = localStorage.getItem('companyUploadStep');
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadedCompanyId, setUploadedCompanyId] = useState(existingData?.id || null);

  // Clear localStorage when starting a new upload (not edit mode)
  useEffect(() => {
    if (mode !== 'edit') {
      localStorage.removeItem('companyUploadStep');
    }
  }, [mode]);

  const [formData, setFormData] = useState(() => {
    // Try to restore form data from sessionStorage first
    const savedFormData = sessionStorage.getItem('companyUploadFormData');
    if (savedFormData && mode !== 'edit') {
      try {
        const parsed = JSON.parse(savedFormData);
        console.log('Restored form data from sessionStorage:', parsed);
        return parsed;
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    // Initialize with existing data if in edit mode, otherwise use default values
    if (mode === 'edit' && existingData) {
      console.log('=== INITIALIZING FORM DATA FOR EDIT MODE ===');
      console.log('Existing data:', existingData);
      console.log('Legal proceedings:', existingData.legal_proceedings);
      console.log('Company relationships:', existingData.company_relationships);
      console.log('Company relationships length:', existingData.company_relationships?.length);
      console.log('Company investments:', existingData.company_investments);
      console.log('=== END INITIALIZATION LOG ===');
      return {
        // Basic company info
        name: existingData.name || '',
        legal_name: existingData.legal_name || '',
        cin: existingData.cin || '',
        gst: existingData.gst || '',
        pan: existingData.pan || '',
        sector: existingData.sector || '',
        company_type: existingData.company_type || 'PRIVATE',
        status: existingData.status || 'ACTIVE',
        description: existingData.description || '',
        website: existingData.website || '',
        linkedin_url: existingData.linkedin_url || '',
        founded_date: existingData.founded_date || '',
        employee_count: existingData.employee_count || '',
        employee_range: existingData.employee_range || '',
        annual_revenue_range: existingData.annual_revenue_range || '',
        market_cap: existingData.market_cap || '',
        is_listed: existingData.is_listed || false,
        stock_exchange: existingData.stock_exchange || '',
        stock_symbol: existingData.stock_symbol || '',
        isin: existingData.isin || '',
        
        // Financial info (legacy fields - keep for backward compatibility)
        financial_year: '',
        quarter: 'ANNUAL',
        statement_type: 'STANDALONE',
        currency: 'INR',
        period_start_date: '',
        period_end_date: '',
        filed_date: '',
        total_revenue: '',
        net_profit: '',
        gross_profit: '',
        operating_profit: '',
        ebitda: '',
        total_assets: '',
        current_assets: '',
        fixed_assets: '',
        total_liabilities: '',
        current_liabilities: '',
        shareholders_equity: '',
        operating_cash_flow: '',
        investing_cash_flow: '',
        financing_cash_flow: '',
        net_cash_flow: '',
        debt_to_equity_ratio: '',
        current_ratio: '',
        return_on_equity: '',
        return_on_assets: '',
        profit_margin: '',

        // Financial entries from existing data
        financial_entries: Array.isArray(existingData.financial_statements) && existingData.financial_statements.length > 0 
          ? existingData.financial_statements.map(fs => ({
              financial_year: fs.financial_year || '',
              quarter: fs.quarter || 'ANNUAL',
              statement_type: fs.statement_type || 'STANDALONE',
              currency: fs.currency || 'INR',
              period_start_date: fs.period_start_date || '',
              period_end_date: fs.period_end_date || '',
              filed_date: fs.filed_date || '',
              total_revenue: fs.total_revenue || '',
              net_profit: fs.net_profit || '',
              gross_profit: fs.gross_profit || '',
              operating_profit: fs.operating_profit || '',
              ebitda: fs.ebitda || '',
              total_assets: fs.total_assets || '',
              current_assets: fs.current_assets || '',
              fixed_assets: fs.fixed_assets || '',
              total_liabilities: fs.total_liabilities || '',
              current_liabilities: fs.current_liabilities || '',
              shareholders_equity: fs.shareholders_equity || '',
              operating_cash_flow: fs.operating_cash_flow || '',
              investing_cash_flow: fs.investing_cash_flow || '',
              financing_cash_flow: fs.financing_cash_flow || '',
              net_cash_flow: fs.net_cash_flow || '',
              debt_to_equity_ratio: fs.debt_to_equity_ratio || '',
              current_ratio: fs.current_ratio || '',
              return_on_equity: fs.return_on_equity || '',
              return_on_assets: fs.return_on_assets || '',
              profit_margin: fs.profit_margin || ''
            }))
          : [{
              financial_year: '',
              quarter: 'ANNUAL',
              statement_type: 'STANDALONE',
              currency: 'INR',
              period_start_date: '',
              period_end_date: '',
              filed_date: '',
              total_revenue: '',
              net_profit: '',
              gross_profit: '',
              operating_profit: '',
              ebitda: '',
              total_assets: '',
              current_assets: '',
              fixed_assets: '',
              total_liabilities: '',
              current_liabilities: '',
              shareholders_equity: '',
              operating_cash_flow: '',
              investing_cash_flow: '',
              financing_cash_flow: '',
              net_cash_flow: '',
              debt_to_equity_ratio: '',
              current_ratio: '',
              return_on_equity: '',
              return_on_assets: '',
              profit_margin: ''
            }],

        // Address and contact info
        addresses: Array.isArray(existingData.company_addresses) ? existingData.company_addresses : [],
        contacts: Array.isArray(existingData.company_contacts) ? existingData.company_contacts : [],
        
        // Key officials
        key_officials: Array.isArray(existingData.key_officials) ? existingData.key_officials : [],
        
        // Funding and investments
        funding_rounds: Array.isArray(existingData.funding_rounds) ? existingData.funding_rounds : [],
        company_investments: Array.isArray(existingData.company_investments) ? existingData.company_investments : [],
        
        // Regulatory and legal
        regulatory_filings: Array.isArray(existingData.regulatory_filings) ? existingData.regulatory_filings : [],
        legal_proceedings: Array.isArray(existingData.legal_proceedings) ? existingData.legal_proceedings : [],
        
        // News and relationships
        company_news: Array.isArray(existingData.company_news) ? existingData.company_news : [],
        company_relationships: Array.isArray(existingData.company_relationships) ? existingData.company_relationships : []
      };
         } else {
       // Default initialization for create mode
       return {
         // Basic company info
         name: '',
         legal_name: '',
         cin: '',
         gst: '',
         pan: '',
         sector: '',
         company_type: 'PRIVATE',
         status: 'ACTIVE',
         description: '',
         website: '',
         linkedin_url: '',
         founded_date: '',
         employee_count: '',
         employee_range: '',
         annual_revenue_range: '',
         market_cap: '',
         is_listed: false,
         stock_exchange: '',
         stock_symbol: '',
         isin: '',
         
         // Financial info
         financial_year: '',
         quarter: 'ANNUAL',
         statement_type: 'STANDALONE',
         currency: 'INR',
         period_start_date: '',
         period_end_date: '',
         filed_date: '',
         total_revenue: '',
         net_profit: '',
         gross_profit: '',
         operating_profit: '',
         ebitda: '',
         total_assets: '',
         current_assets: '',
         fixed_assets: '',
         total_liabilities: '',
         current_liabilities: '',
         shareholders_equity: '',
         operating_cash_flow: '',
         investing_cash_flow: '',
         financing_cash_flow: '',
         net_cash_flow: '',
         debt_to_equity_ratio: '',
         current_ratio: '',
         return_on_equity: '',
         return_on_assets: '',
         profit_margin: '',

         // New: Multiple financial entries support
         financial_entries: [
           {
             financial_year: '',
             quarter: 'ANNUAL',
             statement_type: 'STANDALONE',
             currency: 'INR',
             period_start_date: '',
             period_end_date: '',
             filed_date: '',
             total_revenue: '',
             net_profit: '',
             gross_profit: '',
             operating_profit: '',
             ebitda: '',
             total_assets: '',
             current_assets: '',
             fixed_assets: '',
             total_liabilities: '',
             current_liabilities: '',
             shareholders_equity: '',
             operating_cash_flow: '',
             investing_cash_flow: '',
             financing_cash_flow: '',
             net_cash_flow: '',
             debt_to_equity_ratio: '',
             current_ratio: '',
             return_on_equity: '',
             return_on_assets: '',
             profit_margin: ''
           }
         ],

         // Arrays for related data
         addresses: [{ address_type: 'REGISTERED', country: 'India', is_primary: true }],
         contacts: [{ contact_type: 'EMAIL', is_primary: true }],
         key_officials: [{ is_current: true, appointment_date: '' }],
         funding_rounds: [{ round_type: 'SEED', round_name: 'Seed Round', funding_date: '', currency: 'INR', round_status: 'ANNOUNCED', investors: [] }],
         company_investments: [{ investment_target: '', investment_date: '', investment_type: 'EQUITY', investment_status: 'ACTIVE' }],
         regulatory_filings: [],
         legal_proceedings: [],
         company_news: [{ title: '', content: '', source_name: '', published_date: '', sentiment: 'NEUTRAL', tags: [] }],
         company_relationships: [{ relationship_type: 'SUBSIDIARY', effective_date: '' }]
       };
     }
   });

  // Debug logging for form data changes
  useEffect(() => {
    console.log('Form data updated:', {
      currentStep,
      company_investments: formData.company_investments,
      company_investments_length: formData.company_investments?.length,
      funding_rounds: formData.funding_rounds,
      funding_rounds_length: formData.funding_rounds?.length
    });
  }, [formData.company_investments, formData.funding_rounds, currentStep]);

  // Save form data to sessionStorage whenever it changes (only in create mode)
  useEffect(() => {
    if (mode !== 'edit') {
      sessionStorage.setItem('companyUploadFormData', JSON.stringify(formData));
    }
  }, [formData, mode]);

  // Cleanup sessionStorage when component unmounts (only in create mode)
  useEffect(() => {
    return () => {
      if (mode !== 'edit') {
        // Only clear if we're not in edit mode and not successfully submitted
        if (!successMessage) {
          sessionStorage.removeItem('companyUploadFormData');
        }
      }
    };
  }, [mode, successMessage]);

  const steps = [
    { id: 1, name: 'Basic Info', component: BasicCompanyInfo },
    { id: 2, name: 'Address & Contact', component: AddressContactForm },
    { id: 3, name: 'Key Officials', component: KeyOfficialsForm },
    { id: 4, name: 'Financial Info', component: FinancialInfoForm },
    { id: 5, name: 'Funding & Investments', component: FundingInvestmentForm },
    { id: 6, name: 'Regulatory & Legal', component: RegulatoryLegalForm },
    { id: 7, name: 'News & Relationships', component: NewsRelationshipsForm }
  ];

  // Function to calculate financial ratios
  const calculateFinancialRatios = (financialData) => {
    const ratios = {};
    
    // Helper function to safely parse and validate numbers
    const safeParseFloat = (value) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) || parsed === 0 ? null : parsed;
    };
    
    // Debt-to-Equity Ratio = Total Liabilities / Shareholders' Equity
    const totalLiabilities = safeParseFloat(financialData.total_liabilities);
    const shareholdersEquity = safeParseFloat(financialData.shareholders_equity);
    if (totalLiabilities && shareholdersEquity) {
      const ratio = totalLiabilities / shareholdersEquity;
      ratios.debt_to_equity_ratio = ratio.toFixed(2);
    }
    
    // Current Ratio = Current Assets / Current Liabilities
    const currentAssets = safeParseFloat(financialData.current_assets);
    const currentLiabilities = safeParseFloat(financialData.current_liabilities);
    if (currentAssets && currentLiabilities) {
      const ratio = currentAssets / currentLiabilities;
      ratios.current_ratio = ratio.toFixed(2);
    }
    
    // Return on Equity (ROE) = Net Profit / Shareholders' Equity
    const netProfit = safeParseFloat(financialData.net_profit);
    if (netProfit && shareholdersEquity) {
      const roe = (netProfit / shareholdersEquity) * 100;
      ratios.return_on_equity = roe.toFixed(2);
    }
    
    // Return on Assets (ROA) = Net Profit / Total Assets
    const totalAssets = safeParseFloat(financialData.total_assets);
    if (netProfit && totalAssets) {
      const roa = (netProfit / totalAssets) * 100;
      ratios.return_on_assets = roa.toFixed(2);
    }
    
    // Profit Margin = (Net Profit / Total Revenue) * 100
    const totalRevenue = safeParseFloat(financialData.total_revenue);
    if (netProfit && totalRevenue) {
      const margin = (netProfit / totalRevenue) * 100;
      ratios.profit_margin = margin.toFixed(2);
    }
    
    return ratios;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Auto-calculate financial ratios when relevant fields change
    const financialFields = [
      'total_revenue', 'net_profit', 'total_assets', 'current_assets', 
      'total_liabilities', 'current_liabilities', 'shareholders_equity'
    ];
    
    if (financialFields.includes(name)) {
      const currentData = { ...formData, [name]: value };
      const calculatedRatios = calculateFinancialRatios(currentData);
      
      console.log('Calculating ratios for field:', name, 'with value:', value);
      console.log('Calculated ratios:', calculatedRatios);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...calculatedRatios
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Financial entries (multi-year) handlers
  const handleAddFinancialEntry = () => {
    setFormData(prev => ({
      ...prev,
      financial_entries: [
        ...(Array.isArray(prev.financial_entries) ? prev.financial_entries : []),
        {
          financial_year: '',
          quarter: 'ANNUAL',
          statement_type: 'STANDALONE',
          currency: 'INR',
          period_start_date: '',
          period_end_date: '',
          filed_date: '',
          total_revenue: '',
          net_profit: '',
          gross_profit: '',
          operating_profit: '',
          ebitda: '',
          total_assets: '',
          current_assets: '',
          fixed_assets: '',
          total_liabilities: '',
          current_liabilities: '',
          shareholders_equity: '',
          operating_cash_flow: '',
          investing_cash_flow: '',
          financing_cash_flow: '',
          net_cash_flow: '',
          debt_to_equity_ratio: '',
          current_ratio: '',
          return_on_equity: '',
          return_on_assets: '',
          profit_margin: ''
        }
      ]
    }));
  };

  const handleRemoveFinancialEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      financial_entries: (Array.isArray(prev.financial_entries) ? prev.financial_entries : []).filter((_, i) => i !== index)
    }));
  };

  const handleChangeFinancialEntry = (index, name, value) => {
    setFormData(prev => {
      const updatedEntries = (Array.isArray(prev.financial_entries) ? prev.financial_entries : []).map((entry, i) => {
        if (i !== index) return entry;
        const updated = { ...entry, [name]: value };
        const calculated = calculateFinancialRatios(updated);
        return { ...updated, ...calculated };
      });
      return { ...prev, financial_entries: updatedEntries };
    });
  };

  const handleAddAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...(Array.isArray(prev.addresses) ? prev.addresses : []), { address_type: '', country: 'India', is_primary: false }]
    }));
  };

  const handleRemoveAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: (Array.isArray(prev.addresses) ? prev.addresses : []).filter((_, i) => i !== index)
    }));
  };

  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...(Array.isArray(prev.contacts) ? prev.contacts : []), { contact_type: '', is_primary: false }]
    }));
  };

  const handleRemoveContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contacts: (Array.isArray(prev.contacts) ? prev.contacts : []).filter((_, i) => i !== index)
    }));
  };

  const handleAddOfficial = () => {
    setFormData(prev => ({
      ...prev,
      key_officials: [...(Array.isArray(prev.key_officials) ? prev.key_officials : []), { is_current: true, appointment_date: '' }]
    }));
  };

  const handleRemoveOfficial = (index) => {
    setFormData(prev => ({
      ...prev,
      key_officials: (Array.isArray(prev.key_officials) ? prev.key_officials : []).filter((_, i) => i !== index)
    }));
  };

     // Funding Rounds handlers
     const handleAddFundingRound = () => {
    setFormData(prev => ({
      ...prev,
      funding_rounds: [...(Array.isArray(prev.funding_rounds) ? prev.funding_rounds : []), { round_type: '', round_name: '', funding_date: '', currency: 'INR', round_status: 'ANNOUNCED', investors: [] }]
    }));
  };

  const handleRemoveFundingRound = (index) => {
    setFormData(prev => ({
      ...prev,
      funding_rounds: (Array.isArray(prev.funding_rounds) ? prev.funding_rounds : []).filter((_, i) => i !== index)
    }));
  };

  // Company Investments handlers
  const handleAddInvestment = () => {
    setFormData(prev => ({
      ...prev,
      company_investments: [...(Array.isArray(prev.company_investments) ? prev.company_investments : []), { investment_target: '', investment_date: '', investment_type: 'EQUITY', investment_status: 'ACTIVE' }]
    }));
  };

  const handleRemoveInvestment = (index) => {
    setFormData(prev => ({
      ...prev,
      company_investments: (Array.isArray(prev.company_investments) ? prev.company_investments : []).filter((_, i) => i !== index)
    }));
  };

     // Regulatory Filings handlers
     const handleAddFiling = () => {
    setFormData(prev => ({
      ...prev,
      regulatory_filings: [...(Array.isArray(prev.regulatory_filings) ? prev.regulatory_filings : []), { filing_type: '', filing_date: '', status: 'PENDING', priority: 'MEDIUM', remarks: '', fees_paid: '', document_file: null }]
    }));
  };

  const handleRemoveFiling = (index) => {
    setFormData(prev => ({
      ...prev,
      regulatory_filings: (Array.isArray(prev.regulatory_filings) ? prev.regulatory_filings : []).filter((_, i) => i !== index)
    }));
  };

  // Legal Proceedings handlers
  const handleAddLegalCase = () => {
    setFormData(prev => ({
      ...prev,
      legal_proceedings: [...(Array.isArray(prev.legal_proceedings) ? prev.legal_proceedings : []), { case_title: '', case_type: 'OTHER', caseStatus: 'PENDING', case_number: '', court_name: '', filing_date: '', description: '', amount_involved: '' }]
    }));
  };

  const handleRemoveLegalCase = (index) => {
    setFormData(prev => ({
      ...prev,
      legal_proceedings: (Array.isArray(prev.legal_proceedings) ? prev.legal_proceedings : []).filter((_, i) => i !== index)
    }));
  };

  // News handlers
  const handleAddNews = () => {
    setFormData(prev => ({
      ...prev,
      company_news: [...(Array.isArray(prev.company_news) ? prev.company_news : []), { title: '', content: '', source_name: '', published_date: '', sentiment: 'NEUTRAL', tags: [] }]
    }));
  };

  const handleRemoveNews = (index) => {
    setFormData(prev => ({
      ...prev,
      company_news: (Array.isArray(prev.company_news) ? prev.company_news : []).filter((_, i) => i !== index)
    }));
  };

  // Company Relationships handlers
  const handleAddRelationship = () => {
    setFormData(prev => ({
      ...prev,
      company_relationships: [...(Array.isArray(prev.company_relationships) ? prev.company_relationships : []), { relationship_type: 'SUBSIDIARY', effective_date: '' }]
    }));
  };

  const handleRemoveRelationship = (index) => {
    setFormData(prev => ({
      ...prev,
      company_relationships: (Array.isArray(prev.company_relationships) ? prev.company_relationships : []).filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name) newErrors.name = 'Company name is required';
        if (!formData.sector) newErrors.sector = 'Sector is required';
        // All other fields are optional
        break;
      case 2:
        // No validation required - all address and contact fields are optional
        break;
      case 3:
        // No validation required - all key officials fields are optional
        // Designation will be set to a default value if empty to satisfy NOT NULL constraint
        break;
      case 4:
        // No validation required - all financial fields are optional
        break;
      case 5:
        // No validation required - all funding and investment fields are optional
        break;
      case 6:
        // No validation required - all regulatory and legal fields are optional
        break;
      case 7:
        // No validation required - all news and relationship fields are optional
        break;
      default:
        // No validation needed for other steps
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, steps.length);
      setCurrentStep(nextStep);
      localStorage.setItem('companyUploadStep', nextStep.toString());
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      localStorage.setItem('companyUploadStep', prevStep.toString());
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    console.log('=== SUBMITTING COMPANY DATA ===');
    console.log('Mode:', mode);
    console.log('Form data:', formData);
    console.log('Funding rounds:', formData.funding_rounds);
    console.log('Funding rounds length:', formData.funding_rounds?.length);
    console.log('Company investments:', formData.company_investments);
    console.log('Company news:', formData.company_news);
    console.log('Company news length:', formData.company_news?.length);
    console.log('=== END FORM DATA ===');

    try {
      // Use existing company ID if in edit mode, otherwise generate new one
      const companyId = mode === 'edit' ? existingData.id : generateUUID();
      
      // Upload logo if provided
      let logoUrl = null;
      if (formData.logo && formData.logo[0]) {
        try {
          console.log('Uploading logo for company:', companyId);
          console.log('Logo file:', formData.logo[0]);
          
          const { data: uploadData, error: uploadError } = await uploadCompanyAsset(formData.logo[0], companyId, 'logo');
          
          if (uploadError) {
            console.error('Logo upload error:', uploadError);
            // If storage upload fails, we'll continue without the logo
            // The user can upload it later through the admin interface
          } else {
            console.log('Logo upload successful:', uploadData);
            console.log('Upload data path:', uploadData.path);
            console.log('Upload data full object:', uploadData);
            
            if (!uploadData || !uploadData.path) {
              console.error('Upload data missing path:', uploadData);
              logoUrl = null;
            } else {
              console.log('About to call getPublicUrl with bucket: company-assets, path:', uploadData.path);
              logoUrl = getPublicUrl('company-assets', uploadData.path);
              console.log('Generated logo URL:', logoUrl);
              console.log('Final logoUrl value:', logoUrl);
              
              // Validate the URL
              if (!logoUrl || logoUrl === 'null' || logoUrl === 'undefined') {
                console.error('Invalid logo URL generated:', logoUrl);
                logoUrl = null;
              }
            }
          }
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          // Continue without logo upload - this is not critical for company creation
        }
      }
      
      // Upload company data to Supabase
      console.log('=== FINAL LOGO URL CHECK ===');
      console.log('Final logoUrl value before database insert:', logoUrl);
      console.log('logoUrl type:', typeof logoUrl);
      console.log('logoUrl truthy?', !!logoUrl);
      console.log('=== END LOGO URL CHECK ===');
      
      const companyData = {
        id: companyId,
        name: formData.name,
        name_lowercase: formData.name.toLowerCase(),
        legal_name: formData.legal_name || null,
        cin: formData.cin || null,
        gst: formData.gst || null,
        pan: formData.pan || null,
        sector: formData.sector,
        company_type: formData.company_type,
        status: formData.status,
        description: formData.description || null,
        website: formData.website || null,
        linkedin_url: formData.linkedin_url || null,
        logo_url: logoUrl || existingData?.logo_url,
        founded_date: sanitizeTimestamp(formData.founded_date),
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        employee_range: formData.employee_range || null,
        annual_revenue_range: formData.annual_revenue_range || null,
        market_cap: formData.market_cap ? parseFloat(formData.market_cap) : null,
        is_listed: formData.is_listed,
        stock_exchange: formData.stock_exchange || null,
        stock_symbol: formData.stock_symbol || null,
        isin: formData.isin || null,
        updated_at: new Date().toISOString(),
      };

      // Add created_at only for new companies
      if (mode === 'create') {
        companyData.created_at = new Date().toISOString();
      }

      console.log('Company data to', mode === 'edit' ? 'update' : 'insert', ':', companyData);
      
      let companyError;
      if (mode === 'edit') {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', companyId);
        companyError = error;
      } else {
        // Insert new company
        const { error } = await supabase
          .from('companies')
          .insert([companyData]);
        companyError = error;
      }

      if (companyError) throw companyError;

      // Handle addresses
      if (mode === 'edit') {
        // Delete existing addresses
        const { error: deleteAddressError } = await supabase
          .from('company_addresses')
          .delete()
          .eq('company_id', companyId);
        
        if (deleteAddressError) throw deleteAddressError;
      }

      if (Array.isArray(formData.addresses) && formData.addresses.length > 0) {
        const addressesData = addTimestamps(formData.addresses
          .filter(addr => addr.address_line_1 && addr.address_line_1.trim() !== '' && addr.city && addr.city.trim() !== '' && addr.state && addr.state.trim() !== '' && addr.zip_code && addr.zip_code.trim() !== '') // Only include addresses with all required fields
          .map(addr => ({
            id: generateUUID(),
            company_id: companyId,
            address_type: addr.address_type || 'OTHER',
            address_line_1: addr.address_line_1,
            address_line_2: addr.address_line_2 || null,
            city: addr.city,
            state: addr.state,
            zip_code: addr.zip_code,
            country: addr.country || 'India',
            latitude: addr.latitude ? parseFloat(addr.latitude) : null,
            longitude: addr.longitude ? parseFloat(addr.longitude) : null,
            is_primary: addr.is_primary || false
          })));
        
        if (addressesData.length > 0) {
          const { error: addressError } = await supabase
            .from('company_addresses')
            .insert(addressesData);
          
          if (addressError) throw addressError;
        }
      }

      // Handle contacts
      if (mode === 'edit') {
        // Delete existing contacts
        const { error: deleteContactError } = await supabase
          .from('company_contacts')
          .delete()
          .eq('company_id', companyId);
        
        if (deleteContactError) throw deleteContactError;
      }

      if (Array.isArray(formData.contacts) && formData.contacts.length > 0) {
        const contactsData = addTimestamps(formData.contacts
          .filter(contact => contact.contact_type && contact.contact_type.trim() !== '' && contact.contact_value && contact.contact_value.trim() !== '') // Only include contacts with all required fields
          .map(contact => ({
            id: generateUUID(),
            company_id: companyId,
            contact_type: contact.contact_type,
            contact_value: contact.contact_value,
            department: contact.department || null,
            is_verified: contact.is_verified || false,
            is_primary: contact.is_primary || false
          })));
        
        if (contactsData.length > 0) {
          const { error: contactError } = await supabase
            .from('company_contacts')
            .insert(contactsData);
          
          if (contactError) throw contactError;
        }
      }

      // Handle key officials
      if (mode === 'edit') {
        // Delete existing key officials
        const { error: deleteOfficialError } = await supabase
          .from('key_officials')
          .delete()
          .eq('company_id', companyId);
        
        if (deleteOfficialError) throw deleteOfficialError;
      }

      if (Array.isArray(formData.key_officials) && formData.key_officials.length > 0) {
        console.log('Processing key officials:', formData.key_officials);
        
        const officialsData = addTimestamps(formData.key_officials
          .filter(official => {
            // Include all officials, even with empty names, since everything is optional
            const hasAnyData = (official.name && official.name.trim() !== '') || 
                              (official.designation && official.designation.trim() !== '') ||
                              (official.din && official.din.trim() !== '') ||
                              (official.email && official.email.trim() !== '');
            console.log('Official filter check:', { 
              name: official.name, 
              designation: official.designation, 
              hasAnyData,
              willInclude: hasAnyData 
            });
            return hasAnyData; // Include if any field has data
          }) // Include officials with any data
          .map(official => ({
            id: generateUUID(),
            company_id: companyId,
            name: official.name || 'Not Specified', // Provide default value for NOT NULL constraint
            designation: official.designation || 'Not Specified', // Provide default value for NOT NULL constraint
            din: official.din || null,
            age: official.age ? parseInt(official.age) : null,
            education: official.education || null,
            previous_experience: official.previous_experience || null,
            email: official.email || null,
            phone: official.phone || null,
            appointment_date: official.appointment_date && official.appointment_date.trim() !== '' ? sanitizeTimestamp(official.appointment_date) : null,
            resignation_date: official.resignation_date && official.resignation_date.trim() !== '' ? sanitizeTimestamp(official.resignation_date) : null,
            is_current: official.is_current !== false,
            is_board_member: official.is_board_member || false
          })));
        
        console.log('Filtered officials data:', officialsData);
        
        if (officialsData.length > 0) {
          const { error: officialError } = await supabase
            .from('key_officials')
            .insert(officialsData);
          
          if (officialError) {
            console.error('Error inserting key officials:', officialError);
            throw officialError;
          }
          console.log('Key officials inserted successfully');
        } else {
          console.log('No valid key officials to insert');
          // Show warning if officials were provided but filtered out
          if (formData.key_officials && formData.key_officials.length > 0) {
            console.warn('Some officials were not saved because they had no data in any field');
          }
        }
      }

      // Handle financial data
      if (mode === 'edit') {
        // Delete existing financial statements
        const { error: deleteFinancialError } = await supabase
          .from('financial_statements')
          .delete()
          .eq('company_id', companyId);
        
        if (deleteFinancialError) throw deleteFinancialError;
      }

      if (Array.isArray(formData.financial_entries) && formData.financial_entries.length > 0) {
        const entriesWithData = formData.financial_entries.filter(entry => (
          (entry.total_revenue && entry.total_revenue.toString().trim() !== '') ||
          (entry.net_profit && entry.net_profit.toString().trim() !== '') ||
          (entry.total_assets && entry.total_assets.toString().trim() !== '') ||
          (entry.gross_profit && entry.gross_profit.toString().trim() !== '') ||
          (entry.operating_profit && entry.operating_profit.toString().trim() !== '') ||
          (entry.ebitda && entry.ebitda.toString().trim() !== '') ||
          (entry.period_start_date && entry.period_start_date.toString().trim() !== '')
        ));

        if (entriesWithData.length > 0) {
          const financialRows = addTimestamps(entriesWithData.map(entry => ({
            id: generateUUID(),
            company_id: companyId,
            total_revenue: entry.total_revenue ? parseFloat(entry.total_revenue) : null,
            net_profit: entry.net_profit ? parseFloat(entry.net_profit) : null,
            gross_profit: entry.gross_profit ? parseFloat(entry.gross_profit) : null,
            operating_profit: entry.operating_profit ? parseFloat(entry.operating_profit) : null,
            ebitda: entry.ebitda ? parseFloat(entry.ebitda) : null,
            total_assets: entry.total_assets ? parseFloat(entry.total_assets) : null,
            current_assets: entry.current_assets ? parseFloat(entry.current_assets) : null,
            fixed_assets: entry.fixed_assets ? parseFloat(entry.fixed_assets) : null,
            total_liabilities: entry.total_liabilities ? parseFloat(entry.total_liabilities) : null,
            shareholders_equity: entry.shareholders_equity ? parseFloat(entry.shareholders_equity) : null,
            operating_cash_flow: entry.operating_cash_flow ? parseFloat(entry.operating_cash_flow) : null,
            investing_cash_flow: entry.investing_cash_flow ? parseFloat(entry.investing_cash_flow) : null,
            financing_cash_flow: entry.financing_cash_flow ? parseFloat(entry.financing_cash_flow) : null,
            net_cash_flow: entry.net_cash_flow ? parseFloat(entry.net_cash_flow) : null,
            debt_to_equity_ratio: entry.debt_to_equity_ratio ? parseFloat(entry.debt_to_equity_ratio) : null,
            current_ratio: entry.current_ratio ? parseFloat(entry.current_ratio) : null,
            return_on_equity: entry.return_on_equity ? parseFloat(entry.return_on_equity) : null,
            return_on_assets: entry.return_on_assets ? parseFloat(entry.return_on_assets) : null,
            profit_margin: entry.profit_margin ? parseFloat(entry.profit_margin) : null,
            financial_year: entry.financial_year && entry.financial_year.toString().trim() !== '' ? parseInt(entry.financial_year) : null,
            period_start_date: entry.period_start_date && entry.period_start_date.toString().trim() !== '' ? sanitizeTimestamp(entry.period_start_date) : null,
            period_end_date: entry.period_end_date && entry.period_end_date.toString().trim() !== '' ? sanitizeTimestamp(entry.period_end_date) : null,
            filed_date: entry.filed_date && entry.filed_date.toString().trim() !== '' ? sanitizeTimestamp(entry.filed_date) : null,
            quarter: entry.quarter,
            statement_type: entry.statement_type,
            currency: entry.currency
          })));

          const { error: financialArrayError } = await supabase
            .from('financial_statements')
            .insert(financialRows);

          if (financialArrayError) {
            console.error('Error inserting financial statements array:', financialArrayError);
            throw financialArrayError;
          }
          console.log('Financial statements (multiple) inserted successfully');
        }
      } else if ((formData.total_revenue && formData.total_revenue.trim() !== '') || 
          (formData.net_profit && formData.net_profit.trim() !== '') || 
          (formData.total_assets && formData.total_assets.trim() !== '') ||
          (formData.period_start_date && formData.period_start_date.trim() !== '')) {
        console.log('Processing financial statements data:', {
          period_start_date: formData.period_start_date,
          period_end_date: formData.period_end_date,
          financial_year: formData.financial_year,
          total_revenue: formData.total_revenue,
          net_profit: formData.net_profit
        });
        
        // Only validate that we have some meaningful financial data
        const hasFinancialData = (formData.total_revenue && formData.total_revenue.trim() !== '') || 
                                (formData.net_profit && formData.net_profit.trim() !== '') || 
                                (formData.total_assets && formData.total_assets.trim() !== '') ||
                                (formData.gross_profit && formData.gross_profit.trim() !== '') ||
                                (formData.operating_profit && formData.operating_profit.trim() !== '') ||
                                (formData.ebitda && formData.ebitda.trim() !== '');
        
        if (hasFinancialData) {
          console.log('Inserting financial data with values:', {
            total_revenue: formData.total_revenue,
            net_profit: formData.net_profit,
            total_assets: formData.total_assets,
            financial_year: formData.financial_year,
            period_start_date: formData.period_start_date
          });
          
          const { error: financialError } = await supabase
            .from('financial_statements')
            .insert([addTimestamps({
              id: generateUUID(),
              company_id: companyId,
              total_revenue: formData.total_revenue ? parseFloat(formData.total_revenue) : null,
              net_profit: formData.net_profit ? parseFloat(formData.net_profit) : null,
              gross_profit: formData.gross_profit ? parseFloat(formData.gross_profit) : null,
              operating_profit: formData.operating_profit ? parseFloat(formData.operating_profit) : null,
              ebitda: formData.ebitda ? parseFloat(formData.ebitda) : null,
              total_assets: formData.total_assets ? parseFloat(formData.total_assets) : null,
              current_assets: formData.current_assets ? parseFloat(formData.current_assets) : null,
              fixed_assets: formData.fixed_assets ? parseFloat(formData.fixed_assets) : null,
              total_liabilities: formData.total_liabilities ? parseFloat(formData.total_liabilities) : null,
              shareholders_equity: formData.shareholders_equity ? parseFloat(formData.shareholders_equity) : null,
              operating_cash_flow: formData.operating_cash_flow ? parseFloat(formData.operating_cash_flow) : null,
              investing_cash_flow: formData.investing_cash_flow ? parseFloat(formData.investing_cash_flow) : null,
              financing_cash_flow: formData.financing_cash_flow ? parseFloat(formData.financing_cash_flow) : null,
              net_cash_flow: formData.net_cash_flow ? parseFloat(formData.net_cash_flow) : null,
              debt_to_equity_ratio: formData.debt_to_equity_ratio ? parseFloat(formData.debt_to_equity_ratio) : null,
              current_ratio: formData.current_ratio ? parseFloat(formData.current_ratio) : null,
              return_on_equity: formData.return_on_equity ? parseFloat(formData.return_on_equity) : null,
              return_on_assets: formData.return_on_assets ? parseFloat(formData.return_on_assets) : null,
              profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : null,
              financial_year: formData.financial_year && formData.financial_year.trim() !== '' ? parseInt(formData.financial_year) : null,
              period_start_date: formData.period_start_date && formData.period_start_date.trim() !== '' ? sanitizeTimestamp(formData.period_start_date) : null,
              period_end_date: formData.period_end_date && formData.period_end_date.trim() !== '' ? sanitizeTimestamp(formData.period_end_date) : null,
              filed_date: formData.filed_date && formData.filed_date.trim() !== '' ? sanitizeTimestamp(formData.filed_date) : null,
              quarter: formData.quarter,
              statement_type: formData.statement_type,
              currency: formData.currency
            })]);
          
          if (financialError) {
            console.error('Error inserting financial statements:', financialError);
            throw financialError;
          }
          console.log('Financial statements inserted successfully');
        }
      }

             // Handle funding rounds
       if (mode === 'edit') {
         // Delete existing funding rounds
         const { error: deleteFundingError } = await supabase
           .from('funding_rounds')
           .delete()
           .eq('company_id', companyId);
         
         if (deleteFundingError) throw deleteFundingError;
       }

       if (Array.isArray(formData.funding_rounds) && formData.funding_rounds.length > 0) {
         console.log('Processing funding rounds:', formData.funding_rounds);
         console.log('Funding rounds before filtering:', formData.funding_rounds);
         
         const fundingRoundsData = addTimestamps(formData.funding_rounds
           .filter(round => {
             // In edit mode, be more lenient - just require at least one meaningful field
             if (mode === 'edit') {
               return (round.round_type && round.round_type.trim() !== '') || 
                      (round.round_name && round.round_name.trim() !== '') || 
                      (round.funding_date && round.funding_date.trim() !== '') ||
                      (round.amount_raised && round.amount_raised.toString().trim() !== '');
             }
             // In create mode, require meaningful data beyond defaults
             return (round.round_type && round.round_type.trim() !== '' && round.round_type !== 'SEED') || 
                    (round.round_name && round.round_name.trim() !== '' && round.round_name !== 'Seed Round') ||
                    (round.funding_date && round.funding_date.trim() !== '') ||
                    (round.amount_raised && round.amount_raised.toString().trim() !== '') ||
                    (round.investors && round.investors.length > 0);
           })
           .map(round => ({
             id: generateUUID(),
             company_id: companyId,
             round_type: round.round_type,
             round_name: round.round_name, // Required field
             amount_raised: round.amount_raised ? parseFloat(round.amount_raised) : null,
             currency: round.currency || 'INR',
             valuation_pre_money: round.valuation_pre_money ? parseFloat(round.valuation_pre_money) : null,
             valuation_post_money: round.valuation_post_money ? parseFloat(round.valuation_post_money) : null,
             funding_date: sanitizeTimestamp(round.funding_date), // Required field
             announcement_date: sanitizeTimestamp(round.announcement_date),
             total_investors_count: round.total_investors_count ? parseInt(round.total_investors_count) : null,
             round_status: round.round_status || 'ANNOUNCED',
             use_of_funds: round.use_of_funds || null
           })));
         
         console.log('Filtered funding rounds data:', fundingRoundsData);
         console.log('Funding rounds after filtering count:', fundingRoundsData.length);
         
         if (fundingRoundsData.length > 0) {
           const { error: fundingError } = await supabase
             .from('funding_rounds')
             .insert(fundingRoundsData);
           
           if (fundingError) {
             console.error('Error inserting funding rounds:', fundingError);
             throw fundingError;
           }
           console.log('Funding rounds inserted successfully');
           
           // Now process investors for each funding round
           for (let i = 0; i < fundingRoundsData.length; i++) {
             const round = fundingRoundsData[i];
             const originalRound = formData.funding_rounds[i];
             
             if (Array.isArray(originalRound.investors) && originalRound.investors.length > 0) {
               console.log(`Processing ${originalRound.investors.length} investors for funding round:`, round.id);
               
               // Process each investor
               for (const investor of originalRound.investors) {
                 if (investor.name && investor.investor_type) {
                   console.log('Processing investor:', investor);
                   
                   // First, create or find the investor record
                   let investorId = null;
                   
                   // Check if investor already exists
                   const { data: existingInvestor } = await supabase
                     .from('investors')
                     .select('id')
                     .eq('name', investor.name)
                     .eq('investor_type', investor.investor_type)
                     .single();
                   
                   if (existingInvestor) {
                     investorId = existingInvestor.id;
                     console.log('Found existing investor:', investorId);
                   } else {
                     // Create new investor record
                     const newInvestor = addTimestamps({
                       id: generateUUID(),
                       name: investor.name,
                       investor_type: investor.investor_type,
                       description: `Investor in ${originalRound.round_name || originalRound.round_type} round`,
                       is_active: true
                     });
                     
                     const { error: investorError } = await supabase
                       .from('investors')
                       .insert([newInvestor]);
                     
                     if (investorError) {
                       console.error('Error creating investor:', investorError);
                       throw investorError;
                     }
                     
                     investorId = newInvestor.id;
                     console.log('Created new investor:', investorId);
                   }
                   
                                       // Now create the funding_investors relationship
                    // Note: funding_investors table only has created_at, no updated_at
                    const fundingInvestor = {
                      id: generateUUID(),
                      funding_round_id: round.id,
                      investor_id: investorId,
                      company_id: companyId,
                      investment_amount: investor.investment_amount ? parseFloat(investor.investment_amount) : null,
                      is_lead_investor: investor.is_lead_investor || false,
                      board_seat_obtained: investor.board_seat_obtained || false
                      // created_at will be set automatically by the database default
                    };
                   
                   const { error: fundingInvestorError } = await supabase
                     .from('funding_investors')
                     .insert([fundingInvestor]);
                   
                   if (fundingInvestorError) {
                     console.error('Error creating funding investor relationship:', fundingInvestorError);
                     throw fundingInvestorError;
                   }
                   
                   console.log('Created funding investor relationship:', fundingInvestor.id);
                 }
               }
             }
           }
         } else {
           console.log('No valid funding rounds to insert');
         }
       }

      // Handle company investments
      if (mode === 'edit') {
        // Delete existing company investments
        const { error: deleteInvestmentError } = await supabase
          .from('company_investments')
          .delete()
          .eq('company_id', companyId);
        
        if (deleteInvestmentError) throw deleteInvestmentError;
      }

      if (Array.isArray(formData.company_investments) && formData.company_investments.length > 0) {
        console.log('Processing company investments:', formData.company_investments);
        console.log('Company investments before filtering:', formData.company_investments);
        
        // Process each investment and create placeholder companies for targets
        const investmentsData = [];
        
        for (const investment of formData.company_investments) {
          // Filter validation
          let isValid = false;
          if (mode === 'edit') {
            isValid = (investment.investment_target && investment.investment_target.trim() !== '') || 
                     (investment.investment_date && investment.investment_date.trim() !== '') ||
                     (investment.investment_amount && investment.investment_amount.toString().trim() !== '') ||
                     (investment.description && investment.description.trim() !== '');
          } else {
            isValid = investment.investment_target && investment.investment_target.trim() !== '';
          }
          
          if (!isValid) continue;
          
          // Create a placeholder company for the investment target if it has a name
          let investeeCompanyId = null;
          if (investment.investment_target && investment.investment_target.trim() !== '') {
            investeeCompanyId = generateUUID();
            
            // Create a minimal company record for the investment target
            const investeeCompanyData = {
              id: investeeCompanyId,
              name: investment.investment_target.trim(),
              name_lowercase: investment.investment_target.toLowerCase(),
              sector: 'Unknown', // Default value
              company_type: 'PRIVATE',
              status: 'ACTIVE',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Insert the investee company
            const { error: investeeCompanyError } = await supabase
              .from('companies')
              .insert(investeeCompanyData);
            
            if (investeeCompanyError) {
              console.error('Error inserting investee company:', investeeCompanyError);
              // Continue without the investee company if insertion fails
              investeeCompanyId = companyId; // Fallback to current company ID
            } else {
              console.log('Investee company inserted:', investeeCompanyData.name);
            }
          } else {
            // If no investment target name, use current company as fallback
            investeeCompanyId = companyId;
          }
          
          investmentsData.push(addTimestamps({
            id: generateUUID(),
            company_id: companyId, // Legacy column
            investor_company_id: companyId, // Company making the investment (current company)
            investee_company_id: investeeCompanyId, // Company being invested in
            investment_target: investment.investment_target, // This stores the company name being invested in
            investment_amount: investment.investment_amount ? parseFloat(investment.investment_amount) : null,
            investment_date: sanitizeTimestamp(investment.investment_date), // Required field
            investment_type: investment.investment_type || 'EQUITY', // Required field
            current_stake_percentage: investment.current_stake_percentage ? parseFloat(investment.current_stake_percentage) : null,
            expected_return: investment.expected_return ? parseFloat(investment.expected_return) : null,
            investment_status: investment.investment_status || 'ACTIVE',
            exit_date: sanitizeTimestamp(investment.exit_date),
            exit_amount: investment.exit_amount ? parseFloat(investment.exit_amount) : null,
            exitType: investment.exitType || null,
            exit_multiple: investment.exit_multiple ? parseFloat(investment.exit_multiple) : null,
            description: investment.description || null
          }));
        }
        
        console.log('Filtered investments data:', investmentsData);
        console.log('Company investments after filtering count:', investmentsData.length);
        
        if (investmentsData.length > 0) {
          const { error: investmentError } = await supabase
            .from('company_investments')
            .insert(investmentsData);
          
          if (investmentError) {
            console.error('Error inserting company investments:', investmentError);
            throw investmentError;
          }
          console.log('Company investments inserted successfully');
        } else {
          console.log('No valid company investments to insert');
        }
      }

      // Handle regulatory filings
      let existingFilingsMap = new Map();
      
      if (mode === 'edit') {
        // Get existing regulatory filings to preserve documents
        const { data: existingFilings, error: fetchExistingError } = await supabase
          .from('regulatory_filings')
          .select('*')
          .eq('company_id', companyId);
        
        if (fetchExistingError) throw fetchExistingError;
        
        // Create a map of existing filings by their key fields for comparison
        existingFilings?.forEach(filing => {
          const key = `${filing.filing_type}-${filing.filing_date}-${filing.filing_number || ''}`;
          existingFilingsMap.set(key, filing);
        });
        
        // Delete existing regulatory filings
        const { error: deleteFilingError } = await supabase
          .from('regulatory_filings')
          .delete()
          .eq('company_id', companyId);
        
        if (deleteFilingError) throw deleteFilingError;
      }

      if (Array.isArray(formData.regulatory_filings) && formData.regulatory_filings.length > 0) {
        console.log('Processing regulatory filings:', formData.regulatory_filings);
        
        // Process each filing and handle file uploads
        const filingsData = [];
        
        for (const filing of formData.regulatory_filings) {
          if (filing.filing_type && 
              filing.status && 
              filing.filing_type.trim() !== '' && // Ensure filing_type is not empty
              (filing.filing_date || filing.filing_number || filing.document_title || filing.remarks || filing.fees_paid || filing.document_file) // Must have some meaningful data
          ) {
            // Check if this filing matches an existing one for document preservation
            const filingKey = `${filing.filing_type}-${filing.filing_date}-${filing.filing_number || ''}`;
            const existingFiling = mode === 'edit' ? existingFilingsMap.get(filingKey) : null;
            let filePath = null;
            let uploadedFileName = null;
            
            // Handle file upload if document_file exists
            if (filing.document_file && filing.document_file[0]) {
              try {
                const file = filing.document_file[0];
                console.log('Attempting to upload file:', {
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  companyId: companyId
                });
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('company-assets')
                  .upload(`regulatory_filings/${companyId}/${file.name}`, file, {
                    contentType: file.type,
                    upsert: false
                  });
                
                if (uploadError) {
                  console.error('Error uploading document:', uploadError);
                  console.error('Upload error details:', {
                    message: uploadError.message,
                    statusCode: uploadError.statusCode,
                    error: uploadError.error
                  });
                  // Continue without the file if upload fails
                } else {
                  filePath = uploadData.path;
                  uploadedFileName = file.name;
                  console.log('Document uploaded successfully:', {
                    path: filePath,
                    fileName: uploadedFileName,
                    uploadData: uploadData
                  });
                }
              } catch (error) {
                console.error('Error in file upload:', error);
                console.error('Upload exception details:', {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                });
                // Continue without the file if upload fails
              }
            } else if (existingFiling && existingFiling.document_url && existingFiling.file_path && existingFiling.uploaded_file_name) {
              // Preserve existing document data from database
              console.log('Preserving existing document from database:', existingFiling.uploaded_file_name);
              filePath = existingFiling.file_path;
              uploadedFileName = existingFiling.uploaded_file_name;
            } else if (filing.document_url && filing.file_path && filing.uploaded_file_name) {
              // Preserve existing document data from form
              console.log('Preserving existing document from form:', filing.uploaded_file_name);
              filePath = filing.file_path;
              uploadedFileName = filing.uploaded_file_name;
            } else {
              console.log('No document file to upload for filing:', filing);
            }
            
            filingsData.push(addTimestamps({
              id: generateUUID(),
              company_id: companyId,
              filing_type: filing.filing_type,
              filing_number: filing.filing_number || null,
              filing_date: sanitizeTimestamp(filing.filing_date), // Required field
              due_date: sanitizeTimestamp(filing.due_date),
              status: filing.status,
              priority: filing.priority || 'MEDIUM',
              remarks: filing.remarks || null, // Using 'remarks' column from the form
              fees_paid: filing.fees_paid ? parseFloat(filing.fees_paid) : null, // Using 'fees_paid' from the form
              document_url: filePath ? getPublicUrl('company-assets', filePath) : (filing.document_url || null),
              document_title: filing.document_title || null,
              file_path: filePath,
              uploaded_file_name: uploadedFileName,
              filing_authority: filing.filing_authority || null,
              form_number: filing.form_number || null,
              acknowledgment_number: filing.acknowledgment_number || null,
              compliance_officer: filing.compliance_officer || null,
              period_covered: filing.period_covered || null
            }));
          }
        }
        
        console.log('Filtered filings data:', filingsData);
        
        if (filingsData.length > 0) {
          const { error: filingError } = await supabase
            .from('regulatory_filings')
            .insert(filingsData);
          
          if (filingError) {
            console.error('Error inserting regulatory filings:', filingError);
            throw filingError;
          }
          console.log('Regulatory filings inserted successfully');
        } else {
          console.log('No valid regulatory filings to insert');
        }
      }

             // Handle legal proceedings
       if (mode === 'edit') {
         // Delete existing legal proceedings
         const { error: deleteLegalError } = await supabase
           .from('legal_proceedings')
           .delete()
           .eq('company_id', companyId);
         
         if (deleteLegalError) throw deleteLegalError;
       }

       if (Array.isArray(formData.legal_proceedings) && formData.legal_proceedings.length > 0) {
         console.log('Processing legal proceedings:', formData.legal_proceedings);
         console.log('Legal proceedings before filtering:', formData.legal_proceedings);
         
         const legalData = addTimestamps(formData.legal_proceedings
           .filter(proceeding => {
             // In edit mode, be more lenient - just require at least one meaningful field
             if (mode === 'edit') {
               return (proceeding.case_title && proceeding.case_title.trim() !== '' && proceeding.case_title !== 'CIVIL') || 
                      (proceeding.case_number && proceeding.case_number.trim() !== '') ||
                      (proceeding.court_name && proceeding.court_name.trim() !== '') ||
                      (proceeding.description && proceeding.description.trim() !== '') ||
                      (proceeding.amount_involved && proceeding.amount_involved.toString().trim() !== '');
             }
             // In create mode, require meaningful data beyond defaults
             return (proceeding.case_title && proceeding.case_title.trim() !== '' && proceeding.case_title !== 'CIVIL') || 
                    (proceeding.case_number && proceeding.case_number.trim() !== '') ||
                    (proceeding.court_name && proceeding.court_name.trim() !== '') ||
                    (proceeding.description && proceeding.description.trim() !== '') ||
                    (proceeding.amount_involved && proceeding.amount_involved.toString().trim() !== '');
           })
           .map(proceeding => ({
             id: generateUUID(),
             company_id: companyId,
             case_title: proceeding.case_title,
             case_type: proceeding.case_type || 'OTHER',
             caseStatus: proceeding.caseStatus,
             case_number: proceeding.case_number || null,
             court_name: proceeding.court_name || null,
             filing_date: sanitizeTimestamp(proceeding.filing_date),
             description: proceeding.description || null,
             amount_involved: proceeding.amount_involved ? parseFloat(proceeding.amount_involved) : null
           })));
         
         console.log('Filtered legal data:', legalData);
         console.log('Legal proceedings after filtering count:', legalData.length);
         
         if (legalData.length > 0) {
           const { error: legalError } = await supabase
             .from('legal_proceedings')
             .insert(legalData);
           
           if (legalError) {
             console.error('Error inserting legal proceedings:', legalError);
             throw legalError;
           }
           console.log('Legal proceedings inserted successfully');
         } else {
           console.log('No valid legal proceedings to insert');
         }
       }

             // Handle company news
       if (mode === 'edit') {
         // Delete existing company news
         const { error: deleteNewsError } = await supabase
           .from('company_news')
           .delete()
           .eq('company_id', companyId);
         
         if (deleteNewsError) throw deleteNewsError;
       }

       if (Array.isArray(formData.company_news) && formData.company_news.length > 0) {
         console.log('Processing company news:', formData.company_news);
         console.log('Company news before filtering:', formData.company_news);
         
         const newsData = addTimestamps(formData.company_news
           .filter(news => {
             // In edit mode, be more lenient - just require at least one meaningful field
             if (mode === 'edit') {
               return (news.title && news.title.trim() !== '') || 
                      (news.source_name && news.source_name.trim() !== '') ||
                      (news.content && news.content.trim() !== '') ||
                      (news.published_date && news.published_date.trim() !== '');
             }
             // In create mode, require all fields
             return news.title && 
                    news.title.trim() !== '' && 
                    news.published_date && 
                    news.published_date.trim() !== '' &&
                    news.source_name && 
                    news.source_name.trim() !== '';
           })
                       .map(news => ({
              id: generateUUID(),
              company_id: companyId,
              title: news.title.trim(),
              summary: news.summary || null,
              content: news.content && news.content.trim() !== '' ? news.content.trim() : 'No content provided',
              source_name: news.source_name.trim(),
              source_url: news.source_url || null,
              published_date: sanitizeTimestamp(news.published_date),
              sentiment: news.sentiment || 'NEUTRAL',
              relevance_score: news.relevance_score ? parseFloat(news.relevance_score) : null,
              tags: Array.isArray(news.tags) ? news.tags : []
            })));
         
         console.log('Filtered news data:', newsData);
         console.log('Company news after filtering count:', newsData.length);
         
         if (newsData.length > 0) {
           const { error: newsError } = await supabase
             .from('company_news')
             .insert(newsData);
           
           if (newsError) {
             console.error('Error inserting company news:', newsError);
             throw newsError;
           }
           console.log('Company news inserted successfully');
         } else {
           console.log('No valid company news to insert');
         }
       }

        // Handle company relationships
        if (mode === 'edit') {
          // Delete existing company relationships
          const { error: deleteRelationshipError } = await supabase
            .from('company_relationships')
            .delete()
            .or(`parent_company_id.eq.${companyId},subsidiary_company_id.eq.${companyId}`);
          
          if (deleteRelationshipError) throw deleteRelationshipError;
        }

        if (Array.isArray(formData.company_relationships) && formData.company_relationships.length > 0) {
          console.log('Processing company relationships:', formData.company_relationships);
          console.log('Current company ID:', companyId);
          
          // Validate companyId
          if (!companyId) {
            console.error('ERROR: companyId is not set!');
            throw new Error('Company ID is required for creating relationships');
          }
          
          const relationshipsData = [];
          
          for (const relationship of formData.company_relationships) {
            if (relationship.relationship_type && 
                relationship.related_company_name && relationship.related_company_name.trim() !== '') {
              
              console.log('Processing relationship:', relationship);
              
              // Create a minimal company record for the related company first
              const relatedCompanyId = generateUUID();
              console.log('Generated related company ID:', relatedCompanyId);
              console.log('Current company ID:', companyId);
              console.log('Are they different?', relatedCompanyId !== companyId);
              
              // Insert the related company record
              const relatedCompanyData = {
                id: relatedCompanyId,
                name: relationship.related_company_name,
                name_lowercase: relationship.related_company_name.toLowerCase(),
                sector: 'Unknown', // Default value
                company_type: 'PRIVATE',
                status: 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              // Insert the related company
              const { error: relatedCompanyError } = await supabase
                .from('companies')
                .insert(relatedCompanyData);
              
              if (relatedCompanyError) {
                console.error('Error inserting related company:', relatedCompanyError);
                throw relatedCompanyError;
              }
              
              console.log('Related company inserted:', relatedCompanyData.name);
              
                             // Now create the relationship
               let parentCompanyId, subsidiaryCompanyId;
               if (relationship.relationship_type === 'PARENT_COMPANY') {
                 parentCompanyId = relatedCompanyId; // Related company is the parent
                 subsidiaryCompanyId = companyId; // Current company is the subsidiary
                 console.log('PARENT_COMPANY relationship:');
                 console.log('  Parent (related company):', parentCompanyId);
                 console.log('  Subsidiary (current company):', subsidiaryCompanyId);
               } else {
                 parentCompanyId = companyId; // Current company is the parent
                 subsidiaryCompanyId = relatedCompanyId; // Related company is the subsidiary
                 console.log('Other relationship type:', relationship.relationship_type);
                 console.log('  Parent (current company):', parentCompanyId);
                 console.log('  Subsidiary (related company):', subsidiaryCompanyId);
               }
              
              // Verify IDs are different
              if (parentCompanyId === subsidiaryCompanyId) {
                console.error('ERROR: parentCompanyId and subsidiaryCompanyId are the same!');
                console.error('parentCompanyId:', parentCompanyId);
                console.error('subsidiaryCompanyId:', subsidiaryCompanyId);
                throw new Error('Invalid relationship: parent and subsidiary cannot be the same company');
              }
              
              const relationshipData = addTimestamps({
                id: generateUUID(),
                parent_company_id: parentCompanyId,
                subsidiary_company_id: subsidiaryCompanyId,
                relationship_type: relationship.relationship_type,
                effective_date: relationship.effective_date && relationship.effective_date.trim() !== '' ? sanitizeTimestamp(relationship.effective_date) : null,
                end_date: relationship.end_date ? sanitizeTimestamp(relationship.end_date) : null,
                ownership_percentage: relationship.ownership_percentage ? parseFloat(relationship.ownership_percentage) : null,
                acquisition_value: relationship.acquisition_value ? parseFloat(relationship.acquisition_value) : null
              });
              
              console.log('Final relationship data:', relationshipData);
              relationshipsData.push(relationshipData);
            }
          }
          
          console.log('Filtered relationships data:', relationshipsData);
        
          if (relationshipsData.length > 0) {
            const { error: relationshipError } = await supabase
              .from('company_relationships')
              .insert(relationshipsData);
            
            if (relationshipError) {
              console.error('Error inserting company relationships:', relationshipError);
              throw relationshipError;
            }
            console.log('Company relationships inserted successfully');
          } else {
            console.log('No valid company relationships to insert');
          }
        }

      if (mode === 'edit') {
        console.log('✅ Company data updated successfully!');
        setSuccessMessage('Company data updated successfully! Redirecting to company details...');
        // Clear localStorage and sessionStorage on successful update
        localStorage.removeItem('companyUploadStep');
        sessionStorage.removeItem('companyUploadFormData');
        // Give user time to see the success message before redirecting
        setTimeout(() => {
          console.log('🔄 Redirecting to company details...');
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        console.log('✅ Company data uploaded successfully!');
        setSuccessMessage('Company data uploaded successfully! Redirecting to dashboard...');
        setUploadedCompanyId(companyId);
        // Clear localStorage and sessionStorage on successful upload
        localStorage.removeItem('companyUploadStep');
        sessionStorage.removeItem('companyUploadFormData');
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard...');
          navigate('/dashboard');
        }, 3000);
      }

    } catch (error) {
      console.error('Error uploading company data:', error);
      setErrors({ submit: error.message || 'Failed to upload company data' });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps.find(step => step.id === currentStep)?.component;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Check if user has ADMIN access - if not, show access denied
  if (!canModify) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user}
          user={userProfile}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Lock className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-sm mb-4">
                Only Administrators are allowed to access this page.
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Company Data' : 'Upload Company Data'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'edit' 
              ? 'Update comprehensive company information in the database'
              : 'Add comprehensive company information to the database'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-16 h-0.5 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {errors.submit}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{successMessage}</span>
            </div>
            {uploadedCompanyId && mode === 'create' && (
              <div className="mt-2">
                <a
                  href={`/company/${uploadedCompanyId}`}
                  className="inline-flex items-center text-sm text-green-700 hover:text-green-800 underline"
                >
                  View Company Details →
                </a>
              </div>
            )}
            {mode === 'edit' && (
              <div className="mt-2">
                <a
                  href={`/company/${existingData?.id}`}
                  className="inline-flex items-center text-sm text-green-700 hover:text-green-800 underline"
                >
                  View Updated Company Details →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={(e) => e.preventDefault()}>
          {CurrentStepComponent && (
            <CurrentStepComponent
              key={`${currentStep}-${JSON.stringify(formData.company_investments?.length)}`}
              formData={formData}
              onChange={handleChange}
              onAddFinancialEntry={handleAddFinancialEntry}
              onRemoveFinancialEntry={handleRemoveFinancialEntry}
              onChangeFinancialEntry={handleChangeFinancialEntry}
              onAddAddress={handleAddAddress}
              onRemoveAddress={handleRemoveAddress}
              onAddContact={handleAddContact}
              onRemoveContact={handleRemoveContact}
              onAddOfficial={handleAddOfficial}
              onRemoveOfficial={handleRemoveOfficial}
              onAddFundingRound={handleAddFundingRound}
              onRemoveFundingRound={handleRemoveFundingRound}
              onAddInvestment={handleAddInvestment}
              onRemoveInvestment={handleRemoveInvestment}
              onAddFiling={handleAddFiling}
              onRemoveFiling={handleRemoveFiling}
              onAddLegalCase={handleAddLegalCase}
              onRemoveLegalCase={handleRemoveLegalCase}
              onAddNews={handleAddNews}
              onRemoveNews={handleRemoveNews}
              onAddRelationship={handleAddRelationship}
              onRemoveRelationship={handleRemoveRelationship}
              errors={errors}
            />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {mode === 'edit' ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {mode === 'edit' ? 'Update Company' : 'Upload Company'}
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                className="flex items-center px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyUpload;