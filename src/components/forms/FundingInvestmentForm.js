import React from 'react';
import { TextInput, TextArea, Select } from './FormComponents';
import { Plus, Trash2, DollarSign, TrendingUp, Building } from 'lucide-react';

const FundingInvestmentForm = ({ formData, onChange, onAddFundingRound, onRemoveFundingRound, onAddInvestment, onRemoveInvestment, errors }) => {
  const roundTypeOptions = [
    { value: 'SEED', label: 'Seed' },
    { value: 'SERIES_A', label: 'Series A' },
    { value: 'SERIES_B', label: 'Series B' },
    { value: 'SERIES_C', label: 'Series C' },
    { value: 'SERIES_D', label: 'Series D' },
    { value: 'SERIES_E', label: 'Series E' },
    { value: 'SERIES_F', label: 'Series F' },
    { value: 'PRE_IPO', label: 'Pre-IPO' },
    { value: 'IPO', label: 'IPO' },
    { value: 'POST_IPO', label: 'Post-IPO' },
    { value: 'DEBT', label: 'Debt Financing' },
    { value: 'GRANT', label: 'Grant' },
    { value: 'OTHER', label: 'Other' }
  ];

  const roundStatusOptions = [
    { value: 'ANNOUNCED', label: 'Announced' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'PENDING', label: 'Pending' }
  ];

  const investmentTypeOptions = [
    { value: 'EQUITY', label: 'Equity' },
    { value: 'DEBT', label: 'Debt' },
    { value: 'CONVERTIBLE_NOTE', label: 'Convertible Note' },
    { value: 'PREFERRED_SHARES', label: 'Preferred Shares' },
    { value: 'WARRANTS', label: 'Warrants' },
    { value: 'VENTURE_CAPITAL', label: 'Venture Capital' },
    { value: 'OTHER', label: 'Other' }
  ];

  const exitTypeOptions = [
    { value: 'IPO', label: 'IPO' },
    { value: 'ACQUISITION', label: 'Acquisition' },
    { value: 'MERGER', label: 'Merger' },
    { value: 'BUYBACK', label: 'Buyback' },
    { value: 'SECONDARY_SALE', label: 'Secondary Sale' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleFundingRoundChange = (index, field, value) => {
    const rounds = [...(formData.funding_rounds || [])];
    rounds[index] = { ...rounds[index], [field]: value };
    onChange({ target: { name: 'funding_rounds', value: rounds } });
  };

  const handleInvestmentChange = (index, field, value) => {
    const investments = [...(formData.company_investments || [])];
    investments[index] = { ...investments[index], [field]: value };
    onChange({ target: { name: 'company_investments', value: investments } });
  };

  // Investor management handlers
  const handleAddInvestor = (roundIndex) => {
    const rounds = [...(formData.funding_rounds || [])];
    if (!rounds[roundIndex].investors) {
      rounds[roundIndex].investors = [];
    }
    rounds[roundIndex].investors.push({
      name: '',
      investor_type: 'VENTURE_CAPITAL',
      investment_amount: '',
      is_lead_investor: false,
      board_seat_obtained: false
    });
    onChange({ target: { name: 'funding_rounds', value: rounds } });
  };

  const handleRemoveInvestor = (roundIndex, investorIndex) => {
    const rounds = [...(formData.funding_rounds || [])];
    rounds[roundIndex].investors.splice(investorIndex, 1);
    onChange({ target: { name: 'funding_rounds', value: rounds } });
  };

  const handleInvestorChange = (roundIndex, investorIndex, field, value) => {
    const rounds = [...(formData.funding_rounds || [])];
    if (!rounds[roundIndex].investors) {
      rounds[roundIndex].investors = [];
    }
    rounds[roundIndex].investors[investorIndex] = { 
      ...rounds[roundIndex].investors[investorIndex], 
      [field]: value 
    };
    onChange({ target: { name: 'funding_rounds', value: rounds } });
  };

  return (
    <div className="space-y-6">
      {/* Funding Rounds Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Funding Rounds Received (Who Invested in Us)</h3>
            <p className="text-sm text-gray-600 mt-1">Record funding rounds where other companies invested in this company</p>
          </div>
          <button
            type="button"
            onClick={onAddFundingRound}
            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Funding Round
          </button>
        </div>

        {(formData.funding_rounds || []).map((round, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Funding Round {index + 1}</h4>
              {formData.funding_rounds.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveFundingRound(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Round Type"
                name={`round_type_${index}`}
                value={round.round_type || ''}
                onChange={(e) => handleFundingRoundChange(index, 'round_type', e.target.value)}
                options={roundTypeOptions}
                error={errors[`funding_rounds.${index}.round_type`]}
              />

              <TextInput
                label="Round Name"
                name={`round_name_${index}`}
                value={round.round_name || ''}
                onChange={(e) => handleFundingRoundChange(index, 'round_name', e.target.value)}
                placeholder="e.g., Series A"
                error={errors[`funding_rounds.${index}.round_name`]}
              />

              <TextInput
                label="Amount Raised"
                name={`amount_raised_${index}`}
                type="number"
                value={round.amount_raised || ''}
                onChange={(e) => handleFundingRoundChange(index, 'amount_raised', e.target.value)}
                placeholder="Enter amount in INR"
                error={errors[`funding_rounds.${index}.amount_raised`]}
              />

              <TextInput
                label="Currency"
                name={`currency_${index}`}
                value={round.currency || 'INR'}
                onChange={(e) => handleFundingRoundChange(index, 'currency', e.target.value)}
                placeholder="Currency code"
                error={errors[`funding_rounds.${index}.currency`]}
              />

              <TextInput
                label="Pre-money Valuation"
                name={`valuation_pre_money_${index}`}
                type="number"
                value={round.valuation_pre_money || ''}
                onChange={(e) => handleFundingRoundChange(index, 'valuation_pre_money', e.target.value)}
                placeholder="Enter pre-money valuation"
                error={errors[`funding_rounds.${index}.valuation_pre_money`]}
              />

              <TextInput
                label="Post-money Valuation"
                name={`valuation_post_money_${index}`}
                type="number"
                value={round.valuation_post_money || ''}
                onChange={(e) => handleFundingRoundChange(index, 'valuation_post_money', e.target.value)}
                placeholder="Enter post-money valuation"
                error={errors[`funding_rounds.${index}.valuation_post_money`]}
              />

              <TextInput
                label="Funding Date"
                name={`funding_date_${index}`}
                type="date"
                value={round.funding_date || ''}
                onChange={(e) => handleFundingRoundChange(index, 'funding_date', e.target.value)}
                error={errors[`funding_rounds.${index}.funding_date`]}
              />

              <TextInput
                label="Announcement Date"
                name={`announcement_date_${index}`}
                type="date"
                value={round.announcement_date || ''}
                onChange={(e) => handleFundingRoundChange(index, 'announcement_date', e.target.value)}
                error={errors[`funding_rounds.${index}.announcement_date`]}
              />

              <TextInput
                label="Total Investors Count"
                name={`total_investors_count_${index}`}
                type="number"
                value={round.total_investors_count || ''}
                onChange={(e) => handleFundingRoundChange(index, 'total_investors_count', e.target.value)}
                placeholder="Number of investors"
                error={errors[`funding_rounds.${index}.total_investors_count`]}
              />

              <div className="md:col-span-2">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      Investors in this Round
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleAddInvestor(index)}
                      className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Investor
                    </button>
                  </div>
                  
                  {(!round.investors || round.investors.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No investors added yet. Click "Add Investor" to add investor details.</p>
                  )}
                  
                  {(round.investors || []).map((investor, investorIndex) => (
                    <div key={investorIndex} className="border border-gray-200 rounded p-3 mb-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium text-gray-800">Investor {investorIndex + 1}</h6>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvestor(index, investorIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <TextInput
                          label="Investor Name"
                          name={`investor_name_${index}_${investorIndex}`}
                          value={investor.name || ''}
                          onChange={(e) => handleInvestorChange(index, investorIndex, 'name', e.target.value)}
                          placeholder="e.g., Sequoia Capital"
                        />
                        
                        <Select
                          label="Investor Type"
                          name={`investor_type_${index}_${investorIndex}`}
                          value={investor.investor_type || 'VENTURE_CAPITAL'}
                          onChange={(e) => handleInvestorChange(index, investorIndex, 'investor_type', e.target.value)}
                          options={[
                            { value: 'VENTURE_CAPITAL', label: 'Venture Capital' },
                            { value: 'PRIVATE_EQUITY', label: 'Private Equity' },
                            { value: 'ANGEL', label: 'Angel Investor' },
                            { value: 'CORPORATE', label: 'Corporate' },
                            { value: 'GOVERNMENT', label: 'Government' },
                            { value: 'BANK', label: 'Bank' },
                            { value: 'INSURANCE', label: 'Insurance' },
                            { value: 'PENSION_FUND', label: 'Pension Fund' },
                            { value: 'HEDGE_FUND', label: 'Hedge Fund' },
                            { value: 'OTHER', label: 'Other' }
                          ]}
                        />
                        
                        <TextInput
                          label="Investment Amount"
                          name={`investment_amount_${index}_${investorIndex}`}
                          type="number"
                          value={investor.investment_amount || ''}
                          onChange={(e) => handleInvestorChange(index, investorIndex, 'investment_amount', e.target.value)}
                          placeholder="Amount invested by this investor"
                        />
                        
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name={`is_lead_investor_${index}_${investorIndex}`}
                              checked={investor.is_lead_investor || false}
                              onChange={(e) => handleInvestorChange(index, investorIndex, 'is_lead_investor', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Lead Investor</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name={`board_seat_obtained_${index}_${investorIndex}`}
                              checked={investor.board_seat_obtained || false}
                              onChange={(e) => handleInvestorChange(index, investorIndex, 'board_seat_obtained', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Board Seat</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Select
                label="Round Status"
                name={`round_status_${index}`}
                value={round.round_status || 'ANNOUNCED'}
                onChange={(e) => handleFundingRoundChange(index, 'round_status', e.target.value)}
                options={roundStatusOptions}
                error={errors[`funding_rounds.${index}.round_status`]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Use of Funds"
                  name={`use_of_funds_${index}`}
                  value={round.use_of_funds || ''}
                  onChange={(e) => handleFundingRoundChange(index, 'use_of_funds', e.target.value)}
                  placeholder="Describe how funds will be used"
                  rows={3}
                  error={errors[`funding_rounds.${index}.use_of_funds`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Company Investments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Investments Made by Company </h3>
          </div>
          <button
            type="button"
            onClick={onAddInvestment}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Investment
          </button>
        </div>

        {(formData.company_investments || []).map((investment, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Investment {index + 1}</h4>
              {formData.company_investments.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveInvestment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Company/Entity Being Invested In"
                name={`investment_target_${index}`}
                value={investment.investment_target || ''}
                onChange={(e) => handleInvestmentChange(index, 'investment_target', e.target.value)}
                placeholder="Name of the company or entity being invested in (e.g., Tata Motors, Reliance Industries)"
                error={errors[`company_investments.${index}.investment_target`]}
              />
              <p className="text-xs text-gray-500 mt-1">Enter the name of the company or asset this company is investing in</p>

              <TextInput
                label="Investment Amount"
                name={`investment_amount_${index}`}
                type="number"
                value={investment.investment_amount || ''}
                onChange={(e) => handleInvestmentChange(index, 'investment_amount', e.target.value)}
                placeholder="Enter investment amount"
                error={errors[`company_investments.${index}.investment_amount`]}
              />

              <TextInput
                label="Investment Date"
                name={`investment_date_${index}`}
                type="date"
                value={investment.investment_date || ''}
                onChange={(e) => handleInvestmentChange(index, 'investment_date', e.target.value)}
                error={errors[`company_investments.${index}.investment_date`]}
              />

              <Select
                label="Investment Type"
                name={`investment_type_${index}`}
                value={investment.investment_type || ''}
                onChange={(e) => handleInvestmentChange(index, 'investment_type', e.target.value)}
                options={investmentTypeOptions}
                error={errors[`company_investments.${index}.investment_type`]}
              />

              <TextInput
                label="Current Stake Percentage"
                name={`current_stake_percentage_${index}`}
                type="number"
                step="0.01"
                value={investment.current_stake_percentage || ''}
                onChange={(e) => handleInvestmentChange(index, 'current_stake_percentage', e.target.value)}
                placeholder="Enter stake percentage"
                error={errors[`company_investments.${index}.current_stake_percentage`]}
              />

              <TextInput
                label="Expected Return"
                name={`expected_return_${index}`}
                type="number"
                step="0.01"
                value={investment.expected_return || ''}
                onChange={(e) => handleInvestmentChange(index, 'expected_return', e.target.value)}
                placeholder="Expected return percentage"
                error={errors[`company_investments.${index}.expected_return`]}
              />

              <TextInput
                label="Investment Status"
                name={`investment_status_${index}`}
                value={investment.investment_status || 'ACTIVE'}
                onChange={(e) => handleInvestmentChange(index, 'investment_status', e.target.value)}
                placeholder="e.g., ACTIVE, EXITED"
                error={errors[`company_investments.${index}.investment_status`]}
              />

              {/* Exit Information (if applicable) */}
              <TextInput
                label="Exit Date"
                name={`exit_date_${index}`}
                type="date"
                value={investment.exit_date || ''}
                onChange={(e) => handleInvestmentChange(index, 'exit_date', e.target.value)}
                error={errors[`company_investments.${index}.exit_date`]}
              />

              <TextInput
                label="Exit Amount"
                name={`exit_amount_${index}`}
                type="number"
                value={investment.exit_amount || ''}
                onChange={(e) => handleInvestmentChange(index, 'exit_amount', e.target.value)}
                placeholder="Exit amount if applicable"
                error={errors[`company_investments.${index}.exit_amount`]}
              />

              <Select
                label="Exit Type"
                name={`exit_type_${index}`}
                value={investment.exitType || ''}
                onChange={(e) => handleInvestmentChange(index, 'exitType', e.target.value)}
                options={exitTypeOptions}
                placeholder="Select exit type..."
                error={errors[`company_investments.${index}.exitType`]}
              />

              <TextInput
                label="Exit Multiple"
                name={`exit_multiple_${index}`}
                type="number"
                step="0.01"
                value={investment.exit_multiple || ''}
                onChange={(e) => handleInvestmentChange(index, 'exit_multiple', e.target.value)}
                placeholder="Exit multiple (e.g., 2.5x)"
                error={errors[`company_investments.${index}.exit_multiple`]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Investment Description"
                  name={`description_${index}`}
                  value={investment.description || ''}
                  onChange={(e) => handleInvestmentChange(index, 'description', e.target.value)}
                  placeholder="Describe the investment details"
                  rows={3}
                  error={errors[`company_investments.${index}.description`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FundingInvestmentForm;