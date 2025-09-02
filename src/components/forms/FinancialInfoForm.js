import React from 'react';
import { TextInput, Select } from './FormComponents';

const FinancialInfoForm = ({ formData, onChange, errors, onAddFinancialEntry, onRemoveFinancialEntry, onChangeFinancialEntry }) => {
  const quarterOptions = [
    { value: 'Q1', label: 'Q1' },
    { value: 'Q2', label: 'Q2' },
    { value: 'Q3', label: 'Q3' },
    { value: 'Q4', label: 'Q4' },
    { value: 'ANNUAL', label: 'Annual' }
  ];

  const statementTypeOptions = [
    { value: 'INCOME_STATEMENT', label: 'Income Statement' },
    { value: 'BALANCE_SHEET', label: 'Balance Sheet' },
    { value: 'CASH_FLOW', label: 'Cash Flow Statement' },
    { value: 'CONSOLIDATED', label: 'Consolidated' },
    { value: 'STANDALONE', label: 'Standalone' }
  ];

  // Determine entries to render: use array if present, otherwise fallback to single-entry using flat fields
  const entries = Array.isArray(formData.financial_entries) && formData.financial_entries.length > 0
    ? formData.financial_entries
    : [formData];

  const handleEntryChange = (index, e) => {
    const { name, value } = e.target;
    if (onChangeFinancialEntry) {
      onChangeFinancialEntry(index, name, value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>

      {entries.map((entry, idx) => (
        <div key={idx} className="mb-8 border rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-800">Entry {idx + 1}</h4>
            {onRemoveFinancialEntry && entries.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveFinancialEntry(idx)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Financial Year"
              name="financial_year"
              type="number"
              value={entry.financial_year || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="e.g., 2024"
              error={errors.financial_year}
            />

            <Select
              label="Quarter"
              name="quarter"
              value={entry.quarter || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              options={quarterOptions}
              error={errors.quarter}
            />

            <Select
              label="Statement Type"
              name="statement_type"
              value={entry.statement_type || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              options={statementTypeOptions}
              error={errors.statement_type}
            />

            <TextInput
              label="Currency"
              name="currency"
              value={entry.currency || 'INR'}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Currency code"
              error={errors.currency}
            />

            <TextInput
              label="Total Revenue"
              name="total_revenue"
              type="number"
              value={entry.total_revenue || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter total revenue"
              error={errors.total_revenue}
            />

            <TextInput
              label="Gross Profit"
              name="gross_profit"
              type="number"
              value={entry.gross_profit || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter gross profit"
              error={errors.gross_profit}
            />

            <TextInput
              label="Operating Profit"
              name="operating_profit"
              type="number"
              value={entry.operating_profit || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter operating profit"
              error={errors.operating_profit}
            />

            <TextInput
              label="Net Profit"
              name="net_profit"
              type="number"
              value={entry.net_profit || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter net profit"
              error={errors.net_profit}
            />

            <TextInput
              label="EBITDA"
              name="ebitda"
              type="number"
              value={entry.ebitda || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter EBITDA"
              error={errors.ebitda}
            />

            <TextInput
              label="Total Assets"
              name="total_assets"
              type="number"
              value={entry.total_assets || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter total assets"
              error={errors.total_assets}
            />

            <TextInput
              label="Current Assets"
              name="current_assets"
              type="number"
              value={entry.current_assets || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter current assets"
              error={errors.current_assets}
            />

            <TextInput
              label="Fixed Assets"
              name="fixed_assets"
              type="number"
              value={entry.fixed_assets || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter fixed assets"
              error={errors.fixed_assets}
            />

            <TextInput
              label="Total Liabilities"
              name="total_liabilities"
              type="number"
              value={entry.total_liabilities || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter total liabilities"
              error={errors.total_liabilities}
            />

            <TextInput
              label="Current Liabilities"
              name="current_liabilities"
              type="number"
              value={entry.current_liabilities || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter current liabilities"
              error={errors.current_liabilities}
            />

            <TextInput
              label="Shareholders' Equity"
              name="shareholders_equity"
              type="number"
              value={entry.shareholders_equity || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter shareholders' equity"
              error={errors.shareholders_equity}
            />

            <TextInput
              label="Operating Cash Flow"
              name="operating_cash_flow"
              type="number"
              value={entry.operating_cash_flow || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter operating cash flow"
              error={errors.operating_cash_flow}
            />

            <TextInput
              label="Investing Cash Flow"
              name="investing_cash_flow"
              type="number"
              value={entry.investing_cash_flow || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter investing cash flow"
              error={errors.investing_cash_flow}
            />

            <TextInput
              label="Financing Cash Flow"
              name="financing_cash_flow"
              type="number"
              value={entry.financing_cash_flow || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter financing cash flow"
              error={errors.financing_cash_flow}
            />

            <TextInput
              label="Net Cash Flow"
              name="net_cash_flow"
              type="number"
              value={entry.net_cash_flow || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              placeholder="Enter net cash flow"
              error={errors.net_cash_flow}
            />

            <TextInput
              label="Debt-to-Equity Ratio (Auto-calculated)"
              name="debt_to_equity_ratio"
              type="number"
              step="0.01"
              value={entry.debt_to_equity_ratio || ''}
              onChange={onChange}
              placeholder="Auto-calculated from Total Liabilities / Shareholders' Equity"
              error={errors.debt_to_equity_ratio}
              readOnly
              className="bg-gray-50"
            />

            <TextInput
              label="Current Ratio (Auto-calculated)"
              name="current_ratio"
              type="number"
              step="0.01"
              value={entry.current_ratio || ''}
              onChange={onChange}
              placeholder="Auto-calculated from Current Assets / Current Liabilities"
              error={errors.current_ratio}
              readOnly
              className="bg-gray-50"
            />

            <TextInput
              label="Return on Equity (%) (Auto-calculated)"
              name="return_on_equity"
              type="number"
              step="0.01"
              value={entry.return_on_equity || ''}
              onChange={onChange}
              placeholder="Auto-calculated from (Net Profit / Shareholders' Equity) × 100"
              error={errors.return_on_equity}
              readOnly
              className="bg-gray-50"
            />

            <TextInput
              label="Return on Assets (%) (Auto-calculated)"
              name="return_on_assets"
              type="number"
              step="0.01"
              value={entry.return_on_assets || ''}
              onChange={onChange}
              placeholder="Auto-calculated from (Net Profit / Total Assets) × 100"
              error={errors.return_on_assets}
              readOnly
              className="bg-gray-50"
            />

            <TextInput
              label="Profit Margin (%) (Auto-calculated)"
              name="profit_margin"
              type="number"
              step="0.01"
              value={entry.profit_margin || ''}
              onChange={onChange}
              placeholder="Auto-calculated from (Net Profit / Total Revenue) × 100"
              error={errors.profit_margin}
              readOnly
              className="bg-gray-50"
            />

            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Auto-Calculation Feature</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>The financial ratios above are automatically calculated based on the financial data you enter for each entry.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TextInput
              label="Period Start Date"
              name="period_start_date"
              type="date"
              value={entry.period_start_date || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              error={errors.period_start_date}
            />

            <TextInput
              label="Period End Date"
              name="period_end_date"
              type="date"
              value={entry.period_end_date || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              error={errors.period_end_date}
            />

            <TextInput
              label="Filed Date"
              name="filed_date"
              type="date"
              value={entry.filed_date || ''}
              onChange={onChangeFinancialEntry ? (e) => handleEntryChange(idx, e) : onChange}
              error={errors.filed_date}
            />
          </div>
        </div>
      ))}

      {onAddFinancialEntry && (
        <button
          type="button"
          onClick={onAddFinancialEntry}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          Add Year
        </button>
      )}
    </div>
  );
};

export default FinancialInfoForm;