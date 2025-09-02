import React from 'react';
import { TextInput, Select, Checkbox } from './FormComponents';
import { Plus, Trash2 } from 'lucide-react';

const AddressContactForm = ({ formData, onChange, onAddAddress, onRemoveAddress, onAddContact, onRemoveContact, errors }) => {
  const addressTypeOptions = [
    { value: 'REGISTERED', label: 'Registered Office' },
    { value: 'CORPORATE', label: 'Corporate Office' },
    { value: 'BRANCH', label: 'Branch Office' },
    { value: 'FACTORY', label: 'Factory' },
    { value: 'WAREHOUSE', label: 'Warehouse' },
    { value: 'OTHER', label: 'Other' }
  ];

  const contactTypeOptions = [
    { value: 'PHONE', label: 'Phone' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'FAX', label: 'Fax' },
    { value: 'MOBILE', label: 'Mobile' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleAddressChange = (index, field, value) => {
    const addresses = [...(formData.addresses || [])];
    addresses[index] = { ...addresses[index], [field]: value };
    onChange({ target: { name: 'addresses', value: addresses } });
  };

  const handleContactChange = (index, field, value) => {
    const contacts = [...(formData.contacts || [])];
    contacts[index] = { ...contacts[index], [field]: value };
    onChange({ target: { name: 'contacts', value: contacts } });
  };

  return (
    <div className="space-y-6">
      {/* Addresses Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Company Addresses</h3>
          <button
            type="button"
            onClick={onAddAddress}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Address
          </button>
        </div>

        {(formData.addresses || []).map((address, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Address {index + 1}</h4>
              {formData.addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveAddress(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Address Type"
                name={`address_type_${index}`}
                value={address.address_type || ''}
                onChange={(e) => handleAddressChange(index, 'address_type', e.target.value)}
                options={addressTypeOptions}
                error={errors[`addresses.${index}.address_type`]}
              />

              <div className="flex items-center mt-6">
                <Checkbox
                  label="Primary Address"
                  name={`is_primary_${index}`}
                  checked={address.is_primary || false}
                  onChange={(e) => handleAddressChange(index, 'is_primary', e.target.checked)}
                />
              </div>

              <div className="md:col-span-2">
                <TextInput
                  label="Address Line 1"
                  name={`address_line_1_${index}`}
                  value={address.address_line_1 || ''}
                  onChange={(e) => handleAddressChange(index, 'address_line_1', e.target.value)}
                  placeholder="Enter address line 1"
                  error={errors[`addresses.${index}.address_line_1`]}
                />
              </div>

              <div className="md:col-span-2">
                <TextInput
                  label="Address Line 2"
                  name={`address_line_2_${index}`}
                  value={address.address_line_2 || ''}
                  onChange={(e) => handleAddressChange(index, 'address_line_2', e.target.value)}
                  placeholder="Enter address line 2 (optional)"
                  error={errors[`addresses.${index}.address_line_2`]}
                />
              </div>

              <TextInput
                label="City"
                name={`city_${index}`}
                value={address.city || ''}
                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                placeholder="Enter city"
                error={errors[`addresses.${index}.city`]}
              />

              <TextInput
                label="State"
                name={`state_${index}`}
                value={address.state || ''}
                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                placeholder="Enter state"
                error={errors[`addresses.${index}.state`]}
              />

              <TextInput
                label="ZIP Code"
                name={`zip_code_${index}`}
                value={address.zip_code || ''}
                onChange={(e) => handleAddressChange(index, 'zip_code', e.target.value)}
                placeholder="Enter ZIP code"
                error={errors[`addresses.${index}.zip_code`]}
              />

              <TextInput
                label="Country"
                name={`country_${index}`}
                value={address.country || 'India'}
                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                placeholder="Enter country"
                error={errors[`addresses.${index}.country`]}
              />

              <TextInput
                label="Latitude"
                name={`latitude_${index}`}
                type="number"
                step="any"
                value={address.latitude || ''}
                onChange={(e) => handleAddressChange(index, 'latitude', e.target.value)}
                placeholder="Enter latitude (optional)"
                error={errors[`addresses.${index}.latitude`]}
              />

              <TextInput
                label="Longitude"
                name={`longitude_${index}`}
                type="number"
                step="any"
                value={address.longitude || ''}
                onChange={(e) => handleAddressChange(index, 'longitude', e.target.value)}
                placeholder="Enter longitude (optional)"
                error={errors[`addresses.${index}.longitude`]}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Contacts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <button
            type="button"
            onClick={onAddContact}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </button>
        </div>

        {(formData.contacts || []).map((contact, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
              {formData.contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveContact(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Select
                 label="Contact Type"
                 name={`contact_type_${index}`}
                 value={contact.contact_type || ''}
                 onChange={(e) => handleContactChange(index, 'contact_type', e.target.value)}
                 options={contactTypeOptions}
                 error={errors[`contacts.${index}.contact_type`]}
               />

                             <TextInput
                 label="Contact Value"
                 name={`contact_value_${index}`}
                 value={contact.contact_value || ''}
                 onChange={(e) => handleContactChange(index, 'contact_value', e.target.value)}
                 placeholder="Enter contact value"
                 error={errors[`contacts.${index}.contact_value`]}
               />

              <TextInput
                label="Department"
                name={`department_${index}`}
                value={contact.department || ''}
                onChange={(e) => handleContactChange(index, 'department', e.target.value)}
                placeholder="Enter department (optional)"
                error={errors[`contacts.${index}.department`]}
              />

              <div className="flex items-center space-x-4 mt-6">
                <Checkbox
                  label="Verified"
                  name={`is_verified_${index}`}
                  checked={contact.is_verified || false}
                  onChange={(e) => handleContactChange(index, 'is_verified', e.target.checked)}
                />
                <Checkbox
                  label="Primary Contact"
                  name={`is_primary_contact_${index}`}
                  checked={contact.is_primary || false}
                  onChange={(e) => handleContactChange(index, 'is_primary', e.target.checked)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressContactForm;