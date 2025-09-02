import React from 'react';
import { Search, BarChart3, FileText, Shield } from 'lucide-react';

const ValueProposition = () => {
  const features = [
    {
      icon: Search,
      title: "Deep Company Insights",
      description: "Balance sheets, funding, officials, and risk factors all in one place.",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: BarChart3,
      title: "Financial Data in One Place",
      description: "Revenue, profit, assets, liabilities, and financial ratios analyzed.",
      color: "text-green-600", 
      bgColor: "bg-green-100"
    },
    {
      icon: FileText,
      title: "Investor-Ready Reports",
      description: "AI-generated charts and summaries for professional presentations.",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Shield,
      title: "Secure Tiered Access",
      description: "Freemium, Premium, and Enterprise plans to suit every need.",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose VentureFlow IQ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to research, analyze, and make informed decisions about Indian companies
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow group">
                <div className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;