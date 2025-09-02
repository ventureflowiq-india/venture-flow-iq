import React from 'react';
import { TextInput, TextArea, Checkbox } from './FormComponents';
import { Plus, Trash2 } from 'lucide-react';

const KeyOfficialsForm = ({ formData, onChange, onAddOfficial, onRemoveOfficial, errors }) => {

  const handleOfficialChange = (index, field, value) => {
    const officials = [...(formData.key_officials || [])];
    officials[index] = { ...officials[index], [field]: value };
    onChange({ target: { name: 'key_officials', value: officials } });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Key Officials & Board Members</h3>
        <button
          type="button"
          onClick={onAddOfficial}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Official
        </button>
      </div>

      {(formData.key_officials || []).map((official, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Official {index + 1}</h4>
            {formData.key_officials.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveOfficial(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Name (Optional)"
              name={`name_${index}`}
              value={official.name || ''}
              onChange={(e) => handleOfficialChange(index, 'name', e.target.value)}
              placeholder="Enter full name (optional)"
              error={errors[`key_officials.${index}.name`]}
            />

            <TextInput
              label="Designation (Optional)"
              name={`designation_${index}`}
              value={official.designation || ''}
              onChange={(e) => handleOfficialChange(index, 'designation', e.target.value)}
              placeholder="e.g., CEO, CFO, Director (optional)"
              error={errors[`key_officials.${index}.designation`]}
            />

            <TextInput
              label="DIN (Director Identification Number)"
              name={`din_${index}`}
              value={official.din || ''}
              onChange={(e) => handleOfficialChange(index, 'din', e.target.value)}
              placeholder="Enter DIN (if applicable)"
              error={errors[`key_officials.${index}.din`]}
            />

            <TextInput
              label="Age"
              name={`age_${index}`}
              type="number"
              value={official.age || ''}
              onChange={(e) => handleOfficialChange(index, 'age', e.target.value)}
              placeholder="Enter age"
              error={errors[`key_officials.${index}.age`]}
            />

            <TextInput
              label="Email"
              name={`email_${index}`}
              type="email"
              value={official.email || ''}
              onChange={(e) => handleOfficialChange(index, 'email', e.target.value)}
              placeholder="Enter email address"
              error={errors[`key_officials.${index}.email`]}
            />

            <TextInput
              label="Phone"
              name={`phone_${index}`}
              value={official.phone || ''}
              onChange={(e) => handleOfficialChange(index, 'phone', e.target.value)}
              placeholder="Enter phone number"
              error={errors[`key_officials.${index}.phone`]}
            />

            <TextInput
              label="Appointment Date"
              name={`appointment_date_${index}`}
              type="date"
              value={official.appointment_date || ''}
              onChange={(e) => handleOfficialChange(index, 'appointment_date', e.target.value)}
              error={errors[`key_officials.${index}.appointment_date`]}
            />

            <TextInput
              label="Resignation Date"
              name={`resignation_date_${index}`}
              type="date"
              value={official.resignation_date || ''}
              onChange={(e) => handleOfficialChange(index, 'resignation_date', e.target.value)}
              error={errors[`key_officials.${index}.resignation_date`]}
            />

            <div className="md:col-span-2">
              <TextArea
                label="Education"
                name={`education_${index}`}
                value={official.education || ''}
                onChange={(e) => handleOfficialChange(index, 'education', e.target.value)}
                placeholder="Enter educational background"
                error={errors[`key_officials.${index}.education`]}
              />
            </div>

            <div className="md:col-span-2">
              <TextArea
                label="Previous Experience"
                name={`previous_experience_${index}`}
                value={official.previous_experience || ''}
                onChange={(e) => handleOfficialChange(index, 'previous_experience', e.target.value)}
                placeholder="Enter previous work experience"
                rows={3}
                error={errors[`key_officials.${index}.previous_experience`]}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Checkbox
                label="Current Official"
                name={`is_current_${index}`}
                checked={official.is_current !== false}
                onChange={(e) => handleOfficialChange(index, 'is_current', e.target.checked)}
              />
              <Checkbox
                label="Board Member"
                name={`is_board_member_${index}`}
                checked={official.is_board_member || false}
                onChange={(e) => handleOfficialChange(index, 'is_board_member', e.target.checked)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeyOfficialsForm;