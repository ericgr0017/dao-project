import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import useGovernance from '../hooks/useGovernance';

const TokenInfo = () => {
  const { address, tokenBalance, stakedBalance } = useWeb3();
  const { getTokenInfo, calculatePendingRewards, isLoading, error } = useGovernance();
  
  const [tokenInfo, setTokenInfo] = useState({
    name: 'Governance Token',
    symbol: 'GOV',
    totalSupply: '0',
    rewardRate: '0'
  });
  const [pendingRewards, setPendingRewards] = useState('0');
  
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const info = await getTokenInfo();
        if (info) {
          setTokenInfo(info);
        }
      } catch (err) {
        console.error("Error fetching token info:", err);
      }
    };
    
    const fetchPendingRewards = async () => {
      if (address) {
        try {
          const rewards = await calculatePendingRewards();
          if (rewards) {
            setPendingRewards(rewards);
          }
        } catch (err) {
          console.error("Error calculating pending rewards:", err);
        }
      }
    };
    
    fetchTokenInfo();
    fetchPendingRewards();
    
    // Set up an interval to refresh data
    const interval = setInterval(() => {
      fetchTokenInfo();
      fetchPendingRewards();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [address, getTokenInfo, calculatePendingRewards]);
  
  const formatTokenAmount = (amount) => {
    if (!amount) return '0';
    // Convert from wei to token units (assuming 18 decimals)
    return (Number(amount) / 1e18).toFixed(4);
  };
  
  if (isLoading) {
    return <div className="token-info loading">Loading token information...</div>;
  }
  
  if (error) {
    return (
      <div className="token-info error">
        <h3>Token Information</h3>
        <div className="error-message">
          <p>{error}</p>
          <p className="note">Note: This is a development environment. In production, this would connect to real contracts.</p>
        </div>
        <div className="token-stats">
          <div className="token-stat">
            <span className="label">Balance:</span>
            <span className="value">0 GOV</span>
          </div>
          <div className="token-stat">
            <span className="label">Staked:</span>
            <span className="value">0 GOV</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="token-info">
      <h3>{tokenInfo.name || 'Governance Token'} ({tokenInfo.symbol || 'GOV'})</h3>
      
      <div className="token-stats">
        <div className="token-stat">
          <span className="label">Balance:</span>
          <span className="value">{formatTokenAmount(tokenBalance)} {tokenInfo.symbol || 'GOV'}</span>
        </div>
        
        <div className="token-stat">
          <span className="label">Staked:</span>
          <span className="value">{formatTokenAmount(stakedBalance)} {tokenInfo.symbol || 'GOV'}</span>
        </div>
        
        <div className="token-stat">
          <span className="label">Pending Rewards:</span>
          <span className="value">{formatTokenAmount(pendingRewards)} {tokenInfo.symbol || 'GOV'}</span>
        </div>
        
        <div className="token-stat">
          <span className="label">Total Supply:</span>
          <span className="value">{formatTokenAmount(tokenInfo.totalSupply)} {tokenInfo.symbol || 'GOV'}</span>
        </div>
        
        <div className="token-stat">
          <span className="label">Reward Rate:</span>
          <span className="value">{tokenInfo.rewardRate || '0'}% APR</span>
        </div>
      </div>
      
      <div className="token-actions">
        <button className="token-action-button stake">Stake Tokens</button>
        <button className="token-action-button unstake">Unstake Tokens</button>
        <button className="token-action-button claim">Claim Rewards</button>
      </div>
    </div>
  );
};

export default TokenInfo; 