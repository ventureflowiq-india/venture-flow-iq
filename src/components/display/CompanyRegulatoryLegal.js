import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle, Clock, XCircle, Download, ExternalLink, Eye } from 'lucide-react';

const CompanyRegulatoryLegal = ({ companyData }) => {
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

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'FILED': 'bg-blue-100 text-blue-800 border-blue-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'UNDER_REVIEW': 'bg-purple-100 text-purple-800 border-purple-200',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'HIGH': 'bg-red-100 text-red-800 border-red-200',
      'URGENT': 'bg-red-100 text-red-800 border-red-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'LOW': 'bg-green-100 text-green-800 border-green-200'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCaseStatusColor = (status) => {
    const caseStatusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ACTIVE': 'bg-blue-100 text-blue-800 border-blue-200',
      'HEARING': 'bg-purple-100 text-purple-800 border-purple-200',
      'DECIDED': 'bg-green-100 text-green-800 border-green-200',
      'SETTLED': 'bg-green-100 text-green-800 border-green-200',
      'DISMISSED': 'bg-gray-100 text-gray-800 border-gray-200',
      'APPEALED': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return caseStatusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
      case 'COMPLETED':
      case 'FILED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'UNDER_REVIEW':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Clock className="h-4 w-4" />;
      case 'LOW':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Function to get proper Supabase storage URL
  const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already full URL
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    if (!supabaseUrl) return null;
    return `${supabaseUrl}/storage/v1/object/public/company-assets/${path}`;
  };

  const handleDownloadDocument = (filing) => {
    // Priority: uploaded file > file_path > document_url
    if (filing.file_path) {
      // This is an uploaded file in Supabase storage
      const url = getStorageUrl(filing.file_path);
      if (url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filing.uploaded_file_name || 'document.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (filing.document_url) {
      // This is an external URL
      if (filing.document_url.startsWith('http')) {
        window.open(filing.document_url, '_blank');
      } else {
        // Try to construct storage URL
        const url = getStorageUrl(filing.document_url);
        if (url) {
          window.open(url, '_blank');
        }
      }
    }
  };

  const handleViewDocument = (filing) => {
    // Priority: uploaded file > file_path > document_url
    if (filing.file_path) {
      // This is an uploaded file in Supabase storage
      const url = getStorageUrl(filing.file_path);
      if (url) {
        window.open(url, '_blank');
      }
    } else if (filing.document_url) {
      // This is an external URL
      if (filing.document_url.startsWith('http')) {
        window.open(filing.document_url, '_blank');
      } else {
        // Try to construct storage URL
        const url = getStorageUrl(filing.document_url);
        if (url) {
          window.open(url, '_blank');
        }
      }
    }
  };

  const getFilingTypeLabel = (type) => {
    const typeLabels = {
      'ANNUAL_RETURN': 'Annual Return',
      'BALANCE_SHEET': 'Balance Sheet',
      'PROFIT_LOSS': 'Profit & Loss Statement',
      'DIRECTORS_REPORT': 'Directors Report',
      'AUDITORS_REPORT': 'Auditors Report',
      'COMPLIANCE_CERTIFICATE': 'Compliance Certificate',
      'OTHER': 'Other'
    };
    return typeLabels[type] || type?.replace('_', ' ') || 'Unknown';
  };

  const getCaseTypeLabel = (type) => {
    const typeLabels = {
      'CIVIL': 'Civil',
      'CRIMINAL': 'Criminal',
      'TAX': 'Tax',
      'LABOR': 'Labor',
      'INTELLECTUAL_PROPERTY': 'Intellectual Property',
      'OTHER': 'Other'
    };
    return typeLabels[type] || type?.replace('_', ' ') || 'Unknown';
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Regulatory & Legal Information</h3>
      
      {/* Summary Stats */}
      {(companyData.regulatory_filings?.length > 0 || companyData.legal_proceedings?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Regulatory Filings</span>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {companyData.regulatory_filings?.length || 0}
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Legal Cases</span>
              <Scale className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-900">
              {companyData.legal_proceedings?.length || 0}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Approved Filings</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {companyData.regulatory_filings?.filter(filing => filing.status === 'APPROVED').length || 0}
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-700">Pending Items</span>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {(companyData.regulatory_filings?.filter(filing => filing.status === 'PENDING').length || 0) + 
               (companyData.legal_proceedings?.filter(proc => proc.case_status === 'PENDING').length || 0)}
            </div>
          </div>
        </div>
      )}
      
      {/* Regulatory Filings */}
      {companyData.regulatory_filings && companyData.regulatory_filings.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            Regulatory Filings ({companyData.regulatory_filings.length})
          </h4>
          
          <div className="space-y-4">
            {companyData.regulatory_filings.map((filing, index) => (
              <div key={filing.id || index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {getFilingTypeLabel(filing.filing_type)}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {filing.filing_authority || 'Regulatory Authority'} • {filing.form_number || 'Form'}
                      </p>
                      {filing.document_title && (
                        <p className="text-sm text-blue-600 mt-1">{filing.document_title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(filing.status)}`}>
                      {getStatusIcon(filing.status)}
                      <span className="ml-1">{filing.status?.replace('_', ' ') || 'Unknown'}</span>
                    </span>
                    {filing.priority && (
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(filing.priority)}`}>
                        {getPriorityIcon(filing.priority)}
                        <span className="ml-1">{filing.priority} Priority</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <h6 className="text-xs font-medium text-gray-500 uppercase">Filing Details</h6>
                    {filing.filing_number && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Filing Number:</span>
                        <span className="text-gray-900 ml-1 font-mono text-xs">{filing.filing_number}</span>
                      </div>
                    )}
                    {filing.acknowledgment_number && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Ack. Number:</span>
                        <span className="text-gray-900 ml-1 font-mono text-xs">{filing.acknowledgment_number}</span>
                      </div>
                    )}
                    {filing.period_covered && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Period:</span>
                        <span className="text-gray-900 ml-1">{filing.period_covered}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h6 className="text-xs font-medium text-gray-500 uppercase">Dates</h6>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Filed:</span>
                      <span className="text-gray-900 ml-1">{formatDate(filing.filing_date)}</span>
                    </div>
                    {filing.due_date && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Due:</span>
                        <span className={`ml-1 ${new Date(filing.due_date) < new Date() && filing.status === 'PENDING' ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {formatDate(filing.due_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h6 className="text-xs font-medium text-gray-500 uppercase">Financial</h6>
                    {filing.fees_paid && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Fees Paid:</span>
                        <span className="text-gray-900 ml-1">{formatCurrency(filing.fees_paid)}</span>
                      </div>
                    )}
                    {filing.compliance_officer && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Officer:</span>
                        <span className="text-gray-900 ml-1">{filing.compliance_officer}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h6 className="text-xs font-medium text-gray-500 uppercase">Actions</h6>
                    {(filing.file_path || filing.document_url) && (
                      <div className="space-y-2">
                        {filing.file_path && (
                          <>
                            <button
                              onClick={() => handleViewDocument(filing)}
                              className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Document
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(filing)}
                              className="inline-flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </>
                        )}
                        {!filing.file_path && filing.document_url && filing.document_url.startsWith('http') && (
                          <a
                            href={filing.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Online
                          </a>
                        )}
                      </div>
                    )}
                    {!filing.file_path && !filing.document_url && (
                      <span className="text-sm text-gray-500">No document available</span>
                    )}
                  </div>
                </div>
                
                {filing.remarks && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Remarks:</span>
                      <p className="text-gray-900 mt-1">{filing.remarks}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Proceedings */}
      {companyData.legal_proceedings && companyData.legal_proceedings.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Scale className="h-5 w-5 text-red-600 mr-2" />
            Legal Proceedings ({companyData.legal_proceedings.length})
          </h4>
          
          <div className="space-y-4">
            {companyData.legal_proceedings.map((proceeding, index) => (
              <div key={proceeding.id || index} className="bg-red-50 rounded-lg p-6 border border-red-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Scale className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {proceeding.case_title || 'Legal Case'}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {proceeding.court_name || 'Court'} • {getCaseTypeLabel(proceeding.case_type)}
                      </p>
                      {proceeding.case_number && (
                        <p className="text-sm text-red-700 font-mono mt-1">Case No: {proceeding.case_number}</p>
                      )}
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getCaseStatusColor(proceeding.case_status || proceeding.caseStatus)}`}>
                    {getStatusIcon(proceeding.case_status || proceeding.caseStatus)}
                    <span className="ml-1">{(proceeding.case_status || proceeding.caseStatus)?.replace('_', ' ') || 'Unknown'}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-3">
                    <h6 className="text-xs font-medium text-gray-500 uppercase">Case Details</h6>
                    {(proceeding.case_value || proceeding.amount_involved) && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Case Value:</span>
                        <span className="text-gray-900 ml-1 font-semibold">
                          {formatCurrency(proceeding.case_value || proceeding.amount_involved)}
                        </span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Filing Date:</span>
                      <span className="text-gray-900 ml-1">{formatDate(proceeding.filing_date)}</span>
                    </div>
                    {proceeding.next_hearing_date && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Next Hearing:</span>
                        <span className="text-orange-600 ml-1 font-semibold">{formatDate(proceeding.next_hearing_date)}</span>
                      </div>
                    )}
                    {proceeding.disposal_date && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Disposal Date:</span>
                        <span className="text-gray-900 ml-1">{formatDate(proceeding.disposal_date)}</span>
                      </div>
                    )}
                    {proceeding.resolution_date && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Resolution Date:</span>
                        <span className="text-gray-900 ml-1">{formatDate(proceeding.resolution_date)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h6 className="text-xs font-medium text-gray-500 uppercase">Additional Info</h6>
                    {proceeding.case_number && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Case Number:</span>
                        <span className="text-gray-900 ml-1 font-mono">{proceeding.case_number}</span>
                      </div>
                    )}
                    {proceeding.court_name && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Court:</span>
                        <span className="text-gray-900 ml-1">{proceeding.court_name}</span>
                      </div>
                    )}
                    {proceeding.case_type && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-900 ml-1">{getCaseTypeLabel(proceeding.case_type)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {proceeding.description && (
                  <div className="mb-4">
                    <h6 className="text-xs font-medium text-gray-500 uppercase mb-2">Case Description</h6>
                    <p className="text-sm text-gray-900">{proceeding.description}</p>
                  </div>
                )}
                
                {proceeding.remarks && (
                  <div className="pt-4 border-t border-red-200">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Remarks:</span>
                      <p className="text-gray-900 mt-1">{proceeding.remarks}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!companyData.regulatory_filings || companyData.regulatory_filings.length === 0) && 
       (!companyData.legal_proceedings || companyData.legal_proceedings.length === 0) && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Regulatory or Legal Information</h4>
          <p className="text-gray-500">
            This company doesn't have any regulatory filings or legal proceedings information uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyRegulatoryLegal;