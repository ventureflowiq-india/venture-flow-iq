// Role-Based Access Control (RBAC) utility functions

export const USER_ROLES = {
  FREEMIUM: 'FREEMIUM',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
  ADMIN: 'ADMIN'
};

export const ACCESS_LEVELS = {
  // Company data sections
  BASIC_INFO: 'basic_info',
  ADDRESS_CONTACT: 'address_contact',
  KEY_OFFICIALS: 'key_officials',
  FINANCIAL_INFO: 'financial_info',
  FINANCIAL_METRICS: 'financial_metrics',
  FUNDING_INVESTMENTS: 'funding_investments',
  REGULATORY_LEGAL: 'regulatory_legal',
  NEWS_RELATIONSHIPS: 'news_relationships',
  
  // Actions
  CREATE_COMPANY: 'create_company',
  UPDATE_COMPANY: 'update_company',
  DELETE_COMPANY: 'delete_company',
  VIEW_COMPANY: 'view_company',
  EXPORT_DATA: 'export_data',
  USE_WATCHLIST: 'use_watchlist'
};

// Define what each role can access
export const ROLE_PERMISSIONS = {
  [USER_ROLES.FREEMIUM]: {
    sections: [
      ACCESS_LEVELS.BASIC_INFO,
      ACCESS_LEVELS.ADDRESS_CONTACT
    ],
    actions: [
      ACCESS_LEVELS.VIEW_COMPANY,
      ACCESS_LEVELS.USE_WATCHLIST
    ]
  },
  
  [USER_ROLES.PREMIUM]: {
    sections: [
      ACCESS_LEVELS.BASIC_INFO,
      ACCESS_LEVELS.ADDRESS_CONTACT,
      ACCESS_LEVELS.KEY_OFFICIALS,
      ACCESS_LEVELS.FINANCIAL_INFO,
      ACCESS_LEVELS.FINANCIAL_METRICS
    ],
    actions: [
      ACCESS_LEVELS.VIEW_COMPANY,
      ACCESS_LEVELS.EXPORT_DATA,
      ACCESS_LEVELS.USE_WATCHLIST
    ]
  },
  
  [USER_ROLES.ENTERPRISE]: {
    sections: [
      ACCESS_LEVELS.BASIC_INFO,
      ACCESS_LEVELS.ADDRESS_CONTACT,
      ACCESS_LEVELS.KEY_OFFICIALS,
      ACCESS_LEVELS.FINANCIAL_INFO,
      ACCESS_LEVELS.FINANCIAL_METRICS,
      ACCESS_LEVELS.FUNDING_INVESTMENTS,
      ACCESS_LEVELS.REGULATORY_LEGAL,
      ACCESS_LEVELS.NEWS_RELATIONSHIPS
    ],
    actions: [
      ACCESS_LEVELS.VIEW_COMPANY,
      ACCESS_LEVELS.EXPORT_DATA,
      ACCESS_LEVELS.USE_WATCHLIST
    ]
  },
  
  [USER_ROLES.ADMIN]: {
    sections: [
      ACCESS_LEVELS.BASIC_INFO,
      ACCESS_LEVELS.ADDRESS_CONTACT,
      ACCESS_LEVELS.KEY_OFFICIALS,
      ACCESS_LEVELS.FINANCIAL_INFO,
      ACCESS_LEVELS.FINANCIAL_METRICS,
      ACCESS_LEVELS.FUNDING_INVESTMENTS,
      ACCESS_LEVELS.REGULATORY_LEGAL,
      ACCESS_LEVELS.NEWS_RELATIONSHIPS
    ],
    actions: [
      ACCESS_LEVELS.VIEW_COMPANY,
      ACCESS_LEVELS.CREATE_COMPANY,
      ACCESS_LEVELS.UPDATE_COMPANY,
      ACCESS_LEVELS.DELETE_COMPANY,
      ACCESS_LEVELS.EXPORT_DATA,
      ACCESS_LEVELS.USE_WATCHLIST
    ]
  }
};

