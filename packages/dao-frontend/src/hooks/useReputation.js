import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const useReputation = () => {
  const { contracts, address, signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Role constants
  const REPUTATION_MANAGER_ROLE = '0x3d3815f4fd50c4ad0f7ef433f6c5ecf6d9c1596ef1c4d3f69f9f5d3e8d48eb60';
  
  // Get reputation for an address
  const getReputation = async (userAddress) => {
    if (!contracts.reputationSystem) {
      console.warn('Reputation contract not initialized');
      return '0';
    }
    
    try {
      const reputation = await contracts.reputationSystem.getReputation(userAddress || address)
        .catch(() => 0);
      return reputation.toString();
    } catch (err) {
      console.error('Failed to get reputation:', err);
      return '0';
    }
  };
  
  // Get contribution by type
  const getContributionByType = async (userAddress, contributionType) => {
    if (!contracts.reputationSystem) {
      console.warn('Reputation contract not initialized');
      return '0';
    }
    
    try {
      const contribution = await contracts.reputationSystem.getContributionByType(
        userAddress || address,
        contributionType
      ).catch(() => 0);
      return contribution.toString();
    } catch (err) {
      console.error('Failed to get contribution by type:', err);
      return '0';
    }
  };
  
  // Get total reputation in the system
  const getTotalReputation = async () => {
    if (!contracts.reputationSystem) {
      console.warn('Reputation contract not initialized');
      return '0';
    }
    
    try {
      const totalRep = await contracts.reputationSystem.getTotalReputation()
        .catch(() => 0);
      return totalRep.toString();
    } catch (err) {
      console.error('Failed to get total reputation:', err);
      return '0';
    }
  };
  
  // Get all contributions for a user
  const getContributions = async (userAddress) => {
    if (!contracts.reputationSystem) {
      console.warn('Reputation contract not initialized');
      return [];
    }
    
    try {
      // Check if we're in development mode with mock contracts
      if (contracts.reputationSystem.isDevelopment) {
        // Return mock data
        return [
          {
            id: 1,
            type: 'CODE',
            value: '500',
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
            description: 'Fixed critical bug in smart contract'
          },
          {
            id: 2,
            type: 'CONTENT',
            value: '200',
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
            description: 'Created documentation for DAO governance'
          },
          {
            id: 3,
            type: 'GOVERNANCE',
            value: '100',
            timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
            description: 'Participated in proposal voting'
          }
        ];
      }
      
      // This is a mock implementation since we don't know the actual contract method
      // In a real implementation, you would call the appropriate contract method
      const contributionCount = await contracts.reputationSystem.getContributionCount(userAddress || address)
        .catch(() => 0);
      
      const contributions = [];
      for (let i = 0; i < contributionCount; i++) {
        try {
          const contribution = await contracts.reputationSystem.getContributionByIndex(userAddress || address, i);
          contributions.push({
            id: i,
            type: contribution.type || 'Unknown',
            value: contribution.value ? contribution.value.toString() : '0',
            timestamp: contribution.timestamp ? contribution.timestamp.toNumber() : Date.now() / 1000,
            description: contribution.description || ''
          });
        } catch (err) {
          console.error(`Failed to get contribution at index ${i}:`, err);
        }
      }
      
      return contributions;
    } catch (err) {
      console.error('Failed to get contributions:', err);
      return [];
    }
  };
  
  // Add reputation (only for users with REPUTATION_MANAGER_ROLE)
  const addReputation = async (userAddress, contributionType, amount) => {
    if (!contracts.reputationSystem || !signer) {
      setError('Contract not initialized or wallet not connected');
      return false;
    }
    
    try {
      // Check if we're in development mode with mock contracts
      if (contracts.reputationSystem.isDevelopment) {
        setIsLoading(true);
        setError(null);
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`Development mode: Adding ${amount} reputation to ${userAddress} for ${contributionType}`);
        setIsLoading(false);
        return true;
      }
      
      // Check if the caller has the REPUTATION_MANAGER_ROLE
      const hasManagerRole = await hasRole(REPUTATION_MANAGER_ROLE, address);
      
      if (!hasManagerRole) {
        setError('You do not have permission to add reputation');
        return false;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Add reputation
      const tx = await contracts.reputationSystem.addReputation(
        userAddress,
        contributionType,
        amount
      );
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to add reputation:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Get decay rate for an address
  const getDecayRate = async (userAddress) => {
    if (!contracts.reputationSystem) {
      setError('Contract not initialized');
      return 0;
    }
    
    try {
      // This is a placeholder - your contract might not have this function
      // You might need to store decay rates in a mapping
      const decayRate = await contracts.reputationSystem.getDecayRate(userAddress || address);
      return decayRate.toNumber();
    } catch (err) {
      console.error('Failed to get decay rate:', err);
      setError(err.message);
      return 0;
    }
  };
  
  // Set decay rate for an address (only for users with GOVERNANCE_ROLE)
  const setDecayRate = async (userAddress, decayRate) => {
    if (!contracts.reputationSystem || !signer) {
      setError('Wallet not connected or contract not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set decay rate
      const tx = await contracts.reputationSystem.setDecayRate(userAddress, decayRate);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to set decay rate:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Get default decay rate
  const getDefaultDecayRate = async () => {
    if (!contracts.reputationSystem) {
      setError('Contract not initialized');
      return 0;
    }
    
    try {
      const defaultDecayRate = await contracts.reputationSystem.defaultDecayRate();
      return defaultDecayRate.toNumber();
    } catch (err) {
      console.error('Failed to get default decay rate:', err);
      setError(err.message);
      return 0;
    }
  };
  
  // Set default decay rate (only for users with GOVERNANCE_ROLE)
  const setDefaultDecayRate = async (decayRate) => {
    if (!contracts.reputationSystem || !signer) {
      setError('Wallet not connected or contract not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set default decay rate
      const tx = await contracts.reputationSystem.setDefaultDecayRate(decayRate);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to set default decay rate:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Check if an address has a specific role
  const hasRole = async (role, userAddress) => {
    if (!contracts.reputationSystem) {
      console.warn('Reputation contract not initialized');
      return false;
    }
    
    try {
      // Check if we're in development mode with mock contracts
      if (contracts.reputationSystem.isDevelopment) {
        // In development mode, return true for the current user
        return userAddress === address;
      }
      
      const hasRole = await contracts.reputationSystem.hasRole(role, userAddress || address)
        .catch(() => false);
      return hasRole;
    } catch (err) {
      console.error('Failed to check role:', err);
      return false;
    }
  };
  
  return {
    getReputation,
    getContributionByType,
    getTotalReputation,
    getContributions,
    addReputation,
    getDecayRate,
    setDecayRate,
    getDefaultDecayRate,
    setDefaultDecayRate,
    hasRole,
    isLoading,
    error,
    REPUTATION_MANAGER_ROLE
  };
};

export default useReputation; 