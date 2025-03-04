import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import useReputation from '../hooks/useReputation';

const ReputationDisplay = ({ address }) => {
  const { address: connectedAddress } = useWeb3();
  const { getReputation, getTotalReputation, isLoading, error } = useReputation();
  const [reputation, setReputation] = useState('0');
  const [percentage, setPercentage] = useState(0);

  const userAddress = address || connectedAddress;

  useEffect(() => {
    const fetchReputation = async () => {
      if (userAddress) {
        const userRep = await getReputation(userAddress);
        const totalRep = await getTotalReputation();
        
        setReputation(userRep);
        
        // Calculate percentage of total reputation
        if (totalRep && totalRep !== '0') {
          const percent = (Number(userRep) / Number(totalRep)) * 100;
          setPercentage(parseFloat(percent.toFixed(2)));
        } else {
          setPercentage(0);
        }
      }
    };

    fetchReputation();
    
    // Set up an interval to refresh reputation data
    const interval = setInterval(fetchReputation, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [userAddress, getReputation, getTotalReputation]);

  if (isLoading) {
    return <div className="reputation-display loading">Loading reputation data...</div>;
  }

  if (error) {
    return (
      <div className="reputation-display error">
        <h3>Reputation</h3>
        <div className="error-message">
          <p>{error}</p>
          <p className="note">Note: This is a development environment. In production, this would connect to real contracts.</p>
        </div>
        <div className="reputation-stats">
          <div className="reputation-value">
            <span className="label">Points:</span>
            <span className="value">0</span>
          </div>
          <div className="reputation-percentage">
            <span className="label">Percentage:</span>
            <span className="value">0%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reputation-display">
      <h3>Reputation</h3>
      <div className="reputation-stats">
        <div className="reputation-value">
          <span className="label">Points:</span>
          <span className="value">{reputation}</span>
        </div>
        <div className="reputation-percentage">
          <span className="label">Percentage:</span>
          <span className="value">{percentage}%</span>
        </div>
        <div className="reputation-bar">
          <div 
            className="reputation-progress" 
            style={{ width: `${percentage}%` }}
            title={`${percentage}% of total reputation`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ReputationDisplay; 