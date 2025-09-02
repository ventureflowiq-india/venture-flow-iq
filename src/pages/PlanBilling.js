import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import Header from '../components/common/Header';
import { Check, X, Star, Zap, Crown, CreditCard, Download } from 'lucide-react';

const PlanBilling = () => {
  const { user } = useAuth();
  const userProfile = useUserProfile(user);
  const [loading, setLoading] = useState(false);
  const [billingHistory] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('FREEMIUM');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');

  // Pricing plans configuration
  const PRICING_PLANS = {
    FREEMIUM: {
      name: 'Free',
      price: 0,
      period: 'forever',
      icon: Star,
      color: 'gray',
      features: [
        'Basic company information',
        'Address & contact details',
        'Up to 5 company views per month',
        'Basic search functionality'
      ],
      limitations: [
        'Limited to 5 company views/month',
        'No export functionality',
        'No watchlist features'
      ]
    },
    PREMIUM: {
      name: 'Premium',
      price: 999,
      yearlyPrice: 9999,
      period: 'monthly',
      icon: Zap,
      color: 'blue',
      features: [
        'Everything in Free',
        'Key officials information',
        'Financial information & metrics',
        'Unlimited company views',
        'Export to JSON/CSV',
        'Watchlist functionality',
        'Advanced search filters',
        'Priority support'
      ]
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: 2999,
      yearlyPrice: 29999,
      period: 'monthly',
      icon: Crown,
      color: 'purple',
      features: [
        'Everything in Premium',
        'Funding & investment data',
        'Regulatory & legal information',
        'News & relationships',
        'Bulk operations',
        'API access',
        'Custom reports',
        'Dedicated account manager',
        'White-label options'
      ]
    }
  };

  useEffect(() => {
    if (userProfile) {
      setCurrentPlan(userProfile.role || 'FREEMIUM');
      setSubscriptionStatus(userProfile.subscription_status || 'active');
    }
  }, [userProfile]);

  const handleUpgrade = async (planName, billingPeriod = 'monthly') => {
    if (!user) {
      alert('Please log in to upgrade your plan');
      return;
    }

    setLoading(true);
    try {
      // Here you would integrate with Razorpay
      // For now, we'll show a placeholder
      alert(`Upgrading to ${planName} plan (${billingPeriod}) - Razorpay integration coming soon!`);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Error upgrading plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setLoading(true);
    try {
      // Here you would integrate with Razorpay to cancel subscription
      alert('Subscription cancellation - Razorpay integration coming soon!');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (planName) => {
    const colors = {
      FREEMIUM: 'border-gray-200 bg-gray-50',
      PREMIUM: 'border-blue-200 bg-blue-50',
      ENTERPRISE: 'border-purple-200 bg-purple-50'
    };
    return colors[planName] || colors.FREEMIUM;
  };

  const getButtonColor = (planName) => {
    const colors = {
      FREEMIUM: 'bg-gray-600 hover:bg-gray-700',
      PREMIUM: 'bg-blue-600 hover:bg-blue-700',
      ENTERPRISE: 'bg-purple-600 hover:bg-purple-700'
    };
    return colors[planName] || colors.FREEMIUM;
  };

  const isCurrentPlan = (planName) => currentPlan === planName;
  const isAdmin = currentPlan === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={() => window.location.href = '/login'}
        onLogout={() => window.location.href = '/'}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock powerful features and insights with our flexible pricing plans. 
            Start free and upgrade as you grow.
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Plan: {PRICING_PLANS[currentPlan]?.name || 'Free'}
                </h3>
                <p className="text-gray-600">
                  {isAdmin ? 'Administrator Access' : 
                   subscriptionStatus === 'active' ? 'Active Subscription' : 
                   'Inactive Subscription'}
                </p>
              </div>
              <div className="text-right">
                {userProfile?.subscription_expires_at && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(userProfile.subscription_expires_at).toLocaleDateString()}
                  </p>
                )}
                {currentPlan !== 'FREEMIUM' && currentPlan !== 'ADMIN' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(PRICING_PLANS).map(([planKey, plan]) => {
            const IconComponent = plan.icon;
            const isCurrent = isCurrentPlan(planKey);
                         // const isUpgradeable = !isAdmin && planKey !== 'FREEMIUM' && !isCurrent;
            
            return (
              <div
                key={planKey}
                className={`relative rounded-2xl border-2 p-8 transition-all duration-200 ${
                  isCurrent 
                    ? `${getPlanColor(planKey)} border-opacity-100 shadow-lg` 
                    : 'border-gray-200 bg-white hover:shadow-lg'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    plan.color === 'gray' ? 'bg-gray-100' :
                    plan.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      plan.color === 'gray' ? 'text-gray-600' :
                      plan.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.yearlyPrice && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ₹{(plan.price * 12) - plan.yearlyPrice} with yearly billing
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start">
                      <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : isAdmin ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                    >
                      Admin Access
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpgrade(planKey, 'monthly')}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${getButtonColor(planKey)}`}
                      >
                        {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
                      </button>
                      {plan.yearlyPrice && (
                        <button
                          onClick={() => handleUpgrade(planKey, 'yearly')}
                          disabled={loading}
                          className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Yearly (Save ₹{(plan.price * 12) - plan.yearlyPrice})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing History */}
        {user && currentPlan !== 'FREEMIUM' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </button>
            </div>
            
            <div className="space-y-4">
              {billingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No billing history available</p>
                  <p className="text-sm text-gray-400">Your payment history will appear here</p>
                </div>
              ) : (
                billingHistory.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{bill.plan_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{bill.amount}</p>
                      <p className="text-sm text-green-600 capitalize">{bill.payment_status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through Razorpay.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes, we offer a 14-day free trial for Premium and Enterprise plans. No credit card required.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanBilling;
