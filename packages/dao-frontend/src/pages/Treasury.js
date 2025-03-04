import React, { useState } from 'react';
import './Treasury.css';

const Treasury = () => {
  const [showAllocateFundsForm, setShowAllocateFundsForm] = useState(false);
  const [showAllocateTokensForm, setShowAllocateTokensForm] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Mock data for demonstration
  const treasuryData = {
    ethBalance: '125.45',
    tokenBalance: '1,250,000',
    totalValue: '$1,875,450',
    revenueLastMonth: '$125,780',
    expendituresLastMonth: '$45,230',
    netGrowth: '+12.5%',
    proposalsFunded: '24',
    avgFundingAmount: '15,000 GOV'
  };
  
  const mockTokens = [
    { id: '1', name: 'Governance Token (GOV)', balance: '1,250,000', value: '$1,250,000' },
    { id: '2', name: 'Ethereum (ETH)', balance: '125.45', value: '$250,900' },
    { id: '3', name: 'USD Coin (USDC)', balance: '350,000', value: '$350,000' },
    { id: '4', name: 'Compound (COMP)', balance: '450', value: '$24,550' }
  ];
  
  const handleAllocateFunds = (e) => {
    e.preventDefault();
    if (!recipient || !amount || !purpose) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }
    
    // Simulate fund allocation
    setMessage(`Successfully allocated ${amount} ETH to ${recipient} for "${purpose}"`);
    setMessageType('success');
    setRecipient('');
    setAmount('');
    setPurpose('');
    setShowAllocateFundsForm(false);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };
  
  const handleAllocateTokens = (e) => {
    e.preventDefault();
    if (!recipient || !amount || !purpose || !tokenAddress) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }
    
    // Find token name for the message
    const token = mockTokens.find(t => t.id === tokenAddress);
    const tokenName = token ? token.name.split(' ')[0] : 'tokens';
    
    // Simulate token allocation
    setMessage(`Successfully allocated ${amount} ${tokenName} to ${recipient} for "${purpose}"`);
    setMessageType('success');
    setRecipient('');
    setAmount('');
    setPurpose('');
    setTokenAddress('');
    setShowAllocateTokensForm(false);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
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
          <div className="treasury-stats">
            <div className="treasury-stat">
              <span className="label">ETH Balance</span>
              <span className="value">{treasuryData.ethBalance} ETH</span>
            </div>
            <div className="treasury-stat">
              <span className="label">GOV Balance</span>
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
          
          <div className="treasury-actions">
            <button 
              className="treasury-action-button allocate-funds-button"
              onClick={() => {
                setShowAllocateFundsForm(true);
                setShowAllocateTokensForm(false);
              }}
            >
              Allocate ETH
            </button>
            <button 
              className="treasury-action-button allocate-tokens-button"
              onClick={() => {
                setShowAllocateTokensForm(true);
                setShowAllocateFundsForm(false);
              }}
            >
              Allocate Tokens
            </button>
          </div>
        </div>
        
        <div className="treasury-card">
          <h2>Financial Metrics</h2>
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
        </div>
        
        {showAllocateFundsForm && (
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
                <button type="submit" className="submit-button">Allocate Funds</button>
              </div>
            </form>
          </div>
        )}
        
        {showAllocateTokensForm && (
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
                  {mockTokens.map(token => (
                    <option key={token.id} value={token.id}>
                      {token.name} - Balance: {token.balance}
                    </option>
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
                <button type="submit" className="submit-button">Allocate Tokens</button>
              </div>
            </form>
          </div>
        )}
        
        <div className="treasury-card">
          <h2>Token Holdings</h2>
          <div className="token-list">
            {mockTokens.map(token => (
              <div key={token.id} className="token-item">
                <span className="token-name">{token.name}</span>
                <span className="token-balance">{token.balance} (≈ {token.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Treasury; 