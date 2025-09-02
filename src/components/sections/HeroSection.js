import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchAutocomplete from '../common/SearchAutocomplete';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Unlock Indian Company
            <span className="text-blue-600 block">Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get comprehensive financial data, investor insights, and risk analysis for Indian companies. 
            Make data-driven investment decisions with our AI-powered platform.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchAutocomplete 
              placeholder="Search for companies, CINs, or sectors..."
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="border border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Advanced Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;