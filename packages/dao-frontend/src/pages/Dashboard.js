import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>DAO Dashboard</h1>
        <p className="page-description">
          Welcome to the DAO Dashboard. Here you can view key metrics and participate in governance.
        </p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Your Information</h2>
            <p>Connect your wallet to view your information.</p>
          </div>
          
          <div className="dashboard-card">
            <h2>DAO Statistics</h2>
            <p>DAO statistics will be displayed here.</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Recent Proposals</h2>
            <p>Recent proposals will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 