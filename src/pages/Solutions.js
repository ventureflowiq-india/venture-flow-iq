import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  Search, 
  TrendingUp, 
  Building2, 
  Users, 
  BarChart3, 
  Target, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Database
} from 'lucide-react';

const Solutions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  const [activeTab, setActiveTab] = useState('market-research');

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const solutions = {
    'market-research': {
      title: 'Market Research & Intelligence',
      subtitle: 'Comprehensive market analysis and competitive intelligence',
      description: 'Get deep insights into market trends, competitor analysis, and industry dynamics to make informed business decisions.',
      features: [
        'Real-time market data and trends',
        'Competitor analysis and benchmarking',
        'Industry reports and insights',
        'Market size and growth projections',
        'Customer behavior analysis',
        'Regulatory environment monitoring'
      ],
      icon: Search,
      color: 'blue'
    },
    'company-analysis': {
      title: 'Company Analysis & Profiling',
      subtitle: 'Detailed company insights and financial analysis',
      description: 'Access comprehensive company profiles with financial data, key personnel, ownership structure, and business relationships.',
      features: [
        'Financial statements and ratios',
        'Key personnel and board members',
        'Ownership structure analysis',
        'Business relationships mapping',
        'Legal and regulatory compliance',
        'News and media monitoring'
      ],
      icon: Building2,
      color: 'green'
    },
    'competitive-intelligence': {
      title: 'Competitive Intelligence',
      subtitle: 'Stay ahead with strategic competitive insights',
      description: 'Monitor competitors, track their moves, and identify opportunities to gain competitive advantage in your market.',
      features: [
        'Competitor tracking and monitoring',
        'Strategic move analysis',
        'Market positioning insights',
        'Competitive benchmarking',
        'Threat and opportunity identification',
        'SWOT analysis framework'
      ],
      icon: Target,
      color: 'purple'
    },
    'investment-research': {
      title: 'Investment Research',
      subtitle: 'Data-driven investment decision support',
      description: 'Make informed investment decisions with comprehensive financial analysis, risk assessment, and market opportunity evaluation.',
      features: [
        'Financial performance analysis',
        'Risk assessment and scoring',
        'Valuation models and metrics',
        'Investment opportunity screening',
        'Portfolio optimization insights',
        'Market timing indicators'
      ],
      icon: TrendingUp,
      color: 'orange'
    }
  };

  const useCases = [
    {
      title: 'Venture Capital & Private Equity',
      description: 'Evaluate investment opportunities, conduct due diligence, and monitor portfolio companies with comprehensive data and insights.',
      icon: TrendingUp,
      benefits: ['Due diligence support', 'Portfolio monitoring', 'Market opportunity identification', 'Risk assessment']
    },
    {
      title: 'Corporate Strategy',
      description: 'Develop strategic initiatives, assess market entry opportunities, and optimize business operations with data-driven insights.',
      icon: Target,
      benefits: ['Market entry analysis', 'Strategic planning', 'Operational optimization', 'Risk management']
    },
    {
      title: 'Investment Banking',
      description: 'Support M&A transactions, IPOs, and capital raising activities with comprehensive financial and market analysis.',
      icon: Building2,
      benefits: ['M&A support', 'IPO preparation', 'Capital raising', 'Valuation analysis']
    },
    {
      title: 'Consulting & Advisory',
      description: 'Provide clients with data-driven insights and recommendations for business growth and market expansion.',
      icon: Users,
      benefits: ['Client advisory', 'Market insights', 'Growth strategies', 'Performance optimization']
    }
  ];

  const pricingPlans = [
    {
      name: 'Freemium',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for individual researchers and small teams',
      features: [
        '5 company profiles per month',
        'Basic market data',
        'Standard search functionality',
        'Email support'
      ],
      limitations: ['Limited API access', 'Basic reports only'],
      buttonText: 'Get Started Free',
      popular: false
    },
         {
       name: 'Professional',
       price: '₹2,999',
       period: 'per month',
       description: 'Ideal for growing businesses and research teams',
      features: [
        'Unlimited company profiles',
        'Advanced market analytics',
        'API access (1,000 calls/month)',
        'Priority support',
        'Custom reports',
        'Data export functionality'
      ],
      limitations: [],
      buttonText: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Tailored solutions for large organizations',
      features: [
        'Everything in Professional',
        'Unlimited API access',
        'Custom integrations',
        'Dedicated account manager',
        'White-label solutions',
        'Advanced analytics dashboard',
        'Custom data feeds'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Solutions for Every
              <span className="block text-yellow-300">Business Need</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Comprehensive market intelligence, company analysis, and competitive insights 
              to drive your business decisions and investment strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/company/upload')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Core Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the solution that best fits your business needs and start 
            making data-driven decisions today.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {Object.keys(solutions).map((key) => {
            const solution = solutions[key];
            const IconComponent = solution.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <IconComponent className={`h-5 w-5 mr-2 ${activeTab === key ? 'text-white' : getIconColor(solution.color)}`} />
                {solution.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

                 {/* Active Solution Content */}
         <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div>
               {(() => {
                 const IconComponent = solutions[activeTab].icon;
                 return (
                   <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getColorClasses(solutions[activeTab].color)} mb-6`}>
                     <IconComponent className="h-4 w-4 mr-2" />
                     {solutions[activeTab].subtitle}
                   </div>
                 );
               })()}
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {solutions[activeTab].title}
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                {solutions[activeTab].description}
              </p>
              
              <div className="space-y-4">
                {solutions[activeTab].features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/company/upload')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Market Trends</h4>
                    <p className="text-sm text-gray-600">Real-time insights</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Building2 className="h-8 w-8 text-green-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Company Data</h4>
                    <p className="text-sm text-gray-600">Comprehensive profiles</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Target className="h-8 w-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Competitive Intel</h4>
                    <p className="text-sm text-gray-600">Strategic insights</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Investment Data</h4>
                    <p className="text-sm text-gray-600">Financial analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who Uses VentureFlow IQ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform serves professionals across various industries, 
              providing the insights they need to succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {useCase.description}
                  </p>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the tools and capabilities that make VentureFlow IQ 
              the preferred choice for market intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Comprehensive Database
              </h3>
              <p className="text-gray-600">
                Access millions of company profiles with detailed financial, 
                operational, and market data.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600">
                Get the latest information with real-time data updates and 
                automated monitoring systems.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600">
                Powerful analytical tools and customizable dashboards for 
                deep data insights.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Enterprise Security
              </h3>
              <p className="text-gray-600">
                Bank-level security with role-based access control and 
                comprehensive audit trails.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Global Coverage
              </h3>
              <p className="text-gray-600">
                Comprehensive coverage of companies across multiple 
                countries and markets worldwide.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600">
                Machine learning algorithms that identify patterns and 
                provide predictive insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our free plan and scale up as your needs grow. 
              All plans include our core features and excellent support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 h-full flex flex-col ${
                  plan.popular 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period !== 'forever' && (
                      <span className="text-gray-600 ml-1">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0">•</div>
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => plan.name === 'Enterprise' ? navigate('/contact') : navigate('/signup')}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mt-auto ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust VentureFlow IQ for 
            their market intelligence and business insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/company/upload')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Solutions;
