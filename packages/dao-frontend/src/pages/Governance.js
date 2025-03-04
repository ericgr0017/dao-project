import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import './Governance.css';

const Governance = () => {
  const { address, isConnected, contracts, signer, balance, stakedBalance } = useWeb3();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [txType, setTxType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({
    name: 'Governance Token',
    symbol: 'GT',
    balance: '0',
    staked: '0',
    pendingRewards: '0',
    totalSupply: '0',
    rewardRate: '0'
  });
  
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!contracts.governanceToken) return;
      
      try {
        setIsLoading(true);
        
        // For development/demo purposes
        if (contracts.governanceToken.isDevelopment) {
          // Use mock data
          setTokenInfo({
            name: 'Governance Token',
            symbol: 'GT',
            balance: '1000.0000',
            staked: '500.0000',
            pendingRewards: '25.0000',
            totalSupply: '1000000.0000',
            rewardRate: '5.00'
          });
        } else {
          // Fetch real data from the contract
          try {
            const name = await contracts.governanceToken.name();
            const symbol = await contracts.governanceToken.symbol();
            const totalSupply = await contracts.governanceToken.totalSupply();
            
            // Use the balance from Web3Context
            const formattedBalance = balance ? ethers.utils.formatEther(balance) : '0';
            const formattedStakedBalance = stakedBalance ? ethers.utils.formatEther(stakedBalance) : '0';
            
            // Our simplified contract doesn't have rewards, so we'll set it to 0
            setTokenInfo({
              name,
              symbol,
              balance: formattedBalance,
              staked: formattedStakedBalance,
              pendingRewards: '0', // Not implemented in our simplified contract
              totalSupply: ethers.utils.formatEther(totalSupply),
              rewardRate: '0' // Not implemented in our simplified contract
            });
          } catch (err) {
            console.error('Error fetching token info:', err);
            // Fallback to default values
            setTokenInfo({
              name: 'Governance Token',
              symbol: 'GT',
              balance: '0',
              staked: '0',
              pendingRewards: '0',
              totalSupply: '0',
              rewardRate: '0'
            });
          }
        }
      } catch (err) {
        console.error('Error in fetchTokenInfo:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokenInfo();
  }, [contracts.governanceToken, balance, stakedBalance]);
  
  const handleStake = async (e) => {
    e.preventDefault();
    if (!isConnected || !signer) {
      setTxStatus('Please connect your wallet to stake tokens');
      setTxType('error');
      return;
    }
    
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTxStatus('Please enter a valid amount to stake');
      setTxType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For development/demo purposes
      if (contracts.governanceToken.isDevelopment) {
        // Simulate staking process
        setTimeout(() => {
          setTxStatus(`Successfully staked ${stakeAmount} ${tokenInfo.symbol}`);
          setTxType('success');
          setStakeAmount('');
          setIsLoading(false);
        }, 1500);
      } else {
        // Check if the user has enough balance
        if (parseFloat(tokenInfo.balance) < parseFloat(stakeAmount)) {
          setTxStatus(`Insufficient balance. You only have ${tokenInfo.balance} ${tokenInfo.symbol}`);
          setTxType('error');
          setIsLoading(false);
          return;
        }
        
        // Stake tokens using the contract
        const amountToStake = ethers.utils.parseEther(stakeAmount);
        
        // First approve the tokens
        const approveTx = await contracts.governanceToken.approve(contracts.governanceToken.address, amountToStake);
        await approveTx.wait();
        
        // Then stake them
        const stakeTx = await contracts.governanceToken.stake(amountToStake);
        await stakeTx.wait();
        
        setTxStatus(`Successfully staked ${stakeAmount} ${tokenInfo.symbol}`);
        setTxType('success');
        setStakeAmount('');
      }
    } catch (err) {
      console.error('Error staking tokens:', err);
      setTxStatus(`Error staking tokens: ${err.message}`);
      setTxType('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnstake = async (e) => {
    e.preventDefault();
    if (!isConnected || !signer) {
      setTxStatus('Please connect your wallet to unstake tokens');
      setTxType('error');
      return;
    }
    
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setTxStatus('Please enter a valid amount to unstake');
      setTxType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For development/demo purposes
      if (contracts.governanceToken.isDevelopment) {
        // Simulate unstaking process
        setTimeout(() => {
          setTxStatus(`Successfully unstaked ${unstakeAmount} ${tokenInfo.symbol}`);
          setTxType('success');
          setUnstakeAmount('');
          setIsLoading(false);
        }, 1500);
      } else {
        // Check if the user has enough staked balance
        if (parseFloat(tokenInfo.staked) < parseFloat(unstakeAmount)) {
          setTxStatus(`Insufficient staked balance. You only have ${tokenInfo.staked} ${tokenInfo.symbol} staked`);
          setTxType('error');
          setIsLoading(false);
          return;
        }
        
        // Unstake tokens using the contract
        const amountToUnstake = ethers.utils.parseEther(unstakeAmount);
        const unstakeTx = await contracts.governanceToken.unstake(amountToUnstake);
        await unstakeTx.wait();
        
        setTxStatus(`Successfully unstaked ${unstakeAmount} ${tokenInfo.symbol}`);
        setTxType('success');
        setUnstakeAmount('');
      }
    } catch (err) {
      console.error('Error unstaking tokens:', err);
      setTxStatus(`Error unstaking tokens: ${err.message}`);
      setTxType('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClaimRewards = async () => {
    if (!isConnected || !signer) {
      setTxStatus('Please connect your wallet to claim rewards');
      setTxType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For development/demo purposes
      if (contracts.governanceToken.isDevelopment) {
        // Simulate claiming rewards
        setTimeout(() => {
          setTxStatus(`Successfully claimed ${tokenInfo.pendingRewards} ${tokenInfo.symbol} in rewards`);
          setTxType('success');
          setIsLoading(false);
        }, 1500);
      } else {
        // Our simplified contract doesn't have rewards, so we'll just show a message
        setTxStatus('Rewards are not implemented in the current version of the contract');
        setTxType('info');
      }
    } catch (err) {
      console.error('Error claiming rewards:', err);
      setTxStatus(`Error claiming rewards: ${err.message}`);
      setTxType('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="governance-page">
      <div className="page-header">
        <h1>Governance</h1>
        <p className="page-description">
          Stake your tokens to participate in governance and earn rewards.
        </p>
      </div>
      
      {!isConnected && (
        <div className="governance-card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to interact with governance features.</p>
        </div>
      )}
      
      <div className="governance-content">
        <div className="governance-grid">
          <div className="governance-card">
            <h2>Token Overview</h2>
            {isLoading && !tokenInfo.balance ? (
              <div className="loading">Loading token information...</div>
            ) : (
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
            )}
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
                  disabled={!isConnected || isLoading}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!isConnected || isLoading}
                >
                  {isLoading ? 'Staking...' : 'Stake Tokens'}
                </button>
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
                  disabled={!isConnected || isLoading}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!isConnected || isLoading}
                >
                  {isLoading ? 'Unstaking...' : 'Unstake Tokens'}
                </button>
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
                disabled={!isConnected || isLoading || parseFloat(tokenInfo.pendingRewards) <= 0}
              >
                {isLoading ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          </div>
        </div>
        
        {txStatus && (
          <div className={`governance-card transaction-message ${txType}`} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>{txStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Governance; 