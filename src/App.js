import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CompanyUpload from './pages/CompanyUpload';
import CompanyDetails from './pages/CompanyDetails';
import Profile from './pages/Profile';
import Solutions from './pages/Solutions';
import Contact from './pages/Contact';
import About from './pages/About';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import ActivityPage from './pages/ActivityPage';
import EditCompanyPage from './pages/EditCompanyPage';
import PlanBilling from './pages/PlanBilling';
import MarketAnalysis from './pages/MarketAnalysis';
import CompanyComparison from './pages/CompanyComparison';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/company/edit/:companyId" element={<EditCompanyPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company/upload" 
        element={
          <ProtectedRoute>
            <CompanyUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company/:companyId" 
        element={
          <ProtectedRoute>
            <CompanyDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/plan-billing" 
        element={
          <ProtectedRoute>
            <PlanBilling />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/market-analysis" 
        element={
          <ProtectedRoute>
            <MarketAnalysis />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company-comparison" 
        element={
          <ProtectedRoute>
            <CompanyComparison />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;