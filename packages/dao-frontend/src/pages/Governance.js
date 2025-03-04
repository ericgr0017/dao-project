import React, { useState } from 'react';
import './Governance.css';

const Governance = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [txStatus, setTxStatus] = useState('');
  
  // Mock data for demonstration
  const tokenInfo = {
    name: 'Governance Token',
    symbol: 'GOV',
    balance: '1000.0000',
    staked: '500.0000',
    pendingRewards: '25.0000',
    totalSupply: '1000000.0000',
    rewardRate: '5.00'
  };
  
  const handleStake = (e) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTxStatus('Please enter a valid amount to stake');
      return;
    }
    
    // Simulate staking process
    setTxStatus(`Successfully staked ${stakeAmount} ${tokenInfo.symbol}`);
    setStakeAmount('');
  };
  
  const handleUnstake = (e) => {
    e.preventDefault();
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setTxStatus('Please enter a valid amount to unstake');
      return;
    }
    
    // Simulate unstaking process
    setTxStatus(`Successfully unstaked ${unstakeAmount} ${tokenInfo.symbol}`);
    setUnstakeAmount('');
  };
  
  const handleClaimRewards = () => {
    // Simulate claiming rewards
    setTxStatus(`Successfully claimed ${tokenInfo.pendingRewards} ${tokenInfo.symbol} in rewards`);
  };
  
  return (
    <div className="governance-page">
      <div className="page-header">
        <h1>Governance</h1>
        <p className="page-description">
          Stake your tokens to participate in governance and earn rewards.
        </p>
      </div>
      
      <div className="governance-content">
        <div className="governance-grid">
          <div className="governance-card">
            <h2>Token Overview</h2>
            <div className="token-stats">
              <div className="token-stat">
                <span className="label">Token:</span>
                <span className="value">{tokenInfo.name} ({tokenInfo.symbol})</span>
              </div>
              <div className="token-stat">
                <span className="label">Balance:</span>
                <span className="value">{tokenInfo.balance} {tokenInfo.symbol}</span>
              </div>
              <div className="token-stat">
                <span className="label">Staked:</span>
                <span className="value">{tokenInfo.staked} {tokenInfo.symbol}</span>
              </div>
              <div className="token-stat">
                <span className="label">Pending Rewards:</span>
                <span className="value">{tokenInfo.pendingRewards} {tokenInfo.symbol}</span>
              </div>
              <div className="token-stat">
                <span className="label">Total Supply:</span>
                <span className="value">{tokenInfo.totalSupply} {tokenInfo.symbol}</span>
              </div>
              <div className="token-stat">
                <span className="label">Reward Rate:</span>
                <span className="value">{tokenInfo.rewardRate}% APR</span>
              </div>
            </div>
          </div>
          
          <div className="governance-card">
            <h2>Stake Tokens</h2>
            <p>Stake your tokens to earn rewards and gain voting power.</p>
            
            <form onSubmit={handleStake}>
              <div className="form-group">
                <label htmlFor="stake-amount">Amount to Stake:</label>
                <input
                  id="stake-amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">Stake Tokens</button>
              </div>
            </form>
          </div>
          
          <div className="governance-card">
            <h2>Unstake Tokens</h2>
            <p>Unstake your tokens to withdraw them from governance.</p>
            
            <form onSubmit={handleUnstake}>
              <div className="form-group">
                <label htmlFor="unstake-amount">Amount to Unstake:</label>
                <input
                  id="unstake-amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">Unstake Tokens</button>
              </div>
            </form>
          </div>
          
          <div className="governance-card">
            <h2>Claim Rewards</h2>
            <p>Claim your earned rewards from staking.</p>
            
            <div className="form-actions">
              <button 
                className="submit-button"
                onClick={handleClaimRewards}
              >
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
        
        {txStatus && (
          <div className="governance-card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>{txStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Governance; 