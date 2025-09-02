import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  Building2, 
  Target, 
  Users, 
  Award, 
  Globe, 
  Lightbulb,
  Shield,
  CheckCircle,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';

const About = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const teamMembers = [
    {
      name: 'Dr. Priya Sharma',
      role: 'CEO & Co-Founder',
      bio: 'Former McKinsey consultant with 15+ years in market intelligence. PhD in Economics from IIM Ahmedabad.',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=2563eb&color=ffffff&size=128',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Rajesh Kumar',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Google engineer with expertise in AI/ML and big data. Built scalable systems for Fortune 500 companies.',
      avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=10b981&color=ffffff&size=128',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Anjali Patel',
      role: 'Head of Product',
      bio: 'Product leader with experience at Amazon and Flipkart. Passionate about user experience and data-driven decisions.',
      avatar: 'https://ui-avatars.com/api/?name=Anjali+Patel&background=8b5cf6&color=ffffff&size=128',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Vikram Singh',
      role: 'Head of Sales',
      bio: 'Sales veteran with 12+ years in B2B SaaS. Previously led sales teams at Salesforce and HubSpot.',
      avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=f59e0b&color=ffffff&size=128',
      linkedin: '#',
      twitter: '#'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Data-Driven Excellence',
      description: 'We believe in making decisions based on solid data and evidence, not just intuition.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data security is our top priority. We maintain the highest standards of data protection.'
    },
    {
      icon: Users,
      title: 'Customer Success',
      description: 'We measure our success by the success of our customers and their ability to make better decisions.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge solutions that give our customers a competitive edge.'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'We bring global best practices while understanding local market nuances and requirements.'
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'We maintain the highest quality standards in everything we do, from data accuracy to customer support.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'VentureFlow IQ was founded with a vision to democratize market intelligence.'
    },
    {
      year: '2021',
      title: 'First Product Launch',
      description: 'Launched our core company analysis platform with 100+ beta customers.'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $5M in Series A funding to accelerate product development and market expansion.'
    },
    {
      year: '2023',
      title: 'Market Expansion',
      description: 'Expanded to serve 500+ customers across India, Southeast Asia, and Europe.'
    },
    {
      year: '2024',
      title: 'AI-Powered Features',
      description: 'Launched advanced AI-powered insights and predictive analytics capabilities.'
    }
  ];

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
              About
              <span className="block text-yellow-300">VentureFlow IQ</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              We're on a mission to democratize market intelligence and empower businesses 
              with the insights they need to succeed in today's competitive landscape.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/solutions')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Our Solutions
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission & Vision
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="h-6 w-6 text-blue-600 mr-3" />
                    Mission
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    To democratize access to high-quality market intelligence, enabling businesses 
                    of all sizes to make informed decisions, identify opportunities, and navigate 
                    complex market dynamics with confidence.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="h-6 w-6 text-yellow-500 mr-3" />
                    Vision
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become the world's most trusted platform for market intelligence, 
                    empowering millions of businesses with AI-driven insights that drive 
                    growth and innovation across industries.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="text-center">
                  <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Why VentureFlow IQ?
                  </h3>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Comprehensive data coverage across Indian markets</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">AI-powered insights and predictive analytics</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Real-time updates and monitoring</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Enterprise-grade security and compliance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a simple idea to a powerful platform that's transforming how businesses 
              access and use market intelligence.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                VentureFlow IQ was born out of frustration. Our founders, working in consulting 
                and investment banking, constantly struggled with fragmented, outdated, and 
                expensive market intelligence tools. They realized that while large corporations 
                had access to premium data, smaller businesses were left in the dark.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                In 2020, we set out to change this. We built a platform that combines 
                comprehensive data collection, advanced AI algorithms, and intuitive user 
                experience to deliver actionable insights at a fraction of the cost of 
                traditional solutions.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, we serve hundreds of businesses across India and beyond, helping them 
                make better decisions, identify opportunities, and stay ahead of the competition. 
                Our journey is just beginning, and we're excited to continue democratizing 
                access to market intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind VentureFlow IQ who are dedicated to 
              transforming market intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="h-24 w-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  {member.bio}
                </p>
                                 <div className="flex justify-center space-x-3">
                   <button className="text-gray-400 hover:text-blue-600 transition-colors">
                     <Linkedin className="h-5 w-5" />
                   </button>
                   <button className="text-gray-400 hover:text-blue-400 transition-colors">
                     <Twitter className="h-5 w-5" />
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones that mark our growth and evolution as a company.
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-blue-200 h-full"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The measurable results of our mission to democratize market intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Active Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50M+</div>
              <div className="text-blue-100">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're looking to explore our solutions, join our team, or just 
            learn more about what we do, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/solutions')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Explore Solutions
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