/**
 * Check if a user has access to a specific section
 * @param {string} userRole - The user's role
 * @param {string} section - The section to check access for
 * @returns {boolean} - Whether the user has access
 */
export const hasSectionAccess = (userRole, section) => {
  if (!userRole || !section) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  return permissions.sections.includes(section);
};

/**
 * Check if a user can perform a specific action
 * @param {string} userRole - The user's role
 * @param {string} action - The action to check
 * @returns {boolean} - Whether the user can perform the action
 */
export const hasActionAccess = (userRole, action) => {
  if (!userRole || !action) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  return permissions.actions.includes(action);
};

/**
 * Check if a user can create/update/delete company data
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can modify company data
 */
export const canModifyCompanyData = (userRole) => {
  return hasActionAccess(userRole, ACCESS_LEVELS.CREATE_COMPANY) ||
         hasActionAccess(userRole, ACCESS_LEVELS.UPDATE_COMPANY) ||
         hasActionAccess(userRole, ACCESS_LEVELS.DELETE_COMPANY);
};

/**
 * Check if a user can export company data
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can export data
 */
export const canExportData = (userRole) => {
  return hasActionAccess(userRole, ACCESS_LEVELS.EXPORT_DATA);
};

/**
 * Check if a user can use watchlist functionality
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can use watchlist
 */
export const canUseWatchlist = (userRole) => {
  return hasActionAccess(userRole, ACCESS_LEVELS.USE_WATCHLIST);
};

/**
 * Get the maximum step a user can access in the company upload form
 * @param {string} userRole - The user's role
 * @returns {number} - The maximum step number (1-7)
 */
export const getMaxStepForRole = (userRole) => {
  const stepMapping = {
    [ACCESS_LEVELS.BASIC_INFO]: 1,
    [ACCESS_LEVELS.ADDRESS_CONTACT]: 2,
    [ACCESS_LEVELS.KEY_OFFICIALS]: 3,
    [ACCESS_LEVELS.FINANCIAL_INFO]: 4,
    [ACCESS_LEVELS.FINANCIAL_METRICS]: 4, // Same as financial info
    [ACCESS_LEVELS.FUNDING_INVESTMENTS]: 5,
    [ACCESS_LEVELS.REGULATORY_LEGAL]: 6,
    [ACCESS_LEVELS.NEWS_RELATIONSHIPS]: 7
  };
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return 1;
  
  let maxStep = 1;
  permissions.sections.forEach(section => {
    const step = stepMapping[section];
    if (step && step > maxStep) {
      maxStep = step;
    }
  });
  
  return maxStep;
};

/**
 * Get accessible sections for a user role
 * @param {string} userRole - The user's role
 * @returns {Array} - Array of accessible sections
 */
export const getAccessibleSections = (userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions ? permissions.sections : [];
};

/**
 * Get available actions for a user role
 * @param {string} userRole - The user's role
 * @returns {Array} - Array of available actions
 */
export const getAvailableActions = (userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions ? permissions.actions : [];
};

/**
 * Check if a user role is valid
 * @param {string} role - The role to validate
 * @returns {boolean} - Whether the role is valid
 */
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

/**
 * Get role display name
 * @param {string} role - The role
 * @returns {string} - Display name for the role
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [USER_ROLES.FREEMIUM]: 'Freemium',
    [USER_ROLES.PREMIUM]: 'Premium',
    [USER_ROLES.ENTERPRISE]: 'Enterprise',
    [USER_ROLES.ADMIN]: 'Admin'
  };
  
  return displayNames[role] || role;
};

/**
 * Get role description
 * @param {string} role - The role
 * @returns {string} - Description for the role
 */
export const getRoleDescription = (role) => {
  const descriptions = {
    [USER_ROLES.FREEMIUM]: 'Basic company information and contact details',
    [USER_ROLES.PREMIUM]: 'Basic info, contact, key officials, and financial data',
    [USER_ROLES.ENTERPRISE]: 'Full access to all company information',
    [USER_ROLES.ADMIN]: 'Full access with ability to create, update, and delete company data'
  };
  
  return descriptions[role] || 'Unknown role';
};
