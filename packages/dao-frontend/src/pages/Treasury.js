import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import './Treasury.css';

const Treasury = () => {
  const { address, isConnected, contracts, signer } = useWeb3();
  const [showAllocateFundsForm, setShowAllocateFundsForm] = useState(false);
  const [showAllocateTokensForm, setShowAllocateTokensForm] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [treasuryData, setTreasuryData] = useState({
    ethBalance: '0',
    tokenBalance: '0',
    totalValue: '$0',
    revenueLastMonth: '$0',
    expendituresLastMonth: '$0',
    netGrowth: '0%',
    proposalsFunded: '0',
    avgFundingAmount: '0 GT'
  });
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch treasury data when contracts are loaded
  useEffect(() => {
    const fetchTreasuryData = async () => {
      if (!contracts.treasury) return;
      
      try {
        setIsLoading(true);
        
        // For development/demo purposes
        if (contracts.treasury.isDevelopment) {
          // Use mock data
          setTreasuryData({
            ethBalance: '125.45',
            tokenBalance: '1,250,000',
            totalValue: '$1,875,450',
            revenueLastMonth: '$125,780',
            expendituresLastMonth: '$45,230',
            netGrowth: '+12.5%',
            proposalsFunded: '24',
            avgFundingAmount: '15,000 GT'
          });
          
          setTokens([
            { id: '1', name: 'Governance Token (GT)', balance: '1,250,000', value: '$1,250,000' },
            { id: '2', name: 'Ethereum (ETH)', balance: '125.45', value: '$250,900' },
            { id: '3', name: 'USD Coin (USDC)', balance: '350,000', value: '$350,000' },
            { id: '4', name: 'Compound (COMP)', balance: '450', value: '$24,550' }
          ]);
        } else {
          // Fetch real data from the contract
          try {
            // Get ETH balance
            const ethBalance = await contracts.treasury.getBalance();
            
            // Get token balance
            const tokenBalance = await contracts.governanceToken.balanceOf(contracts.treasury.address);
            
            // Create treasury data
            setTreasuryData({
              ethBalance: ethers.utils.formatEther(ethBalance),
              tokenBalance: ethers.utils.formatEther(tokenBalance),
              totalValue: '$' + (parseFloat(ethers.utils.formatEther(ethBalance)) * 2000 + 
                         parseFloat(ethers.utils.formatEther(tokenBalance))).toLocaleString(), // Assuming $2000/ETH and $1/GT
              revenueLastMonth: '$0', // Not tracked in our simple contract
              expendituresLastMonth: '$0', // Not tracked in our simple contract
              netGrowth: '0%', // Not tracked in our simple contract
              proposalsFunded: '0', // Not tracked in our simple contract
              avgFundingAmount: '0 GT' // Not tracked in our simple contract
            });
            
            // Create tokens array
            setTokens([
              { 
                id: contracts.governanceToken.address, 
                name: 'Governance Token (GT)', 
                balance: ethers.utils.formatEther(tokenBalance), 
                value: '$' + parseFloat(ethers.utils.formatEther(tokenBalance)).toLocaleString() 
              },
              { 
                id: 'eth', 
                name: 'Ethereum (ETH)', 
                balance: ethers.utils.formatEther(ethBalance), 
                value: '$' + (parseFloat(ethers.utils.formatEther(ethBalance)) * 2000).toLocaleString() // Assuming $2000/ETH
              }
            ]);
          } catch (err) {
            console.error('Error fetching treasury data:', err);
            // Fallback to empty data
            setTreasuryData({
              ethBalance: '0',
              tokenBalance: '0',
              totalValue: '$0',
              revenueLastMonth: '$0',
              expendituresLastMonth: '$0',
              netGrowth: '0%',
              proposalsFunded: '0',
              avgFundingAmount: '0 GT'
            });
            setTokens([]);
          }
        }
      } catch (err) {
        console.error('Error in fetchTreasuryData:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTreasuryData();
  }, [contracts.treasury, contracts.governanceToken]);
  
  const handleAllocateFunds = async (e) => {
    e.preventDefault();
    if (!isConnected || !signer) {
      setMessage('Please connect your wallet to allocate funds');
      setMessageType('error');
      return;
    }
    
    if (!recipient || !amount || !purpose) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For development/demo purposes
      if (contracts.treasury.isDevelopment) {
        // Simulate fund allocation
        setTimeout(() => {
          setMessage(`Successfully allocated ${amount} ETH to ${recipient} for "${purpose}"`);
          setMessageType('success');
          setRecipient('');
          setAmount('');
          setPurpose('');
          setShowAllocateFundsForm(false);
          setIsLoading(false);
        }, 1500);
      } else {
        // Check if the user has the GOVERNOR_ROLE
        const GOVERNOR_ROLE = await contracts.treasury.GOVERNOR_ROLE();
        const hasRole = await contracts.treasury.hasRole(GOVERNOR_ROLE, address);
        
        if (!hasRole) {
          setMessage('You do not have permission to allocate funds. Only governors can perform this action.');
          setMessageType('error');
          setIsLoading(false);
          return;
        }
        
        // Allocate funds using the contract
        const tx = await contracts.treasury.allocateFunds(
          recipient,
          ethers.utils.parseEther(amount),
          purpose
        );
        
        await tx.wait();
        
        setMessage(`Successfully allocated ${amount} ETH to ${recipient} for "${purpose}"`);
        setMessageType('success');
        setRecipient('');
        setAmount('');
        setPurpose('');
        setShowAllocateFundsForm(false);
        
        // Refresh treasury data
        const ethBalance = await contracts.treasury.getBalance();
        setTreasuryData(prev => ({
          ...prev,
          ethBalance: ethers.utils.formatEther(ethBalance)
        }));
      }
    } catch (err) {
      console.error('Error allocating funds:', err);
      setMessage(`Error allocating funds: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAllocateTokens = async (e) => {
    e.preventDefault();
    if (!isConnected || !signer) {
      setMessage('Please connect your wallet to allocate tokens');
      setMessageType('error');
      return;
    }
    
    if (!recipient || !amount || !purpose || !tokenAddress) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For development/demo purposes
      if (contracts.treasury.isDevelopment) {
        // Find token name for the message
        const token = tokens.find(t => t.id === tokenAddress);
        const tokenName = token ? token.name.split(' ')[0] : 'tokens';
        
        // Simulate token allocation
        setTimeout(() => {
          setMessage(`Successfully allocated ${amount} ${tokenName} to ${recipient} for "${purpose}"`);
          setMessageType('success');
          setRecipient('');
          setAmount('');
          setPurpose('');
          setTokenAddress('');
          setShowAllocateTokensForm(false);
          setIsLoading(false);
        }, 1500);
      } else {
        // Check if the user has the GOVERNOR_ROLE
        const GOVERNOR_ROLE = await contracts.treasury.GOVERNOR_ROLE();
        const hasRole = await contracts.treasury.hasRole(GOVERNOR_ROLE, address);
        
        if (!hasRole) {
          setMessage('You do not have permission to allocate tokens. Only governors can perform this action.');
          setMessageType('error');
          setIsLoading(false);
          return;
        }
        
        // Allocate tokens using the contract
        const tx = await contracts.treasury.allocateTokens(
          tokenAddress,
          recipient,
          ethers.utils.parseEther(amount),
          purpose
        );
        
        await tx.wait();
        
        // Find token name for the message
        const token = tokens.find(t => t.id === tokenAddress);
        const tokenName = token ? token.name.split(' ')[0] : 'tokens';
        
        setMessage(`Successfully allocated ${amount} ${tokenName} to ${recipient} for "${purpose}"`);
        setMessageType('success');
        setRecipient('');
        setAmount('');
        setPurpose('');
        setTokenAddress('');
        setShowAllocateTokensForm(false);
        
        // Refresh token balance
        if (tokenAddress === contracts.governanceToken.address) {
          const tokenBalance = await contracts.governanceToken.balanceOf(contracts.treasury.address);
          setTreasuryData(prev => ({
            ...prev,
            tokenBalance: ethers.utils.formatEther(tokenBalance)
          }));
        }
      }
    } catch (err) {
      console.error('Error allocating tokens:', err);
      setMessage(`Error allocating tokens: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 10) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="treasury-page">
      <div className="page-header">
        <h1>Treasury</h1>
        <p className="page-description">
          Manage and view the DAO treasury funds, allocate resources, and track financial metrics.
        </p>
      </div>
      
      {message && (
        <div className={`transaction-message ${messageType}`}>
          <p>{message}</p>
        </div>
      )}
      
      <div className="treasury-grid">
        <div className="treasury-card">
          <h2>Treasury Overview</h2>
          {isLoading ? (
            <div className="loading">Loading treasury data...</div>
          ) : (
            <div className="treasury-stats">
              <div className="treasury-stat">
                <span className="label">ETH Balance</span>
                <span className="value">{treasuryData.ethBalance} ETH</span>
              </div>
              <div className="treasury-stat">
                <span className="label">GT Balance</span>
                <span className="value">{treasuryData.tokenBalance}</span>
              </div>
              <div className="treasury-stat">
                <span className="label">Total Value</span>
                <span className="value">{treasuryData.totalValue}</span>
              </div>
              <div className="treasury-stat">
                <span className="label">Net Growth</span>
                <span className="value">{treasuryData.netGrowth}</span>
              </div>
            </div>
          )}
          
          <div className="treasury-actions">
            <button 
              className="treasury-action-button allocate-funds-button"
              onClick={() => {
                setShowAllocateFundsForm(true);
                setShowAllocateTokensForm(false);
              }}
              disabled={!isConnected}
            >
              Allocate ETH
            </button>
            <button 
              className="treasury-action-button allocate-tokens-button"
              onClick={() => {
                setShowAllocateTokensForm(true);
                setShowAllocateFundsForm(false);
              }}
              disabled={!isConnected}
            >
              Allocate Tokens
            </button>
          </div>
        </div>
        
        <div className="treasury-card">
          <h2>Financial Metrics</h2>
          {isLoading ? (
            <div className="loading">Loading financial metrics...</div>
          ) : (
            <div className="treasury-stats">
              <div className="treasury-stat">
                <span className="label">Revenue (30d)</span>
                <span className="value">{treasuryData.revenueLastMonth}</span>
              </div>
              <div className="treasury-stat">
                <span className="label">Expenditures (30d)</span>
                <span className="value">{treasuryData.expendituresLastMonth}</span>
              </div>
              <div className="treasury-stat">
                <span className="label">Proposals Funded</span>
                <span className="value">{treasuryData.proposalsFunded}</span>
              </div>
              <div className="treasury-stat">
                <span className="label">Avg. Funding</span>
                <span className="value">{treasuryData.avgFundingAmount}</span>
              </div>
            </div>
          )}
        </div>
        
        {!isConnected && (
          <div className="treasury-card">
            <h2>Connect Wallet</h2>
            <p>Please connect your wallet to allocate funds or tokens.</p>
          </div>
        )}
        
        {showAllocateFundsForm && isConnected && (
          <div className="treasury-card">
            <h2>Allocate ETH</h2>
            <form onSubmit={handleAllocateFunds}>
              <div className="form-group">
                <label htmlFor="recipient">Recipient Address:</label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount (ETH):</label>
                <input
                  id="amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="purpose">Purpose:</label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe the purpose of this allocation"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAllocateFundsForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Allocating...' : 'Allocate Funds'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {showAllocateTokensForm && isConnected && (
          <div className="treasury-card">
            <h2>Allocate Tokens</h2>
            <form onSubmit={handleAllocateTokens}>
              <div className="form-group">
                <label htmlFor="tokenAddress">Token:</label>
                <select
                  id="tokenAddress"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  required
                >
                  <option value="">Select a token</option>
                  {tokens.map(token => (
                    token.id !== 'eth' && (
                      <option key={token.id} value={token.id}>
                        {token.name} - Balance: {token.balance}
                      </option>
                    )
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="recipient">Recipient Address:</label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount:</label>
                <input
                  id="amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="purpose">Purpose:</label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe the purpose of this allocation"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAllocateTokensForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Allocating...' : 'Allocate Tokens'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="treasury-card">
          <h2>Token Holdings</h2>
          {isLoading ? (
            <div className="loading">Loading token holdings...</div>
          ) : tokens.length === 0 ? (
            <div className="empty-tokens">
              <p>No tokens found in the treasury.</p>
            </div>
          ) : (
            <div className="token-list">
              {tokens.map(token => (
                <div key={token.id} className="token-item">
                  <span className="token-name">{token.name}</span>
                  <span className="token-balance">{token.balance} (≈ {token.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Treasury; 