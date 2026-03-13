import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);
  
  console.log('Current path:', location.pathname);
  console.log('Hide navbar?', hideNavbar);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="container my-4">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default Layout;