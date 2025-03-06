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
              className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
              onClick={() => handleNavigation('/analytics')}
            >
              My Rewards
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/social' ? 'active' : ''}`}
              onClick={() => handleNavigation('/social')}
            >
              Social
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname.startsWith('/challenges') ? 'active' : ''}`}
              onClick={() => handleNavigation('/challenges')}
            >
              Challenges
            </button>
          </li>
          <li className="nav-item dropdown">
            <button 
              className={`nav-link ${location.pathname.startsWith('/solutions') ? 'active' : ''}`}
              onClick={() => handleNavigation('/solutions')}
            >
              Solutions
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/learning' ? 'active' : ''}`}
              onClick={() => handleNavigation('/learning')}
            >
              Learning
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/benefits' ? 'active' : ''}`}
              onClick={() => handleNavigation('/benefits')}
            >
              Benefits
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/membership' ? 'active' : ''}`}
              onClick={() => handleNavigation('/membership')}
            >
              Join DAO
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              onClick={() => handleNavigation('/about')}
            >
              About
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${location.pathname === '/resources' ? 'active' : ''}`}
              onClick={() => handleNavigation('/resources')}
            >
              Resources
            </button>
          </li>
        </ul>
        
        <WalletConnect />
      </div>
    </nav>
  );
};

export default Navigation; 