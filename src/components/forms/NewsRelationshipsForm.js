import React from 'react';
import { TextInput, TextArea, Select, MultiSelect } from './FormComponents';
import { Plus, Trash2, Newspaper, Building } from 'lucide-react';

const NewsRelationshipsForm = ({ formData, onChange, onAddNews, onRemoveNews, onAddRelationship, onRemoveRelationship, errors }) => {
  const sentimentOptions = [
    { value: 'POSITIVE', label: 'Positive' },
    { value: 'NEGATIVE', label: 'Negative' },
    { value: 'NEUTRAL', label: 'Neutral' },
    { value: 'MIXED', label: 'Mixed' }
  ];

  const newsTagsOptions = [
    { value: 'funding', label: 'Funding' },
    { value: 'acquisition', label: 'Acquisition' },
    { value: 'merger', label: 'Merger' },
    { value: 'ipo', label: 'IPO' },
    { value: 'expansion', label: 'Expansion' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'product-launch', label: 'Product Launch' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'financial-results', label: 'Financial Results' },
    { value: 'regulatory', label: 'Regulatory' },
    { value: 'legal', label: 'Legal' },
    { value: 'technology', label: 'Technology' },
    { value: 'market-share', label: 'Market Share' },
    { value: 'awards', label: 'Awards' },
    { value: 'sustainability', label: 'Sustainability' }
  ];

  const handleNewsChange = (index, field, value) => {
    const news = [...(formData.company_news || [])];
    news[index] = { ...news[index], [field]: value };
    onChange({ target: { name: 'company_news', value: news } });
  };

  const handleRelationshipChange = (index, field, value) => {
    const relationships = [...(formData.company_relationships || [])];
    relationships[index] = { ...relationships[index], [field]: value };
    onChange({ target: { name: 'company_relationships', value: relationships } });
  };

  return (
    <div className="space-y-6">
      {/* Company News Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Newspaper className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Company News & Updates</h3>
          </div>
          <button
            type="button"
            onClick={onAddNews}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add News
          </button>
        </div>

        {(formData.company_news || []).map((news, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">News Article {index + 1}</h4>
              {formData.company_news.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveNews(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="md:col-span-2">
                 <TextInput
                   label="News Title"
                   name={`title_${index}`}
                   value={news.title || ''}
                   onChange={(e) => handleNewsChange(index, 'title', e.target.value)}
                   placeholder="Enter news headline"
                   error={errors[`company_news.${index}.title`]}
                 />
               </div>

              <div className="md:col-span-2">
                <TextArea
                  label="News Summary"
                  name={`summary_${index}`}
                  value={news.summary || ''}
                  onChange={(e) => handleNewsChange(index, 'summary', e.target.value)}
                  placeholder="Brief summary of the news"
                  rows={3}
                  error={errors[`company_news.${index}.summary`]}
                />
              </div>

                             <div className="md:col-span-2">
                 <TextArea
                   label="News Content"
                   name={`content_${index}`}
                   value={news.content || ''}
                   onChange={(e) => handleNewsChange(index, 'content', e.target.value)}
                   placeholder="Full content or excerpt of the news article"
                   rows={4}
                   error={errors[`company_news.${index}.title`]}
                 />
               </div>

                             <TextInput
                 label="Source Name"
                 name={`source_name_${index}`}
                 value={news.source_name || ''}
                 onChange={(e) => handleNewsChange(index, 'source_name', e.target.value)}
                 placeholder="e.g., Economic Times, Business Standard"
                 error={errors[`company_news.${index}.source_name`]}
               />

              <TextInput
                label="Source URL"
                name={`source_url_${index}`}
                type="url"
                value={news.source_url || ''}
                onChange={(e) => handleNewsChange(index, 'source_url', e.target.value)}
                placeholder="https://example.com/news-article"
                error={errors[`company_news.${index}.source_url`]}
              />

                             <TextInput
                 label="Published Date"
                 name={`published_date_${index}`}
                 type="date"
                 value={news.published_date || ''}
                 onChange={(e) => handleNewsChange(index, 'published_date', e.target.value)}
                 error={errors[`company_news.${index}.published_date`]}
               />

                             <Select
                 label="Sentiment"
                 name={`sentiment_${index}`}
                 value={news.sentiment || 'NEUTRAL'}
                 onChange={(e) => handleNewsChange(index, 'sentiment', e.target.value)}
                 options={sentimentOptions}
                 error={errors[`company_news.${index}.sentiment`]}
               />

              <TextInput
                label="Relevance Score"
                name={`relevance_score_${index}`}
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={news.relevance_score || ''}
                onChange={(e) => handleNewsChange(index, 'relevance_score', e.target.value)}
                placeholder="0-10 scale"
                error={errors[`company_news.${index}.relevance_score`]}
              />

              <div className="md:col-span-1">
                <MultiSelect
                  label="Tags"
                  name={`tags_${index}`}
                  values={news.tags || []}
                  onChange={(e) => handleNewsChange(index, 'tags', e.target.value)}
                  options={newsTagsOptions}
                  error={errors[`company_news.${index}.tags`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Company Relationships Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Company Relationships</h3>
          </div>
          <button
            type="button"
            onClick={onAddRelationship}
            className="flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Relationship
          </button>
        </div>

        {(formData.company_relationships || []).map((relationship, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Relationship {index + 1}</h4>
              {formData.company_relationships.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRelationship(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <TextInput
                 label="Related Company Name"
                 name={`related_company_name_${index}`}
                 value={relationship.related_company_name || ''}
                 onChange={(e) => handleRelationshipChange(index, 'related_company_name', e.target.value)}
                 placeholder="Name of subsidiary/parent company"
                 error={errors[`company_relationships.${index}.related_company_name`]}
               />

                             <Select
                 label="Relationship Type"
                 name={`relationship_type_${index}`}
                 value={relationship.relationship_type || ''}
                 onChange={(e) => handleRelationshipChange(index, 'relationship_type', e.target.value)}
                                   options={[
                    { value: 'SUBSIDIARY', label: 'Subsidiary' },
                    { value: 'WHOLLY_OWNED_SUBSIDIARY', label: 'Wholly Owned Subsidiary' },
                    { value: 'PARENT_COMPANY', label: 'Parent Company' },
                    { value: 'JOINT_VENTURE', label: 'Joint Venture' },
                    { value: 'ASSOCIATE', label: 'Associate (20-50% ownership)' },
                    { value: 'MINORITY_INVESTMENT', label: 'Minority Investment (<20% ownership)' },
                    { value: 'BRANCH', label: 'Branch' },
                    { value: 'DIVISION', label: 'Division' },
                    { value: 'SISTER_COMPANY', label: 'Sister Company' },
                    { value: 'AFFILIATE', label: 'Affiliate' },
                    { value: 'PARTNERSHIP', label: 'Partnership' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                 error={errors[`company_relationships.${index}.relationship_type`]}
               />
                                            {/* Note: Relationship direction is determined by the type:
                   - SUBSIDIARY, WHOLLY_OWNED_SUBSIDIARY, JOINT_VENTURE, etc. = Current company has this relationship with the related company
                   - PARENT_COMPANY = Current company is a subsidiary of the related company */}

              <TextInput
                label="Ownership Percentage"
                name={`ownership_percentage_${index}`}
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={relationship.ownership_percentage || ''}
                onChange={(e) => handleRelationshipChange(index, 'ownership_percentage', e.target.value)}
                placeholder="Enter ownership percentage"
                error={errors[`company_relationships.${index}.ownership_percentage`]}
              />

              <TextInput
                label="Acquisition Value"
                name={`acquisition_value_${index}`}
                type="number"
                value={relationship.acquisition_value || ''}
                onChange={(e) => handleRelationshipChange(index, 'acquisition_value', e.target.value)}
                placeholder="Acquisition value in INR"
                error={errors[`company_relationships.${index}.acquisition_value`]}
              />

                             <TextInput
                 label="Effective Date"
                 name={`effective_date_${index}`}
                 type="date"
                 value={relationship.effective_date || ''}
                 onChange={(e) => handleRelationshipChange(index, 'effective_date', e.target.value)}
                 error={errors[`company_relationships.${index}.effective_date`]}
               />

              <TextInput
                label="End Date"
                name={`end_date_${index}`}
                type="date"
                value={relationship.end_date || ''}
                onChange={(e) => handleRelationshipChange(index, 'end_date', e.target.value)}
                error={errors[`company_relationships.${index}.end_date`]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsRelationshipsForm;