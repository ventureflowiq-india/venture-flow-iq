import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Lock } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setSessionLoading(true);
        setError('');

        // Get tokens from URL parameters (check both query string and hash fragment)
        let accessToken = searchParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token');
        let type = searchParams.get('type');

        // If not found in query string, check hash fragment
        if (!accessToken || !refreshToken || !type) {
          const hash = window.location.hash.substring(1); // Remove the #
          const hashParams = new URLSearchParams(hash);
          
          accessToken = accessToken || hashParams.get('access_token');
          refreshToken = refreshToken || hashParams.get('refresh_token');
          type = type || hashParams.get('type');
        }

        // Debug logging
        console.log('Reset Password Debug:', {
          accessToken: accessToken ? 'Present' : 'Missing',
          refreshToken: refreshToken ? 'Present' : 'Missing',
          type: type,
          fullURL: window.location.href,
          queryParams: Object.fromEntries(searchParams.entries()),
          hashFragment: window.location.hash,
          hashParams: window.location.hash ? Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)).entries()) : {}
        });

        if (!accessToken || !refreshToken || type !== 'recovery') {
          console.log('Reset link validation failed:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            typeMatches: type === 'recovery',
            actualType: type
          });
          setError('Invalid or expired reset link. Please request a new password reset.');
          setValidSession(false);
          setSessionLoading(false);
          return;
        }

        // Set the session with tokens from URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to establish session. Please request a new password reset link.');
          setValidSession(false);
        } else if (data.session) {
          setValidSession(true);
          setError('');
        } else {
          setError('Unable to establish session. Please request a new password reset link.');
          setValidSession(false);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setError('An error occurred while verifying your reset link. Please try again.');
        setValidSession(false);
      } finally {
        setSessionLoading(false);
      }
    };

    initializeSession();
  }, [searchParams]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength({
      hasLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score < 2) return { text: 'Weak', color: 'text-red-600' };
    if (score < 4) return { text: 'Medium', color: 'text-yellow-600' };
    return { text: 'Strong', color: 'text-green-600' };
  };

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (getPasswordStrengthScore() < 3) {
      setError('Please choose a stronger password. It should meet at least 3 of the security requirements.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Double-check session before attempting password update
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Session expired. Please request a new password reset link.');
      }

      const { error: updateError } = await updatePassword(password);
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Password updated successfully! Please log in with your new password.',
            type: 'success'
          }
        });
      }, 2000);

    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/forgot-password', { 
      state: { 
        message: 'Please enter your email to receive a new password reset link.' 
      }
    });
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h2>
            <p className="text-gray-600">Please wait while we verify your password reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (!validSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleRequestNewLink}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Request New Reset Link
              </button>
              
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Updated Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated. You will be redirected to the login page shortly.
            </p>
            
            <div className="animate-pulse">
              <div className="h-2 bg-blue-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{width: '100%'}}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Password strength:</span>
                    <span className={`text-sm font-medium ${getPasswordStrengthText().color}`}>
                      {getPasswordStrengthText().text}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPasswordStrengthScore() < 2 ? 'bg-red-500' :
                        getPasswordStrengthScore() < 4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{width: `${(getPasswordStrengthScore() / 5) * 100}%`}}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.hasLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                      At least 8 characters
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Uppercase letter
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Lowercase letter
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Number
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Special character
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {password === confirmPassword ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || getPasswordStrengthScore() < 3 || password !== confirmPassword}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>

            {/* Back to Sign In Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>For your security, this reset link can only be used once and will expire after use.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;