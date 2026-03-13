import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // Correct path from pages folder to assets

function Home() {
  return (
    <div className="min-vh-100" style={{ 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image with Blur */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("/images/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(8px)', // Adjust blur amount here (8px)
        transform: 'scale(1.1)', // Slightly scale to hide edges
        zIndex: 0
      }}></div>
      
      {/* Dark overlay (semi-transparent) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1
      }}></div>

      {/* Main Content */}
      <div className="d-flex flex-column min-vh-100 position-relative" style={{ zIndex: 2 }}>
        
        {/* Top Spacer */}
        <div className="flex-grow-1"></div>
        
        {/* Logo and Title */}
        <div className="text-center px-4">
          {/* App Icon */}
          <div className="mb-4 d-flex justify-content-center">
            <div style={{
              width: '120px',
              height: '120px',
              background: 'white',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              animation: 'bounceIn 0.8s ease-out',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) rotate(5deg)';
              e.currentTarget.style.boxShadow = '0 30px 50px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
            }}>
              <img 
                src={logo} 
                alt="CampusCare Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
          
          {/* Rest of your code... */}
          <h1 className="display-1 fw-bold mb-3" style={{ 
            color: 'white',
            letterSpacing: '-1px',
            textShadow: '0 10px 20px rgba(0,0,0,0.3)',
            animation: 'slideDown 0.6s ease-out'
          }}>
            CampusCare
          </h1>
          
          <p className="mb-5" style={{ 
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.2rem',
            fontWeight: '400',
            letterSpacing: '0.5px',
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Your campus community, connected and cared for
          </p>
          
          <div className="d-grid gap-4 mx-auto" style={{ maxWidth: '340px' }}>
            <Link 
              to="/register" 
              className="btn btn-lg py-3 rounded-pill"
              style={{ 
                background: 'white',
                color: '#0066ff',
                fontWeight: '700',
                border: 'none',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                animation: 'fadeInUp 0.8s ease-out 0.3s both'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 25px 40px rgba(0,0,0,0.4)';
                e.target.style.background = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                e.target.style.background = 'white';
              }}
            >
              <i className="bi bi-person-plus-fill" style={{ fontSize: '1.2rem' }}></i>
              Create Account
            </Link>
            
            <Link 
              to="/login" 
              className="btn btn-lg py-3 rounded-pill"
              style={{ 
                background: 'white',
                color: '#0066ff',
                fontWeight: '700',
                border: 'none',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                animation: 'fadeInUp 0.8s ease-out 0.3s both'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 25px 40px rgba(0,0,0,0.4)';
                e.target.style.background = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                e.target.style.background = 'white';
              }}
            >
              <i className="bi bi-box-arrow-in-right"></i>
              Login
            </Link>
          </div>

          <p className="mt-5" style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            animation: 'fadeIn 1s ease-out 0.6s both',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            <i className="bi bi-shield-check me-2"></i>
            Safe • Secure • Connected
          </p>
        </div>
        
        <div className="flex-grow-1"></div>
        
      </div>

      <style>
        {`
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Home;