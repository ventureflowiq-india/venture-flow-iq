import React from 'react';
import { Building2, ArrowRight, TrendingUp, Users, Calendar } from 'lucide-react';

const CompanySnapshot = () => {
  const demoCompany = {
    name: "TechCorp India Ltd",
    cin: "L72200DL2010PLC123456",
    sector: "FinTech",
    revenue: "₹250 Cr",
    netProfit: "₹25 Cr",
    employees: "1,200+",
    founded: "2010",
    growth: "+23%"
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See Our Platform in Action
          </h2>
          <p className="text-xl text-gray-600">
            Live preview of company insights and financial data
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Company Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{demoCompany.name}</h3>
                  <p className="text-blue-100">CIN: {demoCompany.cin}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="flex items-center text-green-300">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    <span className="font-semibold">{demoCompany.growth} YoY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Metrics */}
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-blue-50 p-4 rounded-lg mb-2">
                    <p className="text-sm text-gray-600 mb-1">Sector</p>
                    <p className="text-lg font-semibold text-blue-600">{demoCompany.sector}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 p-4 rounded-lg mb-2">
                    <p className="text-sm text-gray-600 mb-1">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">{demoCompany.revenue}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-50 p-4 rounded-lg mb-2">
                    <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                    <p className="text-lg font-semibold text-purple-600">{demoCompany.netProfit}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-orange-50 p-4 rounded-lg mb-2">
                    <p className="text-sm text-gray-600 mb-1">Employees</p>
                    <p className="text-lg font-semibold text-orange-600">{demoCompany.employees}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Founded in {demoCompany.founded}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Mid-size company</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center transition-colors">
                    View Full Profile
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanySnapshot;