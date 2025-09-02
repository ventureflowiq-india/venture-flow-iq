import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, Shield, Eye, Lock, Database, Users, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VentureFlow IQ</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-blue-600" />
                Information We Collect
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>Company information you provide during registration</li>
                  <li>Profile information and preferences</li>
                  <li>Communication records when you contact our support team</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Pages visited and features used on our platform</li>
                  <li>Search queries and analysis performed</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2 text-blue-600" />
                How We Use Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-3">Service Delivery</h3>
                  <ul className="list-disc list-inside text-green-800 space-y-2 text-sm">
                    <li>Provide market intelligence and analysis tools</li>
                    <li>Personalize your dashboard and recommendations</li>
                    <li>Enable company data management and comparison</li>
                    <li>Send important service updates and notifications</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-purple-900 mb-3">Platform Improvement</h3>
                  <ul className="list-disc list-inside text-purple-800 space-y-2 text-sm">
                    <li>Analyze usage patterns to improve features</li>
                    <li>Develop new tools and capabilities</li>
                    <li>Optimize performance and user experience</li>
                    <li>Conduct research and analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-blue-600" />
                Data Security & Protection
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-yellow-900 mb-3">Security Measures</h3>
                    <ul className="list-disc list-inside text-yellow-800 space-y-2 text-sm">
                      <li>End-to-end encryption for sensitive data</li>
                      <li>Regular security audits and updates</li>
                      <li>Secure cloud infrastructure (Supabase)</li>
                      <li>Access controls and authentication</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-yellow-900 mb-3">Data Retention</h3>
                    <ul className="list-disc list-inside text-yellow-800 space-y-2 text-sm">
                      <li>Account data retained while account is active</li>
                      <li>Usage analytics stored for 24 months</li>
                      <li>Right to request data deletion</li>
                      <li>Automatic cleanup of inactive accounts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Information Sharing
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 mb-4">
                  <strong>We do not sell, trade, or rent your personal information to third parties.</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-red-900 mb-3">Limited Sharing</h3>
                    <ul className="list-disc list-inside text-red-800 space-y-2 text-sm">
                      <li>Service providers (Supabase, Vercel) for platform operation</li>
                      <li>Legal compliance when required by law</li>
                      <li>Business transfers (merger, acquisition)</li>
                      <li>With your explicit consent</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-red-900 mb-3">Your Rights</h3>
                    <ul className="list-disc list-inside text-red-800 space-y-2 text-sm">
                      <li>Access and download your data</li>
                      <li>Correct inaccurate information</li>
                      <li>Delete your account and data</li>
                      <li>Opt-out of marketing communications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-2 text-blue-600" />
                Cookies & Tracking
              </h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <p className="text-indigo-800 mb-4">
                  We use cookies and similar technologies to enhance your experience and analyze platform usage.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-900 mb-2">Essential Cookies</h3>
                    <p className="text-indigo-800 text-sm">Required for platform functionality and security</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-indigo-900 mb-2">Analytics Cookies</h3>
                    <p className="text-indigo-800 text-sm">Help us understand how you use our platform</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-indigo-900 mb-2">Preference Cookies</h3>
                    <p className="text-indigo-800 text-sm">Remember your settings and preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600"><strong>Email:</strong> privacy@ventureflowiq.com</p>
                    <p className="text-gray-600"><strong>Address:</strong> VentureFlow IQ, India</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><strong>Response Time:</strong> Within 48 hours</p>
                    <p className="text-gray-600"><strong>Data Requests:</strong> Processed within 30 days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500 text-center">
                This Privacy Policy may be updated periodically. We will notify you of any significant changes 
                via email or through our platform. Continued use of our services constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
