import React, { useState } from 'react';
import './Proposals.css';

// Helper function to convert proposal state to readable string
const getProposalStateString = (state) => {
  const states = [
    'Pending',
    'Active',
    'Canceled',
    'Defeated',
    'Succeeded',
    'Queued',
    'Expired',
    'Executed'
  ];
  return typeof state === 'number' && state >= 0 && state < states.length 
    ? states[state] 
    : 'Unknown';
};

// Helper function to get CSS class based on proposal state
const getProposalStateClass = (state) => {
  if (typeof state === 'number') {
    const classes = {
      0: 'pending',
      1: 'active',
      2: 'canceled',
      3: 'defeated',
      4: 'succeeded',
      5: 'queued',
      6: 'expired',
      7: 'executed'
    };
    return classes[state] || 'unknown';
  } else if (typeof state === 'string') {
    return state.toLowerCase();
  }
  return 'unknown';
};

const Proposals = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  
  // Mock data for demonstration
  const mockProposals = [
    {
      id: '1',
      title: 'Fund Community Development',
      description: 'Allocate 5000 GOV tokens to fund community development initiatives.',
      proposer: '0x1234567890123456789012345678901234567890',
      state: 1, // Active
      startBlock: Math.floor(Date.now() / 1000) - 86400,
      endBlock: Math.floor(Date.now() / 1000) + 86400,
      forVotes: '3500',
      againstVotes: '1500',
      recipient: '0x2345678901234567890123456789012345678901',
      amount: '5000'
    },
    {
      id: '2',
      title: 'Upgrade Governance System',
      description: 'Implement quadratic voting to improve governance fairness.',
      proposer: '0x3456789012345678901234567890123456789012',
      state: 4, // Succeeded
      startBlock: Math.floor(Date.now() / 1000) - 172800,
      endBlock: Math.floor(Date.now() / 1000) - 86400,
      forVotes: '7500',
      againstVotes: '2500',
      recipient: '0x4567890123456789012345678901234567890123',
      amount: '2000'
    },
    {
      id: '3',
      title: 'Treasury Diversification',
      description: 'Diversify treasury holdings by allocating 10% to stable assets.',
      proposer: '0x5678901234567890123456789012345678901234',
      state: 3, // Defeated
      startBlock: Math.floor(Date.now() / 1000) - 259200,
      endBlock: Math.floor(Date.now() / 1000) - 172800,
      forVotes: '3000',
      againstVotes: '7000',
      recipient: '0x6789012345678901234567890123456789012345',
      amount: '10000'
    }
  ];
  
  const handleCreateProposal = (e) => {
    e.preventDefault();
    if (!title || !description || !recipient || !amount) {
      setMessage('Please fill in all fields');
      return;
    }
    
    // Simulate proposal creation
    setMessage(`Proposal "${title}" created successfully!`);
    setTitle('');
    setDescription('');
    setRecipient('');
    setAmount('');
    setShowForm(false);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 10) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="proposals-page">
      <div className="page-header">
        <h1>Proposals</h1>
        <p className="page-description">
          View and create governance proposals for the DAO.
        </p>
      </div>
      
      <div className="proposals-content">
        <button 
          className="create-proposal-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create Proposal'}
        </button>
        
        {showForm && (
          <div className="proposal-card">
            <h2>Create New Proposal</h2>
            <form className="proposal-form" onSubmit={handleCreateProposal}>
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter proposal title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter proposal description"
                  required
                />
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
                <label htmlFor="amount">Amount (GOV):</label>
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
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">Submit Proposal</button>
              </div>
            </form>
          </div>
        )}
        
        {message && (
          <div className="proposal-card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>{message}</p>
          </div>
        )}
        
        <div className="proposals-grid">
          {mockProposals.length === 0 ? (
            <div className="empty-proposals">
              <p>No proposals have been created yet.</p>
            </div>
          ) : (
            mockProposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className={`proposal-card ${getProposalStateClass(proposal.state)}`}
              >
                <div className="proposal-header">
                  <h3 className="proposal-title">{proposal.title}</h3>
                  <span className={`proposal-state ${getProposalStateClass(proposal.state)}`}>
                    {getProposalStateString(proposal.state)}
                  </span>
                </div>
                
                <div className="proposal-details">
                  <div className="proposal-detail">
                    <span className="label">Proposer:</span>
                    <span className="value">{formatAddress(proposal.proposer)}</span>
                  </div>
                  <div className="proposal-detail">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(proposal.startBlock)}</span>
                  </div>
                  <div className="proposal-detail">
                    <span className="label">Ends:</span>
                    <span className="value">{formatDate(proposal.endBlock)}</span>
                  </div>
                  <div className="proposal-detail">
                    <span className="label">For Votes:</span>
                    <span className="value">{proposal.forVotes} GOV</span>
                  </div>
                  <div className="proposal-detail">
                    <span className="label">Against Votes:</span>
                    <span className="value">{proposal.againstVotes} GOV</span>
                  </div>
                  <div className="proposal-detail">
                    <span className="label">Recipient:</span>
                    <span className="value">{formatAddress(proposal.recipient)}</span>
                  </div>
                  <div className="proposal-detail">
                    <span className="label">Amount:</span>
                    <span className="value">{proposal.amount} GOV</span>
                  </div>
                </div>
                
                <div className="proposal-description">
                  <p>{proposal.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Proposals; 