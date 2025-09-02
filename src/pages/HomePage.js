import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSection from '../components/sections/HeroSection';
import ValueProposition from '../components/sections/ValueProposition';
import CompanySnapshot from '../components/sections/CompanySnapshot';
import PricingPreview from '../components/sections/PricingPreview';
import CTASection from '../components/sections/CTASection';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    // This will be handled by the auth context
    // For now, just redirect to home
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main>
        <HeroSection />
        <ValueProposition />
        <CompanySnapshot />
        <PricingPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;