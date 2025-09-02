import React from 'react';
import { TextInput, TextArea, Select, FileUpload } from './FormComponents';
import { Plus, Trash2, FileText, Scale } from 'lucide-react';

const RegulatoryLegalForm = ({ formData, onChange, onAddFiling, onRemoveFiling, onAddLegalCase, onRemoveLegalCase, errors }) => {
  const filingTypeOptions = [
    { value: 'ANNUAL_RETURN', label: 'Annual Return' },
    { value: 'BALANCE_SHEET', label: 'Balance Sheet' },
    { value: 'PROFIT_LOSS', label: 'Profit & Loss Statement' },
    { value: 'DIRECTORS_REPORT', label: 'Directors Report' },
    { value: 'AUDITORS_REPORT', label: 'Auditors Report' },
    { value: 'COMPLIANCE_CERTIFICATE', label: 'Compliance Certificate' },
    { value: 'OTHER', label: 'Other' }
  ];

  const filingStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'FILED', label: 'Filed' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'UNDER_REVIEW', label: 'Under Review' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const caseTypeOptions = [
    { value: 'CIVIL', label: 'Civil' },
    { value: 'CRIMINAL', label: 'Criminal' },
    { value: 'TAX', label: 'Tax' },
    { value: 'LABOR', label: 'Labor' },
    { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property' },
    { value: 'OTHER', label: 'Other' }
  ];

  const caseStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'HEARING', label: 'Hearing' },
    { value: 'DECIDED', label: 'Decided' },
    { value: 'APPEALED', label: 'Appealed' },
    { value: 'SETTLED', label: 'Settled' },
    { value: 'DISMISSED', label: 'Dismissed' }
  ];

  const handleFilingChange = (index, field, value) => {
    const filings = [...(formData.regulatory_filings || [])];
    filings[index] = { ...filings[index], [field]: value };
    onChange({ target: { name: 'regulatory_filings', value: filings } });
  };

  const handleLegalCaseChange = (index, field, value) => {
    const cases = [...(formData.legal_proceedings || [])];
    cases[index] = { ...cases[index], [field]: value };
    onChange({ target: { name: 'legal_proceedings', value: cases } });
  };

  return (
    <div className="space-y-6">
      {/* Regulatory Filings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Regulatory Filings</h3>
          </div>
          <button
            type="button"
            onClick={onAddFiling}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Filing
          </button>
        </div>

        {(formData.regulatory_filings || []).map((filing, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Filing {index + 1}</h4>
              {formData.regulatory_filings.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveFiling(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Filing Type"
                name={`filing_type_${index}`}
                value={filing.filing_type || ''}
                onChange={(e) => handleFilingChange(index, 'filing_type', e.target.value)}
                options={filingTypeOptions}
                error={errors[`regulatory_filings.${index}.filing_type`]}
              />

              <TextInput
                label="Filing Date"
                name={`filing_date_${index}`}
                type="date"
                value={filing.filing_date || ''}
                onChange={(e) => handleFilingChange(index, 'filing_date', e.target.value)}
                error={errors[`regulatory_filings.${index}.filing_date`]}
              />

              <TextInput
                label="Document Title"
                name={`document_title_${index}`}
                value={filing.document_title || ''}
                onChange={(e) => handleFilingChange(index, 'document_title', e.target.value)}
                placeholder="Enter document title"
                error={errors[`regulatory_filings.${index}.document_title`]}
              />

              <TextInput
                label="Period Covered"
                name={`period_covered_${index}`}
                value={filing.period_covered || ''}
                onChange={(e) => handleFilingChange(index, 'period_covered', e.target.value)}
                placeholder="e.g., FY 2023-24, Q1 2024"
                error={errors[`regulatory_filings.${index}.period_covered`]}
              />

              <TextInput
                label="Filing Authority"
                name={`filing_authority_${index}`}
                value={filing.filing_authority || ''}
                onChange={(e) => handleFilingChange(index, 'filing_authority', e.target.value)}
                placeholder="e.g., MCA, SEBI, RBI"
                error={errors[`regulatory_filings.${index}.filing_authority`]}
              />

              <TextInput
                label="Form Number"
                name={`form_number_${index}`}
                value={filing.form_number || ''}
                onChange={(e) => handleFilingChange(index, 'form_number', e.target.value)}
                placeholder="e.g., AOC-4, MGT-7"
                error={errors[`regulatory_filings.${index}.form_number`]}
              />

              <TextInput
                label="Filing Number"
                name={`filing_number_${index}`}
                value={filing.filing_number || ''}
                onChange={(e) => handleFilingChange(index, 'filing_number', e.target.value)}
                placeholder="Official filing reference number"
                error={errors[`regulatory_filings.${index}.filing_number`]}
              />

              <Select
                label="Status"
                name={`status_${index}`}
                value={filing.status || 'PENDING'}
                onChange={(e) => handleFilingChange(index, 'status', e.target.value)}
                options={filingStatusOptions}
                error={errors[`regulatory_filings.${index}.status`]}
              />

              <TextInput
                label="Acknowledgment Number"
                name={`acknowledgment_number_${index}`}
                value={filing.acknowledgment_number || ''}
                onChange={(e) => handleFilingChange(index, 'acknowledgment_number', e.target.value)}
                placeholder="Acknowledgment reference"
                error={errors[`regulatory_filings.${index}.acknowledgment_number`]}
              />

              <TextInput
                label="Fees Paid"
                name={`fees_paid_${index}`}
                type="number"
                value={filing.fees_paid || ''}
                onChange={(e) => handleFilingChange(index, 'fees_paid', e.target.value)}
                placeholder="Enter fees amount"
                error={errors[`regulatory_filings.${index}.fees_paid`]}
              />

              <TextInput
                label="Due Date"
                name={`due_date_${index}`}
                type="date"
                value={filing.due_date || ''}
                onChange={(e) => handleFilingChange(index, 'due_date', e.target.value)}
                error={errors[`regulatory_filings.${index}.due_date`]}
              />

              <Select
                label="Priority"
                name={`priority_${index}`}
                value={filing.priority || 'MEDIUM'}
                onChange={(e) => handleFilingChange(index, 'priority', e.target.value)}
                options={priorityOptions}
                required
                error={errors[`regulatory_filings.${index}.priority`]}
              />

              <TextInput
                label="Compliance Officer"
                name={`compliance_officer_${index}`}
                value={filing.compliance_officer || ''}
                onChange={(e) => handleFilingChange(index, 'compliance_officer', e.target.value)}
                placeholder="Name of compliance officer"
                error={errors[`regulatory_filings.${index}.compliance_officer`]}
              />

              <TextInput
                label="Document URL"
                name={`document_url_${index}`}
                type="url"
                value={filing.document_url || ''}
                onChange={(e) => handleFilingChange(index, 'document_url', e.target.value)}
                placeholder="https://example.com/document"
                error={errors[`regulatory_filings.${index}.document_url`]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Remarks"
                  name={`remarks_${index}`}
                  value={filing.remarks || ''}
                  onChange={(e) => handleFilingChange(index, 'remarks', e.target.value)}
                  placeholder="Additional remarks or notes"
                  rows={3}
                  error={errors[`regulatory_filings.${index}.remarks`]}
                />
              </div>

              <div className="md:col-span-2">
                <FileUpload
                  label="Upload Filing Document"
                  name={`filing_document_${index}`}
                  onChange={(e) => handleFilingChange(index, 'document_file', e.target.files)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  error={errors[`regulatory_filings.${index}.document_file`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legal Proceedings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Scale className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Legal Proceedings</h3>
          </div>
          <button
            type="button"
            onClick={onAddLegalCase}
            className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Legal Case
          </button>
        </div>

        {(formData.legal_proceedings || []).map((legalCase, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Legal Case {index + 1}</h4>
              {formData.legal_proceedings.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveLegalCase(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <TextInput
                  label="Case Title"
                  name={`case_title_${index}`}
                  value={legalCase.case_title || ''}
                  onChange={(e) => handleLegalCaseChange(index, 'case_title', e.target.value)}
                  placeholder="Enter case title"
                  error={errors[`legal_proceedings.${index}.case_title`]}
                />
              </div>

              <Select
                label="Case Type"
                name={`case_type_${index}`}
                value={legalCase.case_type || ''}
                onChange={(e) => handleLegalCaseChange(index, 'case_type', e.target.value)}
                options={caseTypeOptions}
                error={errors[`legal_proceedings.${index}.case_type`]}
              />

              <TextInput
                label="Case Number"
                name={`case_number_${index}`}
                value={legalCase.case_number || ''}
                onChange={(e) => handleLegalCaseChange(index, 'case_number', e.target.value)}
                placeholder="Official case number"
                error={errors[`legal_proceedings.${index}.case_number`]}
              />

              <TextInput
                label="Court Name"
                name={`court_name_${index}`}
                value={legalCase.court_name || ''}
                onChange={(e) => handleLegalCaseChange(index, 'court_name', e.target.value)}
                placeholder="Name of the court"
                error={errors[`legal_proceedings.${index}.court_name`]}
              />

              <Select
                label="Case Status"
                name={`case_status_${index}`}
                value={legalCase.caseStatus || 'PENDING'}
                onChange={(e) => handleLegalCaseChange(index, 'caseStatus', e.target.value)}
                options={caseStatusOptions}
                error={errors[`legal_proceedings.${index}.caseStatus`]}
              />

              <TextInput
                label="Filing Date"
                name={`filing_date_legal_${index}`}
                type="date"
                value={legalCase.filing_date || ''}
                onChange={(e) => handleLegalCaseChange(index, 'filing_date', e.target.value)}
                error={errors[`legal_proceedings.${index}.filing_date`]}
              />

              <TextInput
                label="Resolution Date"
                name={`resolution_date_${index}`}
                type="date"
                value={legalCase.resolution_date || ''}
                onChange={(e) => handleLegalCaseChange(index, 'resolution_date', e.target.value)}
                error={errors[`legal_proceedings.${index}.resolution_date`]}
              />

              <TextInput
                label="Amount Involved"
                name={`amount_involved_${index}`}
                type="number"
                value={legalCase.amount_involved || ''}
                onChange={(e) => handleLegalCaseChange(index, 'amount_involved', e.target.value)}
                placeholder="Amount involved in INR"
                error={errors[`legal_proceedings.${index}.amount_involved`]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Case Description"
                  name={`description_legal_${index}`}
                  value={legalCase.description || ''}
                  onChange={(e) => handleLegalCaseChange(index, 'description', e.target.value)}
                  placeholder="Describe the legal case details"
                  rows={4}
                  error={errors[`legal_proceedings.${index}.description`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegulatoryLegalForm;