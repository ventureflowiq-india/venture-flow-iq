import React from 'react';
import { CheckCircle, Star } from 'lucide-react';

const PricingPreview = () => {
  const plans = [
    {
      name: "Freemium",
      description: "Perfect for getting started",
      price: "Free",
      features: [
        "Basic company information",
        "Limited search results",
        "Public financial data",
        "Basic export options"
      ],
      buttonText: "Get Started",
      buttonStyle: "border border-blue-600 text-blue-600 hover:bg-blue-50",
      popular: false
    },
    {
      name: "Premium",
      description: "For serious investors",
      price: "₹2,999",
      period: "/month",
      features: [
        "Full financial statements",
        "Competitor analysis",
        "Advanced filters & search",
        "Export capabilities",
        "Email alerts",
        "Priority support"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-white text-blue-600 hover:bg-gray-50",
      popular: true,
      bgColor: "bg-blue-600 text-white"
    },
    {
      name: "Enterprise",
      description: "For teams and organizations", 
      price: "Custom",
      features: [
        "API access",
        "Team dashboard",
        "White-label reports",
        "Priority support",
        "Custom integrations",
        "Dedicated account manager"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Flexible pricing to match your research needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-xl shadow-lg overflow-visible relative h-full flex flex-col ${
                plan.popular 
                  ? 'transform md:scale-105 z-10 mt-4' 
                  : 'bg-white'
              } ${plan.bgColor || 'bg-white'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8 flex flex-col h-full">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className={`h-4 w-4 mr-2 ${
                        plan.popular ? 'text-green-300' : 'text-green-500'
                      }`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-lg font-semibold transition-colors mt-auto ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include 14-day free trial • No credit card required
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View Detailed Pricing →
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;