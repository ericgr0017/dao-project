import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

const useGovernance = () => {
  const { contracts, address, signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Stake tokens
  const stakeTokens = async (amount) => {
    if (!contracts.governanceToken || !signer) {
      setError('Wallet not connected or contract not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // First approve the transfer
      const approveTx = await contracts.governanceToken.approve(
        contracts.governanceToken.address,
        amountWei
      );
      await approveTx.wait();
      
      // Then stake the tokens
      const stakeTx = await contracts.governanceToken.stake(amountWei);
      await stakeTx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to stake tokens:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Unstake tokens
  const unstakeTokens = async (amount) => {
    if (!contracts.governanceToken || !signer) {
      setError('Wallet not connected or contract not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Unstake the tokens
      const unstakeTx = await contracts.governanceToken.unstake(amountWei);
      await unstakeTx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to unstake tokens:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Claim staking rewards
  const claimRewards = async () => {
    if (!contracts.governanceToken || !signer) {
      setError('Wallet not connected or contract not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Claim rewards
      const claimTx = await contracts.governanceToken.claimStakingRewards();
      await claimTx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to claim rewards:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Calculate pending rewards
  const calculatePendingRewards = async () => {
    if (!contracts.governanceToken || !address) {
      return '0';
    }
    
    try {
      const pendingRewards = await contracts.governanceToken.calculatePendingRewards(address)
        .catch(() => ethers.BigNumber.from(0));
      
      return ethers.utils.formatEther(pendingRewards || 0);
    } catch (err) {
      console.error('Failed to calculate pending rewards:', err);
      return '0';
    }
  };
  
  // Transfer tokens
  const transferTokens = async (recipient, amount) => {
    if (!contracts.governanceToken || !signer) {
      setError('Wallet not connected or contract not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Transfer tokens
      const transferTx = await contracts.governanceToken.transfer(recipient, amountWei);
      await transferTx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to transfer tokens:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Get token information
  const getTokenInfo = async () => {
    if (!contracts.governanceToken) {
      setError('Contract not initialized. This is expected in development mode.');
      return {
        name: 'Governance Token',
        symbol: 'GOV',
        totalSupply: '0',
        rewardRate: '0'
      };
    }
    
    try {
      const [name, symbol, totalSupply, stakingRewardRate] = await Promise.all([
        contracts.governanceToken.name().catch(() => 'Governance Token'),
        contracts.governanceToken.symbol().catch(() => 'GOV'),
        contracts.governanceToken.totalSupply().catch(() => ethers.BigNumber.from(0)),
        contracts.governanceToken.stakingRewardRate().catch(() => ethers.BigNumber.from(0))
      ]);
      
      return {
        name: name || 'Governance Token',
        symbol: symbol || 'GOV',
        totalSupply: ethers.utils.formatEther(totalSupply || 0),
        rewardRate: (stakingRewardRate ? stakingRewardRate.toNumber() : 0) / 100 // Convert basis points to percentage
      };
    } catch (err) {
      console.error('Failed to get token info:', err);
      setError('Failed to get token info. This is expected in development mode without a local blockchain running.');
      return {
        name: 'Governance Token',
        symbol: 'GOV',
        totalSupply: '0',
        rewardRate: '0'
      };
    }
  };
  
  return {
    stakeTokens,
    unstakeTokens,
    claimRewards,
    calculatePendingRewards,
    transferTokens,
    getTokenInfo,
    isLoading,
    error
  };
};

export default useGovernance; 