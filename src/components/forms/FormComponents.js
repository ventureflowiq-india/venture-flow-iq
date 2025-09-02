import React from 'react';
import { AlertCircle } from 'lucide-react';

// Text Input Component
export const TextInput = ({ label, name, value, onChange, placeholder, required = false, error, type = "text" }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    />
    {error && (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

// Textarea Component
export const TextArea = ({ label, name, value, onChange, placeholder, required = false, error, rows = 3 }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    />
    {error && (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

// Select Component
export const Select = ({ label, name, value, onChange, options, required = false, error, placeholder = "Select..." }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

// Checkbox Component
export const Checkbox = ({ label, name, checked, onChange, error }) => (
  <div className="mb-4">
    <div className="flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
    {error && (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

// Multi-Select Component for Arrays
export const MultiSelect = ({ label, name, values, onChange, options, required = false, error }) => {
  const handleChange = (optionValue) => {
    const newValues = values.includes(optionValue)
      ? values.filter(v => v !== optionValue)
      : [...values, optionValue];
    onChange({ target: { name, value: newValues } });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`${name}-${option.value}`}
              checked={values.includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`${name}-${option.value}`} className="ml-2 text-sm text-gray-900">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

// File Upload Component
export const FileUpload = ({ label, name, onChange, accept, required = false, error, multiple = false }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="file"
      id={name}
      name={name}
      onChange={onChange}
      accept={accept}
      required={required}
      multiple={multiple}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    />
    {error && (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);