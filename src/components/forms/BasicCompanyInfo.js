import React from 'react';
import { TextInput, TextArea, Select, Checkbox, FileUpload } from './FormComponents';

const BasicCompanyInfo = ({ formData, onChange, errors }) => {
  const companyStatusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'LIQUIDATED', label: 'Liquidated' },
    { value: 'MERGED', label: 'Merged' },
    { value: 'ACQUIRED', label: 'Acquired' }
  ];

  const companyTypeOptions = [
    { value: 'PRIVATE', label: 'Private Limited' },
    { value: 'PUBLIC', label: 'Public Limited' },
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'NGO', label: 'NGO' },
    { value: 'PARTNERSHIP', label: 'Partnership' },
    { value: 'PROPRIETORSHIP', label: 'Proprietorship' }
  ];

  const sectorOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Financial Services' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'energy', label: 'Energy' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'pharmaceutical', label: 'Pharmaceutical' }
  ];

  const employeeRangeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001-5000', label: '1001-5000 employees' },
    { value: '5001-10000', label: '5001-10000 employees' },
    { value: '10000+', label: '10000+ employees' }
  ];

  const revenueRangeOptions = [
    { value: 'under-1cr', label: 'Under ₹1 Crore' },
    { value: '1cr-10cr', label: '₹1-10 Crores' },
    { value: '10cr-50cr', label: '₹10-50 Crores' },
    { value: '50cr-100cr', label: '₹50-100 Crores' },
    { value: '100cr-500cr', label: '₹100-500 Crores' },
    { value: '500cr-1000cr', label: '₹500-1000 Crores' },
    { value: '1000cr+', label: '₹1000+ Crores' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Company Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <TextInput
            label="Company Name"
            name="name"
            value={formData.name || ''}
            onChange={onChange}
            placeholder="Enter company name"
            required
            error={errors.name}
          />
        </div>

        <TextInput
          label="Legal Name"
          name="legal_name"
          value={formData.legal_name || ''}
          onChange={onChange}
          placeholder="Enter legal name (if different)"
          error={errors.legal_name}
        />

        <TextInput
          label="CIN (Corporate Identity Number)"
          name="cin"
          value={formData.cin || ''}
          onChange={onChange}
          placeholder="e.g., L72200DL2010PLC123456"
          error={errors.cin}
        />

        <TextInput
          label="GST Number"
          name="gst"
          value={formData.gst || ''}
          onChange={onChange}
          placeholder="Enter GST number"
          error={errors.gst}
        />

        <TextInput
          label="PAN"
          name="pan"
          value={formData.pan || ''}
          onChange={onChange}
          placeholder="Enter PAN"
          error={errors.pan}
        />

        <Select
          label="Sector"
          name="sector"
          value={formData.sector || ''}
          onChange={onChange}
          options={sectorOptions}
          required
          error={errors.sector}
        />

        <Select
          label="Company Type"
          name="company_type"
          value={formData.company_type || ''}
          onChange={onChange}
          options={companyTypeOptions}
          error={errors.company_type}
        />

        <Select
          label="Company Status"
          name="status"
          value={formData.status || ''}
          onChange={onChange}
          options={companyStatusOptions}
          error={errors.status}
        />

        <TextInput
          label="Employee Count"
          name="employee_count"
          type="number"
          value={formData.employee_count || ''}
          onChange={onChange}
          placeholder="Enter exact number"
          error={errors.employee_count}
        />

        <Select
          label="Employee Range"
          name="employee_range"
          value={formData.employee_range || ''}
          onChange={onChange}
          options={employeeRangeOptions}
          error={errors.employee_range}
        />

        <Select
          label="Annual Revenue Range"
          name="annual_revenue_range"
          value={formData.annual_revenue_range || ''}
          onChange={onChange}
          options={revenueRangeOptions}
          error={errors.annual_revenue_range}
        />

        <TextInput
          label="Market Cap"
          name="market_cap"
          type="number"
          value={formData.market_cap || ''}
          onChange={onChange}
          placeholder="Enter market cap in INR"
          error={errors.market_cap}
        />

        <TextInput
          label="Website"
          name="website"
          type="url"
          value={formData.website || ''}
          onChange={onChange}
          placeholder="https://example.com"
          error={errors.website}
        />

        <TextInput
          label="LinkedIn URL"
          name="linkedin_url"
          type="url"
          value={formData.linkedin_url || ''}
          onChange={onChange}
          placeholder="https://linkedin.com/company/example"
          error={errors.linkedin_url}
        />

        <TextInput
          label="Founded Date"
          name="founded_date"
          type="date"
          value={formData.founded_date || ''}
          onChange={onChange}
          error={errors.founded_date}
        />

        <div className="md:col-span-1">
          <Checkbox
            label="Is Listed Company"
            name="is_listed"
            checked={formData.is_listed || false}
            onChange={onChange}
            error={errors.is_listed}
          />
        </div>

        {formData.is_listed && (
          <>
            <TextInput
              label="Stock Exchange"
              name="stock_exchange"
              value={formData.stock_exchange || ''}
              onChange={onChange}
              placeholder="e.g., BSE, NSE"
              error={errors.stock_exchange}
            />

            <TextInput
              label="Stock Symbol"
              name="stock_symbol"
              value={formData.stock_symbol || ''}
              onChange={onChange}
              placeholder="e.g., TCS, INFY"
              error={errors.stock_symbol}
            />

            <TextInput
              label="ISIN"
              name="isin"
              value={formData.isin || ''}
              onChange={onChange}
              placeholder="International Securities Identification Number"
              error={errors.isin}
            />
          </>
        )}

        <div className="md:col-span-2">
          <TextArea
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={onChange}
            placeholder="Enter company description"
            rows={4}
            error={errors.description}
          />
        </div>

        <div className="md:col-span-2">
          <FileUpload
            label="Company Logo"
            name="logo"
            onChange={onChange}
            accept="image/*"
            error={errors.logo}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicCompanyInfo;