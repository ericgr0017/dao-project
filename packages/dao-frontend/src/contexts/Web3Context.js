import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { ethers } from 'ethers';
import { useAccount, useNetwork, usePublicClient, useWalletClient, useConnect, useDisconnect } from 'wagmi';

// Contract ABIs
import GovernanceTokenABI from '../contracts/GovernanceToken.json';
import ProposalSystemABI from '../contracts/ProposalSystem.json';
import TreasuryABI from '../contracts/Treasury.json';

// Create context
const Web3Context = createContext();

// Contract addresses - these will be updated based on the network
const CONTRACT_ADDRESSES = {
  // Localhost/Hardhat
  1337: {
    governanceToken: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    proposalSystem: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    treasury: '0x0165878A594ca255338adfa4d48449f69242Eb8F'
  },
  // Sepolia testnet
  11155111: {
    governanceToken: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    proposalSystem: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    treasury: '0x0165878A594ca255338adfa4d48449f69242Eb8F'
  },
  // Ethereum mainnet - using mock addresses for development
  1: {
    governanceToken: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    proposalSystem: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    treasury: '0x0165878A594ca255338adfa4d48449f69242Eb8F'
  }
};

export const Web3Provider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Add isMounted ref to track component lifecycle
  const isMounted = useRef(true);
  
  // State variables
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [userBalances, setUserBalances] = useState({
    ethBalance: '0',
    tokenBalance: '0',
    stakedBalance: '0',
    reputation: '0'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!isMounted.current) return;
      setIsConnecting(true);
      setError('');
      
      // Check if MetaMask is installed
      if (window.ethereum && window.ethereum.isMetaMask) {
        // Find the MetaMask connector
        const metaMaskConnector = connectors.find(
          connector => connector.id === 'metaMask'
        );
        
        if (metaMaskConnector) {
          // Connect specifically using the MetaMask connector
          await connect({ connector: metaMaskConnector });
          console.log('MetaMask connected successfully');
        } else {
          // Fallback to injected connector if MetaMask connector not found
          const injectedConnector = connectors.find(
            connector => connector.id === 'injected'
          );
          
          if (injectedConnector) {
            await connect({ connector: injectedConnector });
            console.log('Connected using injected connector');
          } else {
            throw new Error('No suitable connector found');
          }
        }
      } else {
        // If MetaMask is not installed, show error
        setError('MetaMask not detected. Please install MetaMask extension.');
        console.error('MetaMask not detected');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      
      // Provide more user-friendly error messages
      if (!isMounted.current) return;
      
      if (err.code === 4001) {
        // User rejected the connection request
        setError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (!window.ethereum) {
        setError('No Ethereum wallet detected. Please install MetaMask extension.');
      } else {
        setError('Failed to connect wallet: ' + err.message);
      }
    } finally {
      if (isMounted.current) {
        setIsConnecting(false);
      }
    }
  };
  
  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet: ' + err.message);
    }
  };
  
  // Create provider from publicClient
  useEffect(() => {
    let newProvider = null;
    
    if (publicClient) {
      try {
        newProvider = new ethers.providers.JsonRpcProvider(
          publicClient.transport.url
        );
        
        // Add a listener for network errors
        newProvider.on('error', (error) => {
          console.warn('Provider error:', error);
          // Don't set error state here to avoid UI disruption
        });
        
        if (isMounted.current) {
          setProvider(newProvider);
        }
      } catch (err) {
        console.error('Error creating provider:', err);
        if (isMounted.current) {
          setError('Failed to create provider: ' + err.message);
        }
      }
    }
    
    // Clean up provider listeners on unmount
    return () => {
      if (newProvider) {
        console.log('DEBUG-WEB3: Cleaning up provider listeners');
        newProvider.removeAllListeners();
        newProvider = null;
      }
    };
  }, [publicClient, provider]);
  
  // Create signer from walletClient
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let currentSigner = null;
    
    if (walletClient && provider) {
      try {
        currentSigner = provider.getSigner(walletClient.account.address);
        if (isMounted.current) {
          setSigner(currentSigner);
        }
      } catch (err) {
        console.error('Error creating signer:', err);
        if (isMounted.current) {
          setError('Failed to create signer: ' + err.message);
        }
      }
    }
    
    return () => {
      // Clean up signer
      currentSigner = null;
    };
  }, [walletClient, provider]);
  
  // Initialize provider and contracts when connected
  useEffect(() => {
    console.log('DEBUG-WEB3: Connection status changed:', isConnected);
    
    if (isConnected && walletClient) {
      console.log('DEBUG-WEB3: Connected and wallet client available');
      if (isMounted.current) {
        setIsInitialized(true);
      }
    } else {
      // If in development mode, initialize with mock data
      if (process.env.NODE_ENV === 'development' && !isInitialized) {
        console.log('DEBUG-WEB3: Development mode: Initializing with mock data');
        if (!isMounted.current) return;
        
        setIsInitialized(true);
        
        // Set mock contracts with more comprehensive mock methods
        setContracts({
          governanceToken: { 
            isDevelopment: true,
            balanceOf: () => Promise.resolve(ethers.BigNumber.from('1000000000000000000')),
            stakedBalanceOf: () => Promise.resolve(ethers.BigNumber.from('500000000000000000')),
            stake: () => Promise.resolve({ wait: () => Promise.resolve() }),
            unstake: () => Promise.resolve({ wait: () => Promise.resolve() }),
            claimStakingRewards: () => Promise.resolve({ wait: () => Promise.resolve() }),
            calculateStakingRewards: () => Promise.resolve(ethers.BigNumber.from('100000000000000000')),
            transfer: () => Promise.resolve({ wait: () => Promise.resolve() })
          },
          proposalSystem: { 
            isDevelopment: true,
            getProposalCount: () => Promise.resolve(ethers.BigNumber.from(5)),
            getProposal: () => Promise.resolve({
              id: ethers.BigNumber.from(1),
              proposer: '0x1234567890123456789012345678901234567890',
              description: 'Mock proposal description',
              status: ethers.BigNumber.from(1)
            }),
            castVote: () => Promise.resolve({ wait: () => Promise.resolve() })
          },
          treasury: { 
            isDevelopment: true,
            getBalance: () => Promise.resolve(ethers.BigNumber.from('2000000000000000000')),
            getTokenBalance: () => Promise.resolve(ethers.BigNumber.from('3000000000000000000')),
            allocateFunds: () => Promise.resolve({ wait: () => Promise.resolve() }),
            allocateTokens: () => Promise.resolve({ wait: () => Promise.resolve() }),
            processCrowdfunding: () => Promise.resolve({ wait: () => Promise.resolve() })
          }
        });
      }
    }
  }, [isConnected, walletClient, isInitialized]);
  
  // Initialize contracts when network or signer changes
  useEffect(() => {
    const initializeContracts = async () => {
      if (!isMounted.current) return;
      
      if (provider && chain && (signer || process.env.NODE_ENV === 'development')) {
        try {
          setIsLoading(true);
          
          // Get the chain ID
          const chainId = chain.id;
          
          // Get contract addresses for the current network
          const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[1337]; // Default to localhost if network not supported
          
          // Create contract instances
          const governanceToken = new ethers.Contract(
            addresses.governanceToken,
            GovernanceTokenABI.abi,
            signer || provider
          );
          
          const proposalSystem = new ethers.Contract(
            addresses.proposalSystem,
            ProposalSystemABI.abi,
            signer || provider
          );
          
          const treasury = new ethers.Contract(
            addresses.treasury,
            TreasuryABI.abi,
            signer || provider
          );
          
          // Create a mock ReputationSystem since we don't have it in our simplified implementation
          const reputationSystem = {
            isDevelopment: true,
            getReputation: (address) => Promise.resolve(ethers.BigNumber.from('800')),
            getContributionByType: (address, type) => Promise.resolve(ethers.BigNumber.from('200')),
            getTotalReputation: () => Promise.resolve(ethers.BigNumber.from('10000')),
            addReputation: (address, amount, type, description) => Promise.resolve({ wait: () => Promise.resolve() }),
            hasRole: (role, address) => Promise.resolve(true),
            getContributionCount: (address) => Promise.resolve(ethers.BigNumber.from('5')),
            getAllContributions: (address) => Promise.resolve([
              { id: 1, contributor: address, amount: 200, contributionType: 0, description: 'Code contribution', timestamp: Date.now() - 86400000 * 5 },
              { id: 2, contributor: address, amount: 150, contributionType: 1, description: 'Community management', timestamp: Date.now() - 86400000 * 3 },
              { id: 3, contributor: address, amount: 300, contributionType: 2, description: 'Documentation', timestamp: Date.now() - 86400000 * 1 },
              { id: 4, contributor: address, amount: 100, contributionType: 0, description: 'Bug fix', timestamp: Date.now() - 86400000 * 0.5 },
              { id: 5, contributor: address, amount: 50, contributionType: 3, description: 'Marketing', timestamp: Date.now() }
            ])
          };
          
          // Set contracts in state
          if (isMounted.current) {
            setContracts({
              governanceToken,
              proposalSystem,
              treasury,
              reputationSystem
            });
          }
        } catch (err) {
          console.error('Error initializing contracts:', err);
          if (isMounted.current) {
            setError('Failed to initialize contracts: ' + err.message);
          }
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      }
    };
    
    initializeContracts();
  }, [chain, signer, provider]);
  
  // Memoize contract instances to prevent unnecessary re-renders
  const memoizedContracts = useMemo(() => contracts, [contracts]);
  
  // Update user balances when address or contracts change
  useEffect(() => {
    let intervalId;
    
    const updateBalances = async () => {
      if (!isMounted.current) return;
      
      if (address && contracts.governanceToken && contracts.reputationSystem && provider) {
        try {
          setIsLoading(true);
          
          // Get ETH balance
          const ethBalance = await provider.getBalance(address);
          
          // Get token balance
          const tokenBalance = await contracts.governanceToken.balanceOf(address);
          
          // Get staked balance - check if the method exists first
          let stakedBalance = ethers.BigNumber.from('0');
          if (contracts.governanceToken.stakedBalanceOf) {
            try {
              stakedBalance = await contracts.governanceToken.stakedBalanceOf(address);
            } catch (err) {
              console.warn('stakedBalanceOf method not available:', err.message);
            }
          }
          
          // Get reputation
          const reputation = await contracts.reputationSystem.getReputation(address);
          
          // Update balances in state
          if (isMounted.current) {
            setUserBalances({
              ethBalance: ethers.utils.formatEther(ethBalance),
              tokenBalance: ethers.utils.formatEther(tokenBalance),
              stakedBalance: ethers.utils.formatEther(stakedBalance),
              reputation: reputation.toString()
            });
          }
        } catch (err) {
          console.error('Error updating balances:', err);
          // Don't set error state here to avoid UI disruption during normal operation
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      }
    };
    
    // Initial update
    updateBalances();
    
    // Set up interval to update balances
    if (address && contracts.governanceToken && contracts.reputationSystem && provider) {
      console.log('DEBUG-WEB3: Setting up balance update interval');
      intervalId = setInterval(updateBalances, 30000); // Update every 30 seconds
    }
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      if (intervalId) {
        console.log('DEBUG-WEB3: Clearing balance update interval');
        clearInterval(intervalId);
      }
    };
  }, [address, contracts.governanceToken, contracts.reputationSystem, provider]);
  
  // Update contract addresses from deployment info
  const updateContractAddresses = (deploymentInfo, chainId) => {
    if (!deploymentInfo || !chainId) return;
    
    CONTRACT_ADDRESSES[chainId] = {
      governanceToken: deploymentInfo.governanceToken,
      proposalSystem: deploymentInfo.proposalSystem,
      treasury: deploymentInfo.treasury
    };
  };
  
  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        provider,
        signer,
        contracts: memoizedContracts,
        userBalances,
        isLoading,
        error,
        updateContractAddresses,
        connectWallet,
        disconnectWallet,
        isConnecting,
        chain
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

export default Web3Context; 