import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';

/**
 * Navigation component for the application
 * Handles navigation between different routes
 */
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Handle navigation
  const handleNavigation = (path) => {
    // Don't navigate if we're already on this path
    if (location.pathname === path) {
      return;
    }
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
    // Navigate to the path
    navigate(path);
  };
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => handleNavigation('/')}>
          <span className="logo-text">Humanity DAO</span>
        </div>
        
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              Home
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('/dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/governance' ? 'active' : ''}`}
              onClick={() => handleNavigation('/governance')}
            >
              Governance
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/proposals' ? 'active' : ''}`}
              onClick={() => handleNavigation('/proposals')}
            >
              Proposals
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/treasury' ? 'active' : ''}`}
              onClick={() => handleNavigation('/treasury')}
            >
              Treasury
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/reputation' ? 'active' : ''}`}
              onClick={() => handleNavigation('/reputation')}
            >
              Reputation
            </button>
          </li>
        </ul>
        
        <WalletConnect />
      </div>
    </nav>
  );
};

export default Navigation; 