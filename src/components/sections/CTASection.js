import React from 'react';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield } from 'lucide-react';

const CTASection = () => {
  const benefits = [
    {
      icon: Users,
      title: "500+ Active Users",
      description: "Join a growing community of professionals"
    },
    {
      icon: TrendingUp,
      title: "95% Success Rate",
      description: "Proven track record of delivering insights"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security for your data"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <span className="block text-yellow-300">Business Intelligence?</span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8">
            Join thousands of professionals who trust VentureFlow IQ for their market intelligence, 
            competitive analysis, and investment research needs.
          </p>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-blue-100 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center min-w-[200px]">
            Start Free Trial
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center min-w-[200px]">
            Schedule Demo
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-blue-100">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-blue-100">14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-blue-100">Cancel anytime</span>
            </div>
          </div>
          
          <p className="text-blue-100 text-sm">
            Trusted by leading companies across India and Southeast Asia
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
