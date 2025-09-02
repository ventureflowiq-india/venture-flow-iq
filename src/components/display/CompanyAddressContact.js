import React from 'react';
import { MapPin, Phone, Mail, Building, Map, Star, CheckCircle, ExternalLink, Copy } from 'lucide-react';

const CompanyAddressContact = ({ companyData }) => {
  const getAddressTypeIcon = (type) => {
    const iconMap = {
      'REGISTERED': <Building className="h-4 w-4 text-blue-600" />,
      'CORPORATE': <Building className="h-4 w-4 text-green-600" />,
      'BRANCH': <Building className="h-4 w-4 text-purple-600" />,
      'FACTORY': <Building className="h-4 w-4 text-orange-600" />,
      'WAREHOUSE': <Building className="h-4 w-4 text-red-600" />,
      'OTHER': <Building className="h-4 w-4 text-gray-600" />
    };
    return iconMap[type] || <Building className="h-4 w-4 text-gray-600" />;
  };

  const getContactTypeIcon = (type) => {
    const iconMap = {
      'PHONE': <Phone className="h-4 w-4 text-blue-600" />,
      'EMAIL': <Mail className="h-4 w-4 text-green-600" />,
      'FAX': <Phone className="h-4 w-4 text-purple-600" />,
      'MOBILE': <Phone className="h-4 w-4 text-orange-600" />,
      'OTHER': <Phone className="h-4 w-4 text-gray-600" />
    };
    return iconMap[type] || <Phone className="h-4 w-4 text-gray-600" />;
  };

  const getAddressTypeColor = (type) => {
    const colorMap = {
      'REGISTERED': 'bg-blue-100 text-blue-800 border-blue-200',
      'CORPORATE': 'bg-green-100 text-green-800 border-green-200',
      'BRANCH': 'bg-purple-100 text-purple-800 border-purple-200',
      'FACTORY': 'bg-orange-100 text-orange-800 border-orange-200',
      'WAREHOUSE': 'bg-red-100 text-red-800 border-red-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getContactTypeColor = (type) => {
    const colorMap = {
      'PHONE': 'bg-blue-100 text-blue-800 border-blue-200',
      'EMAIL': 'bg-green-100 text-green-800 border-green-200',
      'FAX': 'bg-purple-100 text-purple-800 border-purple-200',
      'MOBILE': 'bg-orange-100 text-orange-800 border-orange-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCoordinates = (lat, lng) => {
    if (!lat || !lng) return null;
    try {
      const latitude = parseFloat(lat).toFixed(6);
      const longitude = parseFloat(lng).toFixed(6);
      return `${latitude}, ${longitude}`;
    } catch (error) {
      return null;
    }
  };

  const formatAddress = (address) => {
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.zip_code,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const getGoogleMapsUrl = (address) => {
    if (address.latitude && address.longitude) {
      return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
    }
    const addressString = formatAddress(address);
    return `https://www.google.com/maps/search/${encodeURIComponent(addressString)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleContactClick = (contact) => {
    if (contact.contact_type === 'EMAIL') {
      window.location.href = `mailto:${contact.contact_value}`;
    } else if (contact.contact_type === 'PHONE' || contact.contact_type === 'MOBILE') {
      window.location.href = `tel:${contact.contact_value}`;
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Address & Contact Information</h3>
      
      {/* Summary Stats */}
      {(companyData.addresses?.length > 0 || companyData.contacts?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {companyData.addresses?.length || 0}
                </p>
                <p className="text-sm text-blue-700">Registered Addresses</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {companyData.contacts?.length || 0}
                </p>
                <p className="text-sm text-green-700">Contact Methods</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Addresses Section */}
      {companyData.addresses && companyData.addresses.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            Company Addresses ({companyData.addresses.length})
          </h4>
          
          <div className="space-y-4">
            {companyData.addresses.map((address, index) => (
              <div key={address.id || index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getAddressTypeIcon(address.address_type)}
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {address.address_type ? address.address_type.replace('_', ' ') + ' Address' : 'Address'}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {address.city && address.state ? `${address.city}, ${address.state}` : 'Location'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {address.is_primary && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getAddressTypeColor(address.address_type)}`}>
                      {address.address_type ? address.address_type.replace('_', ' ') : 'Other'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {address.address_line_1 && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Street Address:</span>
                      <p className="text-gray-900 mt-1">{address.address_line_1}</p>
                      {address.address_line_2 && (
                        <p className="text-gray-600">{address.address_line_2}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {address.city && (
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <p className="text-gray-900">{address.city}</p>
                      </div>
                    )}
                    {address.state && (
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <p className="text-gray-900">{address.state}</p>
                      </div>
                    )}
                    {address.zip_code && (
                      <div>
                        <span className="font-medium text-gray-700">ZIP Code:</span>
                        <p className="text-gray-900">{address.zip_code}</p>
                      </div>
                    )}
                    {address.country && (
                      <div>
                        <span className="font-medium text-gray-700">Country:</span>
                        <p className="text-gray-900">{address.country}</p>
                      </div>
                    )}
                  </div>
                  
                  {formatCoordinates(address.latitude, address.longitude) && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Coordinates:</span>
                      <p className="text-gray-600 font-mono text-xs">
                        {formatCoordinates(address.latitude, address.longitude)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => copyToClipboard(formatAddress(address))}
                    className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Address
                  </button>
                  <a
                    href={getGoogleMapsUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View on Maps
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts Section */}
      {companyData.contacts && companyData.contacts.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Phone className="h-5 w-5 text-green-600 mr-2" />
            Contact Information ({companyData.contacts.length})
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {companyData.contacts.map((contact, index) => (
              <div key={contact.id || index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      {getContactTypeIcon(contact.contact_type)}
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {contact.contact_type ? contact.contact_type.replace('_', ' ') : 'Contact'}
                      </h5>
                      {contact.department && (
                        <p className="text-sm text-gray-600">{contact.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {contact.is_verified && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                    {contact.is_primary && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getContactTypeColor(contact.contact_type)}`}>
                      {contact.contact_type ? contact.contact_type.replace('_', ' ') : 'Other'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Contact Value:</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1 break-all">
                      {contact.contact_value}
                    </p>
                  </div>
                  
                  {contact.department && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Department:</span>
                      <p className="text-gray-900">{contact.department}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => copyToClipboard(contact.contact_value)}
                    className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  {(contact.contact_type === 'EMAIL' || contact.contact_type === 'PHONE' || contact.contact_type === 'MOBILE') && (
                    <button
                      onClick={() => handleContactClick(contact)}
                      className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {contact.contact_type === 'EMAIL' ? (
                        <>
                          <Mail className="h-4 w-4 mr-1" />
                          Send Email
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-1" />
                          Call Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!companyData.addresses || companyData.addresses.length === 0) && 
       (!companyData.contacts || companyData.contacts.length === 0) && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Address or Contact Information</h4>
          <p className="text-gray-500">
            This company doesn't have any address or contact information uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyAddressContact;