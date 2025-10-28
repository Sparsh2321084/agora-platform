import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedNavbar from './UnifiedNavbar';

/**
 * Layout Component - Conditionally renders navigation
 * Excludes navbar from Login and Register pages for clean authentication flow
 */
function Layout({ children }) {
  const location = useLocation();
  
  // Pages that should NOT have the navbar
  const noNavbarPages = ['/login', '/register'];
  const shouldShowNavbar = !noNavbarPages.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <UnifiedNavbar />}
      {children}
    </>
  );
}

export default Layout;
