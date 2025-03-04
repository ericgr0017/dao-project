import React from 'react';

// Memoize the footer to prevent unnecessary re-renders
const Footer = React.memo(() => {
  console.log('DEBUG-APP: Footer rendered');
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="copyright">
          &copy; {new Date().getFullYear()} DAO Project. All rights reserved.
        </div>
        <div className="footer-links">
          <a href="https://github.com/yourusername/dao-project" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="/docs" target="_blank" rel="noopener noreferrer">Documentation</a>
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
        </div>
      </div>
    </footer>
  );
});

export default Footer; 