import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, Menu, X, Users, Settings, CreditCard, Activity, Star, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ isLoggedIn = false, user = null, onLogin, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Clear avatar cache when signing out
    if (user?.clearCache) {
      user.clearCache();
    }
    await signOut();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const handleAvatarError = (e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=ffffff`;
  };

  // Don't render user info until we have user data (prevents flickering)
  if (isLoggedIn && !user) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">VentureFlow IQ</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Home</Link>
              <Link to="/solutions" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Solutions</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VentureFlow IQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/solutions" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Solutions
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={onLogin}
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:border-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors">
                  Talk to Sales
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none"
                >
                  <div className="relative">
                    <img 
                      className="h-8 w-8 rounded-full object-cover" 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=ffffff`} 
                      alt="Profile" 
                      onError={handleAvatarError}
                      style={{ 
                        transition: 'opacity 0.2s ease-in-out',
                        opacity: user?.isLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-gray-700 font-medium">
                      {user?.name || 'User'}
                    </span>
                    {user?.role && (
                      <span className="text-xs text-gray-500 font-medium">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isUserDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                                      <Link
                  to="/dashboard"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 mr-3" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Users className="h-4 w-4 mr-3" />
                  Profile
                </Link>
                      <Link
                        to="/activity"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Activity className="h-4 w-4 mr-3" />
                        Activity
                      </Link>
                      <Link
                        to="/watchlist"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Star className="h-4 w-4 mr-3" />
                        Watchlist
                      </Link>
                      <Link
                        to="/market-analysis"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Market Analysis
                      </Link>
                      {(user?.role?.toUpperCase() === 'ENTERPRISE' || user?.role?.toUpperCase() === 'ADMIN') && (
                        <Link
                          to="/company-comparison"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4 mr-3" />
                          Compare
                        </Link>
                      )}
                      {user?.role?.toUpperCase() === 'ADMIN' && (
                        <Link
                          to="/admin/contact-messages"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Mail className="h-4 w-4 mr-3" />
                          Contact Messages
                        </Link>
                      )}
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <Link
                        to="/plan-billing"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <CreditCard className="h-4 w-4 mr-3" />
                        Plan & Billing
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
              Home
            </Link>
            <Link to="/solutions" className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
              Solutions
            </Link>
            <Link to="/about" className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
              About
            </Link>
            <Link to="/contact" className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
              Contact
            </Link>
            {isLoggedIn && (
              <div className="pt-4 pb-3 border-t border-gray-200 mt-3">
                <Link
                  to="/dashboard"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  to="/activity"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Activity
                </Link>
                <Link
                  to="/watchlist"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Watchlist
                </Link>
                <Link
                  to="/market-analysis"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Market Analysis
                </Link>
                {(user?.role?.toUpperCase() === 'ENTERPRISE' || user?.role?.toUpperCase() === 'ADMIN') && (
                  <Link
                    to="/company-comparison"
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Compare
                  </Link>
                )}
                {user?.role?.toUpperCase() === 'ADMIN' && (
                  <Link
                    to="/admin/contact-messages"
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Messages
                  </Link>
                )}
              </div>
            )}
            {!isLoggedIn && (
              <div className="pt-4 pb-3 border-t border-gray-200 mt-3">
                <button
                  onClick={onLogin}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Sign In
                </button>
                <button className="block w-full text-left px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-md mt-2 hover:bg-blue-700 transition-colors">
                  Talk to Sales
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;