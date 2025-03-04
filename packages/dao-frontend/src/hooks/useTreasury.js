import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

const useTreasury = () => {
  const { contracts, signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [treasuryData, setTreasuryData] = useState({
    ethBalance: '0',
    tokenBalance: '0',
    lastUpdated: 0
  });
  
  // Use a ref to track if the hook is mounted
  const isMounted = useRef(true);
  
  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Get treasury balance with caching
  const getTreasuryBalance = useCallback(async (forceRefresh = false) => {
    // Return cached value if available and not forcing refresh
    if (!forceRefresh && 
        treasuryData.lastUpdated > 0 && 
        Date.now() - treasuryData.lastUpdated < 30000) {
      return treasuryData.ethBalance;
    }
    
    if (!contracts.treasury) {
      console.warn('Treasury contract not initialized');
      return '0';
    }
    
    try {
      // Check if we're in development mode with mock contracts
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        const mockBalance = '2.0'; // 2 ETH
        if (isMounted.current) {
          setTreasuryData(prev => ({
            ...prev,
            ethBalance: mockBalance,
            lastUpdated: Date.now()
          }));
        }
        return mockBalance;
      }
      
      const balance = await contracts.treasury.getBalance()
        .catch(() => ethers.BigNumber.from(0));
      
      const formattedBalance = ethers.utils.formatEther(balance || 0);
      
      // Update cache only if component is still mounted
      if (isMounted.current) {
        setTreasuryData(prev => ({
          ...prev,
          ethBalance: formattedBalance,
          lastUpdated: Date.now()
        }));
      }
      
      return formattedBalance;
    } catch (err) {
      console.error('Failed to get treasury balance:', err);
      // Return cached value in case of error
      return treasuryData.ethBalance;
    }
  }, [contracts.treasury, treasuryData]);
  
  // Get token balance in treasury with caching
  const getTreasuryTokenBalance = useCallback(async (tokenAddress, forceRefresh = false) => {
    // Return cached value if available and not forcing refresh
    if (tokenAddress === contracts?.governanceToken?.address &&
        !forceRefresh && 
        treasuryData.lastUpdated > 0 && 
        Date.now() - treasuryData.lastUpdated < 30000) {
      return treasuryData.tokenBalance;
    }
    
    if (!contracts.treasury) {
      console.warn('Treasury contract not initialized');
      return '0';
    }
    
    try {
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        const mockBalance = '1000.0'; // 1000 tokens
        if (isMounted.current) {
          // Update cache if it's the governance token
          if (tokenAddress === contracts?.governanceToken?.address) {
            setTreasuryData(prev => ({
              ...prev,
              tokenBalance: mockBalance,
              lastUpdated: Date.now()
            }));
          }
        }
        return mockBalance;
      }
      
      const balance = await contracts.treasury.getTokenBalance(tokenAddress)
        .catch(() => ethers.BigNumber.from(0));
      
      const formattedBalance = ethers.utils.formatEther(balance || 0);
      
      // Update cache if it's the governance token and component is still mounted
      if (tokenAddress === contracts?.governanceToken?.address && isMounted.current) {
        setTreasuryData(prev => ({
          ...prev,
          tokenBalance: formattedBalance,
          lastUpdated: Date.now()
        }));
      }
      
      return formattedBalance;
    } catch (err) {
      console.error('Failed to get treasury token balance:', err);
      // Return cached value in case of error
      return tokenAddress === contracts?.governanceToken?.address 
        ? treasuryData.tokenBalance 
        : '0';
    }
  }, [contracts.treasury, contracts.governanceToken, treasuryData]);
  
  // Get governance token balance in treasury
  const getGovernanceTokenBalance = useCallback(async (forceRefresh = false) => {
    if (!contracts.treasury || !contracts.governanceToken) {
      console.warn('Contracts not initialized');
      return '0';
    }
    
    return getTreasuryTokenBalance(contracts.governanceToken.address, forceRefresh);
  }, [contracts.treasury, contracts.governanceToken, getTreasuryTokenBalance]);
  
  // Get treasury parameters
  const getTreasuryParameters = async () => {
    if (!contracts.treasury) {
      console.warn('Treasury contract not initialized');
      return {
        transactionFeePercent: 0,
        burnPercent: 0,
        reservePercent: 0,
        totalRevenue: '0'
      };
    }
    
    try {
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        return {
          transactionFeePercent: 250, // 2.5%
          burnPercent: 100, // 1%
          reservePercent: 500, // 5%
          totalRevenue: '10.0' // 10 ETH
        };
      }
      
      // These calls might fail if the contract doesn't have these methods
      // So we'll use Promise.allSettled and provide defaults
      const results = await Promise.allSettled([
        contracts.treasury.getTransactionFeePercent().catch(() => ethers.BigNumber.from(0)),
        contracts.treasury.getBurnPercent().catch(() => ethers.BigNumber.from(0)),
        contracts.treasury.getReservePercent().catch(() => ethers.BigNumber.from(0)),
        contracts.treasury.getTotalRevenue().catch(() => ethers.BigNumber.from(0))
      ]);
      
      return {
        transactionFeePercent: results[0].status === 'fulfilled' ? results[0].value.toNumber() : 0,
        burnPercent: results[1].status === 'fulfilled' ? results[1].value.toNumber() : 0,
        reservePercent: results[2].status === 'fulfilled' ? results[2].value.toNumber() : 0,
        totalRevenue: results[3].status === 'fulfilled' ? ethers.utils.formatEther(results[3].value) : '0'
      };
    } catch (err) {
      console.error('Failed to get treasury parameters:', err);
      return {
        transactionFeePercent: 0,
        burnPercent: 0,
        reservePercent: 0,
        totalRevenue: '0'
      };
    }
  };
  
  // Get revenue by stream
  const getRevenueByStream = async (streamId) => {
    if (!contracts.treasury) {
      setError('Contract not initialized');
      return '0';
    }
    
    try {
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        return '5.0'; // 5 ETH
      }
      
      const revenue = await contracts.treasury.getRevenueByStream(streamId);
      return ethers.utils.formatEther(revenue);
    } catch (err) {
      console.error('Failed to get revenue by stream:', err);
      if (isMounted.current) {
        setError(err.message);
      }
      return '0';
    }
  };
  
  // Allocate funds from treasury
  const allocateFunds = async (recipient, amount, purpose) => {
    if (!contracts.treasury || !signer) {
      if (isMounted.current) {
        setError('Wallet not connected or contract not initialized');
      }
      return false;
    }
    
    try {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }
      
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (isMounted.current) {
          setIsLoading(false);
        }
        return true;
      }
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Allocate funds
      const tx = await contracts.treasury.allocateFunds(recipient, amountWei, purpose);
      await tx.wait();
      
      if (isMounted.current) {
        setIsLoading(false);
      }
      return true;
    } catch (err) {
      console.error('Failed to allocate funds:', err);
      if (isMounted.current) {
        setError(err.message);
        setIsLoading(false);
      }
      return false;
    }
  };
  
  // Allocate tokens from treasury
  const allocateTokens = async (tokenAddress, recipient, amount, purpose) => {
    if (!contracts.treasury || !signer) {
      if (isMounted.current) {
        setError('Wallet not connected or contract not initialized');
      }
      return false;
    }
    
    try {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }
      
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (isMounted.current) {
          setIsLoading(false);
        }
        return true;
      }
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Allocate tokens
      const tx = await contracts.treasury.allocateTokens(tokenAddress, recipient, amountWei, purpose);
      await tx.wait();
      
      if (isMounted.current) {
        setIsLoading(false);
      }
      return true;
    } catch (err) {
      console.error('Failed to allocate tokens:', err);
      if (isMounted.current) {
        setError(err.message);
        setIsLoading(false);
      }
      return false;
    }
  };
  
  // Process crowdfunding
  const processCrowdfunding = async (tokenAddress, sender, recipient, amount) => {
    if (!contracts.treasury || !signer) {
      if (isMounted.current) {
        setError('Wallet not connected or contract not initialized');
      }
      return false;
    }
    
    try {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }
      
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || contracts.treasury.isDevelopment) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (isMounted.current) {
          setIsLoading(false);
        }
        return true;
      }
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Process crowdfunding
      const tx = await contracts.treasury.processCrowdfunding(tokenAddress, sender, recipient, amountWei);
      await tx.wait();
      
      if (isMounted.current) {
        setIsLoading(false);
      }
      return true;
    } catch (err) {
      console.error('Failed to process crowdfunding:', err);
      if (isMounted.current) {
        setError(err.message);
        setIsLoading(false);
      }
      return false;
    }
  };
  
  // Pre-fetch data when hook is initialized
  useEffect(() => {
    if (contracts.treasury) {
      getTreasuryBalance();
      if (contracts.governanceToken) {
        getGovernanceTokenBalance();
      }
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [contracts.treasury, contracts.governanceToken, getTreasuryBalance, getGovernanceTokenBalance]);

  return {
    getTreasuryBalance,
    getTreasuryTokenBalance,
    getGovernanceTokenBalance,
    getTreasuryParameters,
    getRevenueByStream,
    allocateFunds,
    allocateTokens,
    processCrowdfunding,
    isLoading,
    error,
    treasuryData
  };
};

export default useTreasury; 