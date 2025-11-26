import './styles/globals.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { logger } from './utils/logger';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAutoInitTestUser } from './hooks/useAutoInitTestUser';
import { MainLayout } from './components/MainLayout';
import { MarketEnvironment } from './components/MarketEnvironment';
import { AIMarketAnalysisView } from './components/AIMarketAnalysisView';
import { TradeIdeas } from './components/TradeIdeas';
import { TradeLessons } from './components/TradeLessons';
import { MarketNews } from './components/MarketNews';
import { Calendar } from './components/Calendar';
import { Screener } from './components/Screener';
import { MyTradingDashboard } from './components/MyTradingDashboard';
import { SocialTradingHub } from './components/SocialTradingHub';
import { TraderLeaderboard } from './components/TraderLeaderboard';
import { PerformanceStats } from './components/PerformanceStats';
import { MarketingAutomation } from './components/MarketingAutomation';
import { ReferralProgram } from './components/ReferralProgram';
import { AffiliateProgram } from './components/AffiliateProgram';
import { TierRequirements } from './components/TierRequirements';
import { SocialFeed } from './components/SocialFeed';
import { TraderProfile } from './components/TraderProfile';
import { Notifications } from './components/Notifications';
import { Bookmarks } from './components/Bookmarks';
import { PostAnalytics } from './components/PostAnalytics';
import { MarketIntelligence } from './components/MarketIntelligence';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminPortalLogin } from './components/AdminPortalLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { SchemaDeployment } from './components/SchemaDeployment';
import { AIGenerationPanel } from './components/AIGenerationPanel';
import { DebugKVView } from './components/DebugKVView';
import { BackendTest } from './components/BackendTest';
import { AcademyDashboard } from './components/AcademyDashboard';
import { LearningRoadmap } from './components/LearningRoadmap';
import { CopyTradingHub } from './components/CopyTradingHub';
import { AutoBriefScheduler } from './components/AutoBriefScheduler';
import { TrialBanner } from './components/TrialBanner';
import { Footer } from './components/Footer';
import { TradingViewChart } from './components/TradingViewChart';
import { AuthPage } from './components/AuthPage';
import { ChartWithBacktest } from './components/charts/ChartWithBacktest';
import { TradingRulesTest } from './components/TradingRulesTest';
import { quickTestTradingRules } from './utils/testTradingRulesQuick';

// Show startup banner
logger.showStartupBanner();

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Auto-initialize test user on app load
  useAutoInitTestUser();
  
  const [currentPage, setCurrentPage] = useState<string>('market');
  const [dashboardTab, setDashboardTab] = useState<string>('watchlist');
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(null);
  const [adminPortalAuth, setAdminPortalAuth] = useState<boolean>(() => {
    return !!localStorage.getItem('septAdminPortalAuth');
  });

  // Expose navigation to window for debugging
  React.useEffect(() => {
    (window as any).testTradingRules = () => {
      setCurrentPage('test-trading-rules');
      console.log('🧪 Navigating to Trading Rules Test...');
    };
    
    // Also expose quick test function
    (window as any).quickTest = quickTestTradingRules;
    
    console.log('══════════════════════════════════════════════════════════════');
    console.log('🧪 TRADING RULES TEST - Quick Access');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Two ways to test how many stocks meet SEPT trading rules:');
    console.log('');
    console.log('1. Quick Console View:');
    console.log('   quickTest()         // Shows results in console');
    console.log('');
    console.log('2. Full Dashboard View:');
    console.log('   testTradingRules()  // Opens interactive dashboard');
    console.log('');
    console.log('The analysis will show:');
    console.log('  • Data quality metrics (price, volume, ATR, history)');
    console.log('  • Premium Tier: Breakout + pullback + psychological levels');
    console.log('  • Standard Tier: Volume >1M + ATR requirements + no large move');
    console.log('  • Excluded Tier: Stocks that failed rules with reasons');
    console.log('═══════════════════════════════════════════════════════════════');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1d29] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-portal') {
    if (!adminPortalAuth) {
      return <AdminPortalLogin onLoginSuccess={() => setAdminPortalAuth(true)} />;
    }
    return <AdminDashboard onLogout={() => {
      setAdminPortalAuth(false);
      setCurrentPage('market');
    }} />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleNavigate = (page: string) => {
    const [pageName, tabName] = page.split(':');
    setCurrentPage(pageName);
    if (pageName === 'dashboard' && tabName) {
      setDashboardTab(tabName);
    } else if (pageName === 'dashboard' && !tabName) {
      setDashboardTab('watchlist');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPage === 'copytrading') {
    return <CopyTradingHub onNavigateHome={() => setCurrentPage('market')} />;
  }
  
  if (currentPage === 'advanced-chart') {
    return <ChartWithBacktest />;
  }

  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      <AutoBriefScheduler />
      <TrialBanner />
      {currentPage === 'market' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MarketEnvironment onNavigate={handleNavigate} />
        </div>
      )}
      {currentPage === 'ideas' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TradeIdeas onSelectStock={(symbol) => setSelectedChartSymbol(symbol)} />
        </div>
      )}
      <Footer />
      <Dialog open={!!selectedChartSymbol} onOpenChange={() => setSelectedChartSymbol(null)}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedChartSymbol} Chart
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            {selectedChartSymbol && (
              <TradingViewChart 
                symbol={`NASDAQ:${selectedChartSymbol}`}
                height={600}
                autosize={false}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}