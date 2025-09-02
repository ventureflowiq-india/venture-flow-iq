import React from 'react';
import { Users, User, Calendar, Mail, Phone, Award, Star, Building, Shield, Crown, Briefcase } from 'lucide-react';

const CompanyKeyOfficials = ({ companyData }) => {
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

  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'Not specified';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const getCurrentStatusColor = (isCurrent) => {
    return isCurrent 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBoardMemberColor = (isBoardMember) => {
    return isBoardMember 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDesignationIcon = (designation) => {
    if (!designation) return <User className="h-6 w-6 text-gray-600" />;
    
    const designationLower = designation.toLowerCase();
    if (designationLower.includes('ceo') || designationLower.includes('chief executive')) {
      return <Crown className="h-6 w-6 text-purple-600" />;
    }
    if (designationLower.includes('cfo') || designationLower.includes('chief financial')) {
      return <Award className="h-6 w-6 text-green-600" />;
    }
    if (designationLower.includes('cto') || designationLower.includes('chief technology')) {
      return <Star className="h-6 w-6 text-blue-600" />;
    }
    if (designationLower.includes('director') || designationLower.includes('chairman')) {
      return <Building className="h-6 w-6 text-indigo-600" />;
    }
    if (designationLower.includes('manager') || designationLower.includes('head')) {
      return <Briefcase className="h-6 w-6 text-orange-600" />;
    }
    return <User className="h-6 w-6 text-gray-600" />;
  };

  const getDesignationColor = (designation) => {
    if (!designation) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    const designationLower = designation.toLowerCase();
    if (designationLower.includes('ceo') || designationLower.includes('chief executive')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (designationLower.includes('cfo') || designationLower.includes('chief financial')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (designationLower.includes('cto') || designationLower.includes('chief technology')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (designationLower.includes('director') || designationLower.includes('chairman')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const calculateTenure = (appointmentDate, resignationDate) => {
    if (!appointmentDate) return 'Not specified';
    
    const startDate = new Date(appointmentDate);
    const endDate = resignationDate ? new Date(resignationDate) : new Date();
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  const getCommitteeMemberships = (official) => {
    // Handle both camelCase and snake_case field names
    const memberships = official.committee_memberships || official.committeeMemberships || [];
    if (!Array.isArray(memberships) || memberships.length === 0) return null;
    
    const committeeLabelMap = {
      'audit': 'Audit Committee',
      'compensation': 'Compensation Committee',
      'nomination': 'Nomination Committee',
      'risk': 'Risk Management Committee',
      'governance': 'Corporate Governance Committee',
      'investment': 'Investment Committee',
      'strategy': 'Strategy Committee'
    };
    
    return memberships.map(membership => committeeLabelMap[membership] || membership);
  };

  if (!companyData.key_officials || companyData.key_officials.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Officials & Board Members</h3>
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Key Officials Information</h4>
          <p className="text-gray-500">
            This company doesn't have any key officials or board members information uploaded yet.
          </p>
        </div>
      </div>
    );
  }

  // Separate current and former officials
  const currentOfficials = companyData.key_officials.filter(official => official.is_current !== false);
  const formerOfficials = companyData.key_officials.filter(official => official.is_current === false);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Officials & Board Members</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total Officials</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {companyData.key_officials.length}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Current Officials</span>
            <Star className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {currentOfficials.length}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Board Members</span>
            <Building className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {companyData.key_officials.filter(official => official.is_board_member).length}
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Independent Directors</span>
            <Shield className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {companyData.key_officials.filter(official => official.is_independent).length}
          </div>
        </div>
      </div>

      {/* Current Officials */}
      {currentOfficials.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Star className="h-5 w-5 text-green-600 mr-2" />
            Current Officials ({currentOfficials.length})
          </h4>
          
          <div className="space-y-4">
            {currentOfficials.map((official, index) => (
              <div key={official.id || index} className="bg-green-50 rounded-lg p-6 border border-green-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-green-200 shadow-sm">
                      {getDesignationIcon(official.designation)}
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-900">{official.name}</h5>
                      <p className="text-lg text-gray-700 font-medium">{official.designation}</p>
                      {official.din && (
                        <p className="text-sm text-gray-600 font-mono">DIN: {official.din}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getCurrentStatusColor(official.is_current)}`}>
                      <Star className="h-4 w-4 mr-1" />
                      Current
                    </span>
                    
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getDesignationColor(official.designation)}`}>
                      {official.designation}
                    </span>
                    
                    {official.is_board_member && (
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getBoardMemberColor(official.is_board_member)}`}>
                        <Building className="h-4 w-4 mr-1" />
                        Board Member
                      </span>
                    )}
                    
                    {official.is_independent && (
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border bg-orange-100 text-orange-800 border-orange-200">
                        <Shield className="h-4 w-4 mr-1" />
                        Independent Director
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  <div className="space-y-3">
                    <h6 className="text-sm font-semibold text-gray-700 uppercase">Personal Information</h6>
                    
                    {official.age && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Age:</span>
                        <span className="text-gray-900 ml-2">{official.age} years</span>
                      </div>
                    )}
                    
                    {official.education && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Education:</span>
                        <p className="text-gray-900 mt-1">{official.education}</p>
                      </div>
                    )}
                    
                    {official.previous_experience && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Previous Experience:</span>
                        <p className="text-gray-900 mt-1 text-xs leading-relaxed">{official.previous_experience}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h6 className="text-sm font-semibold text-gray-700 uppercase">Contact & Tenure</h6>
                    
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Appointment Date:</span>
                      <span className="text-gray-900 ml-2">{formatDate(official.appointment_date)}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Tenure:</span>
                      <span className="text-gray-900 ml-2">{calculateTenure(official.appointment_date, official.resignation_date)}</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {official.email && (
                        <a
                          href={`mailto:${official.email}`}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {official.email}
                        </a>
                      )}
                      
                      {official.phone && (
                        <a
                          href={`tel:${official.phone}`}
                          className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {official.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {official.is_board_member && (
                    <div className="space-y-3">
                      <h6 className="text-sm font-semibold text-gray-700 uppercase">Board Information</h6>
                      
                      {official.board_role && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Board Role:</span>
                          <span className="text-gray-900 ml-2">{official.board_role}</span>
                        </div>
                      )}
                      
                      {official.shareholding_percentage && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Shareholding:</span>
                          <span className="text-gray-900 ml-2 font-semibold">{formatPercentage(official.shareholding_percentage)}</span>
                        </div>
                      )}
                      
                      {official.remuneration_annual && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Annual Remuneration:</span>
                          <span className="text-gray-900 ml-2 font-semibold">{formatCurrency(official.remuneration_annual)}</span>
                        </div>
                      )}
                      
                      {getCommitteeMemberships(official) && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Committee Memberships:</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {getCommitteeMemberships(official).map((committee, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                              >
                                {committee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Former Officials */}
      {formerOfficials.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            Former Officials ({formerOfficials.length})
          </h4>
          
          <div className="space-y-4">
            {formerOfficials.map((official, index) => (
              <div key={official.id || index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                      {getDesignationIcon(official.designation)}
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900">{official.name}</h5>
                      <p className="text-md text-gray-700">{official.designation}</p>
                      {official.din && (
                        <p className="text-sm text-gray-600 font-mono">DIN: {official.din}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getCurrentStatusColor(official.is_current)}`}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Former
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Appointment:</span>
                    <span className="text-gray-900 ml-2">{formatDate(official.appointment_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Resignation:</span>
                    <span className="text-gray-900 ml-2">{formatDate(official.resignation_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tenure:</span>
                    <span className="text-gray-900 ml-2">{calculateTenure(official.appointment_date, official.resignation_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyKeyOfficials;