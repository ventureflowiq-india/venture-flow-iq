import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';

const TermsOfUse = () => {
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
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Use</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="h-6 w-6 mr-2 text-blue-600" />
                Acceptance of Terms
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-800 mb-4">
                  By accessing and using VentureFlow IQ ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800 text-sm">You must be at least 18 years old to use this service</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800 text-sm">You must provide accurate registration information</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800 text-sm">You are responsible for maintaining account security</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800 text-sm">You agree to use the service lawfully and ethically</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Service Description
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-3">What We Provide</h3>
                  <ul className="list-disc list-inside text-green-800 space-y-2 text-sm">
                    <li>Market intelligence and company analysis tools</li>
                    <li>Company data management and comparison features</li>
                    <li>Watchlist and portfolio tracking capabilities</li>
                    <li>Research and analytics dashboard</li>
                    <li>User account management and profile features</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-orange-900 mb-3">Service Availability</h3>
                  <ul className="list-disc list-inside text-orange-800 space-y-2 text-sm">
                    <li>24/7 platform availability (subject to maintenance)</li>
                    <li>Regular updates and feature improvements</li>
                    <li>Technical support during business hours</li>
                    <li>Data backup and security measures</li>
                    <li>Scalable infrastructure for growing usage</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-blue-600" />
                User Responsibilities
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 mb-3 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Prohibited Activities
                  </h3>
                  <ul className="list-disc list-inside text-red-800 space-y-2 text-sm">
                    <li>Sharing account credentials with others</li>
                    <li>Attempting to hack or compromise the platform</li>
                    <li>Uploading malicious or illegal content</li>
                    <li>Violating intellectual property rights</li>
                    <li>Using the service for fraudulent activities</li>
                    <li>Spamming or sending unsolicited communications</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Required Conduct
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-2 text-sm">
                    <li>Maintain accurate and up-to-date information</li>
                    <li>Respect other users and their data</li>
                    <li>Report security issues or bugs promptly</li>
                    <li>Comply with applicable laws and regulations</li>
                    <li>Use the service for legitimate business purposes</li>
                    <li>Protect your account and data security</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Management</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-yellow-900 mb-3">Account Creation</h3>
                    <ul className="list-disc list-inside text-yellow-800 space-y-2 text-sm">
                      <li>One account per person or organization</li>
                      <li>Email verification required for activation</li>
                      <li>Complete profile information for full access</li>
                      <li>Choose appropriate subscription plan</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-yellow-900 mb-3">Account Termination</h3>
                    <ul className="list-disc list-inside text-yellow-800 space-y-2 text-sm">
                      <li>You may cancel your account at any time</li>
                      <li>We may suspend accounts for policy violations</li>
                      <li>Data retention policies apply after termination</li>
                      <li>Outstanding payments must be settled</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-purple-900 mb-3">Our Rights</h3>
                    <ul className="list-disc list-inside text-purple-800 space-y-2 text-sm">
                      <li>VentureFlow IQ platform and software</li>
                      <li>Proprietary algorithms and methodologies</li>
                      <li>User interface design and branding</li>
                      <li>Documentation and training materials</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-purple-900 mb-3">Your Rights</h3>
                    <ul className="list-disc list-inside text-purple-800 space-y-2 text-sm">
                      <li>Data you upload remains your property</li>
                      <li>Analysis results generated for your use</li>
                      <li>Custom reports and configurations</li>
                      <li>Right to export your data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Service Disclaimer</h3>
                    <p className="text-gray-700 text-sm">
                      VentureFlow IQ is provided "as is" without warranties of any kind. We do not guarantee 
                      the accuracy, completeness, or reliability of any information provided through the service.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Limitation of Damages</h3>
                    <p className="text-gray-700 text-sm">
                      In no event shall VentureFlow IQ be liable for any indirect, incidental, special, 
                      consequential, or punitive damages arising from your use of the service.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Maximum Liability</h3>
                    <p className="text-gray-700 text-sm">
                      Our total liability to you for any claims related to the service shall not exceed 
                      the amount you paid for the service in the 12 months preceding the claim.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-900 mb-3">Billing</h3>
                    <ul className="list-disc list-inside text-indigo-800 space-y-2 text-sm">
                      <li>Subscription fees billed in advance</li>
                      <li>Automatic renewal unless cancelled</li>
                      <li>Price changes with 30 days notice</li>
                      <li>Taxes and fees as applicable</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-indigo-900 mb-3">Refunds</h3>
                    <ul className="list-disc list-inside text-indigo-800 space-y-2 text-sm">
                      <li>30-day money-back guarantee for new users</li>
                      <li>Pro-rated refunds for annual cancellations</li>
                      <li>No refunds for policy violations</li>
                      <li>Processing time: 5-10 business days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-800 mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of significant 
                  changes via email or through the platform.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Notification Process</h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                      <li>Email notification 30 days before changes</li>
                      <li>In-platform notification for minor updates</li>
                      <li>Updated terms posted on our website</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Your Options</h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                      <li>Continue using the service (acceptance)</li>
                      <li>Cancel your account before changes take effect</li>
                      <li>Contact us with questions or concerns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For questions about these Terms of Use or our service, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600"><strong>Email:</strong> legal@ventureflowiq.com</p>
                    <p className="text-gray-600"><strong>Support:</strong> support@ventureflowiq.com</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><strong>Address:</strong> VentureFlow IQ, India</p>
                    <p className="text-gray-600"><strong>Response Time:</strong> Within 48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500 text-center">
                By using VentureFlow IQ, you acknowledge that you have read, understood, and agree to be bound 
                by these Terms of Use. If you do not agree to these terms, please discontinue use of the service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
