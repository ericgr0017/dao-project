import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import useTreasury from '../hooks/useTreasury';

const TreasuryDisplay = () => {
  const { address } = useWeb3();
  const { 
    getTreasuryBalance, 
    getGovernanceTokenBalance, 
    getTreasuryParameters,
    isLoading, 
    error 
  } = useTreasury();
  
  const [treasuryBalance, setTreasuryBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [parameters, setParameters] = useState({
    transactionFeePercent: 0,
    burnPercent: 0,
    reservePercent: 0,
    totalRevenue: '0'
  });
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    const fetchTreasuryData = async () => {
      // Only proceed if the component is still mounted
      if (!isMounted.current) return;
      
      try {
        const ethBalance = await getTreasuryBalance();
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        const govTokenBalance = await getGovernanceTokenBalance();
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        const params = await getTreasuryParameters();
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        setTreasuryBalance(ethBalance || '0');
        setTokenBalance(govTokenBalance || '0');
        
        if (params) {
          setParameters({
            transactionFeePercent: params.transactionFeePercent || 0,
            burnPercent: params.burnPercent || 0,
            reservePercent: params.reservePercent || 0,
            totalRevenue: params.totalRevenue || '0'
          });
        }
      } catch (err) {
        // Only log errors if component is still mounted
        if (isMounted.current) {
          console.error('Error fetching treasury data:', err);
        }
      }
    };
    
    // Fetch data immediately
    fetchTreasuryData();
    
    // Set up an interval to refresh data
    const interval = setInterval(fetchTreasuryData, 30000); // Every 30 seconds
    
    // Cleanup function
    return () => {
      // Set isMounted to false when the component unmounts
      isMounted.current = false;
      // Clear the interval
      clearInterval(interval);
    };
  }, [getTreasuryBalance, getGovernanceTokenBalance, getTreasuryParameters]);
  
  const formatEthAmount = (amount) => {
    if (!amount) return '0.00';
    // Convert from wei to ETH
    return (Number(amount) / 1e18).toFixed(4);
  };
  
  const formatTokenAmount = (amount) => {
    if (!amount) return '0';
    // Convert from wei to token units (assuming 18 decimals)
    return (Number(amount) / 1e18).toFixed(4);
  };
  
  const formatPercentage = (basisPoints) => {
    if (basisPoints === undefined || basisPoints === null) return '0.00';
    // Convert basis points to percentage (1 basis point = 0.01%)
    return (Number(basisPoints) / 100).toFixed(2);
  };
  
  if (isLoading) {
    return <div className="treasury-display loading">Loading treasury data...</div>;
  }
  
  if (error) {
    return (
      <div className="treasury-display error">
        <h3>Treasury</h3>
        <div className="error-message">
          <p>{error}</p>
          <p className="note">Note: This is a development environment. In production, this would connect to real contracts.</p>
        </div>
        <div className="treasury-stats">
          <div className="treasury-stat">
            <span className="label">ETH Balance:</span>
            <span className="value">0 ETH</span>
          </div>
          <div className="treasury-stat">
            <span className="label">Token Balance:</span>
            <span className="value">0 GOV</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="treasury-display">
      <h3>Treasury</h3>
      
      <div className="treasury-stats">
        <div className="treasury-stat">
          <span className="label">ETH Balance:</span>
          <span className="value">{formatEthAmount(treasuryBalance)} ETH</span>
        </div>
        
        <div className="treasury-stat">
          <span className="label">Token Balance:</span>
          <span className="value">{formatTokenAmount(tokenBalance)} GOV</span>
        </div>
        
        <div className="treasury-stat">
          <span className="label">Transaction Fee:</span>
          <span className="value">{formatPercentage(parameters.transactionFeePercent)}%</span>
        </div>
        
        <div className="treasury-stat">
          <span className="label">Burn Rate:</span>
          <span className="value">{formatPercentage(parameters.burnPercent)}%</span>
        </div>
        
        <div className="treasury-stat">
          <span className="label">Reserve Rate:</span>
          <span className="value">{formatPercentage(parameters.reservePercent)}%</span>
        </div>
        
        <div className="treasury-stat">
          <span className="label">Total Revenue:</span>
          <span className="value">{formatEthAmount(parameters.totalRevenue)} ETH</span>
        </div>
      </div>
      
      {address && (
        <div className="treasury-actions">
          <button className="treasury-action-button allocate-funds">Allocate Funds</button>
          <button className="treasury-action-button allocate-tokens">Allocate Tokens</button>
          <button className="treasury-action-button process-crowdfunding">Process Crowdfunding</button>
        </div>
      )}
    </div>
  );
};

export default TreasuryDisplay; 