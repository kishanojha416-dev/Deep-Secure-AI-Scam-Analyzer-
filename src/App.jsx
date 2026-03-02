import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Disclaimer from './components/Disclaimer';
import Features from './components/Features';
import Footer from './components/Footer';
import HowItWorks from './components/HowItWorks';
import FeedbackPage from './pages/FeedbackPage';
import { initAnalytics, trackPageView } from './services/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-slate-50 text-dark transition-colors duration-300">
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <Hero />
                <Disclaimer />
                <HowItWorks />
                <Features />
              </>
            )}
          />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
