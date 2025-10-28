import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import SessionWarning from './components/SessionWarning';
import Layout from './components/Layout';
import Home from './Home';
import Login from './Login';

// Lazy load heavy components for better initial load performance
const Register = lazy(() => import('./Register'));
const Dashboard = lazy(() => import('./Dashboard'));
const Discussion = lazy(() => import('./Discussion'));
const Profile = lazy(() => import('./Profile'));

// Lazy load utility pages
const About = lazy(() => import('./About'));
const Settings = lazy(() => import('./Settings'));
const Notifications = lazy(() => import('./Notifications'));
const Search = lazy(() => import('./Search'));
const Leaderboard = lazy(() => import('./Leaderboard'));

// Lazy load philosophical concept pages
const Foundation = lazy(() => import('./Foundation'));
const Wisdom = lazy(() => import('./Wisdom'));
const Ideas = lazy(() => import('./Ideas'));
const Dialogue = lazy(() => import('./Dialogue'));
const Knowledge = lazy(() => import('./Knowledge'));
const Growth = lazy(() => import('./Growth'));
const Justice = lazy(() => import('./Justice'));
const Truth = lazy(() => import('./Truth'));
const Excellence = lazy(() => import('./Excellence'));

// Animated Routes wrapper component
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discussion/:id" element={<Discussion />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Utility Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Philosophical Concept Pages */}
          <Route path="/foundation" element={<Foundation />} />
          <Route path="/wisdom" element={<Wisdom />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/dialogue" element={<Dialogue />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/justice" element={<Justice />} />
          <Route path="/truth" element={<Truth />} />
          <Route path="/excellence" element={<Excellence />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <SessionWarning />
          <Suspense fallback={<Loading message="Loading the Agora..." />}>
            <AnimatedRoutes />
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
