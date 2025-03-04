import React, { useState } from 'react';
import './Reputation.css';

const Reputation = () => {
  const [showAddContributionForm, setShowAddContributionForm] = useState(false);
  const [contributionType, setContributionType] = useState('code');
  const [contributionValue, setContributionValue] = useState('');
  const [contributionDescription, setContributionDescription] = useState('');
  const [contributionProof, setContributionProof] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Mock data for demonstration
  const reputationData = {
    totalScore: 875,
    codeContributions: 450,
    fundingContributions: 200,
    contentContributions: 125,
    governanceContributions: 100,
    rank: 12,
    percentile: 95,
    decayRate: '10% per year',
    lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  };
  
  const mockContributions = [
    {
      id: '1',
      type: 'code',
      value: 75,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      description: 'Implemented new governance voting mechanism with quadratic voting',
      proof: 'https://github.com/dao-project/pull/123'
    },
    {
      id: '2',
      type: 'funding',
      value: 50,
      timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      description: 'Contributed 5 ETH to community development fund',
      proof: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
      id: '3',
      type: 'content',
      value: 25,
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      description: 'Created comprehensive documentation for the DAO governance process',
      proof: 'https://dao-docs.example.com/governance'
    },
    {
      id: '4',
      type: 'governance',
      value: 30,
      timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
      description: 'Participated in 15 governance votes and created 2 proposals',
      proof: 'DAO Governance Records'
    }
  ];
  
  const handleAddContribution = (e) => {
    e.preventDefault();
    if (!contributionType || !contributionValue || !contributionDescription || !contributionProof) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }
    
    // Simulate adding a contribution
    setMessage(`Successfully recorded ${contributionType} contribution worth ${contributionValue} reputation points`);
    setMessageType('success');
    setContributionType('code');
    setContributionValue('');
    setContributionDescription('');
    setContributionProof('');
    setShowAddContributionForm(false);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  const getContributionTypeLabel = (type) => {
    const types = {
      code: 'Code',
      funding: 'Funding',
      content: 'Content',
      governance: 'Governance'
    };
    return types[type] || type;
  };
  
  return (
    <div className="reputation-page">
      <div className="page-header">
        <h1>Reputation</h1>
        <p className="page-description">
          View your reputation score and contribution history. Reputation is earned through various contributions to the DAO.
        </p>
      </div>
      
      {message && (
        <div className={`transaction-message ${messageType}`}>
          <p>{message}</p>
        </div>
      )}
      
      <div className="reputation-grid">
        <div className="reputation-card">
          <h2>Reputation Overview</h2>
          <div className="reputation-stats">
            <div className="reputation-stat">
              <span className="label">Total Score</span>
              <span className="value">{reputationData.totalScore}</span>
            </div>
            <div className="reputation-stat">
              <span className="label">Rank</span>
              <span className="value">#{reputationData.rank}</span>
            </div>
            <div className="reputation-stat">
              <span className="label">Percentile</span>
              <span className="value">Top {reputationData.percentile}%</span>
            </div>
            <div className="reputation-stat">
              <span className="label">Last Update</span>
              <span className="value">{formatDate(reputationData.lastUpdate)}</span>
            </div>
          </div>
          
          <div className="reputation-bar-container">
            <div 
              className="reputation-bar" 
              style={{ width: `${Math.min(100, (reputationData.totalScore / 1000) * 100)}%` }}
            ></div>
          </div>
          
          <div className="reputation-actions">
            <button 
              className="reputation-action-button add-contribution-button"
              onClick={() => setShowAddContributionForm(true)}
            >
              Add Contribution
            </button>
          </div>
        </div>
        
        <div className="reputation-card">
          <h2>Contribution Breakdown</h2>
          <div className="reputation-stats">
            <div className="reputation-stat">
              <span className="label">Code</span>
              <span className="value">{reputationData.codeContributions}</span>
            </div>
            <div className="reputation-stat">
              <span className="label">Funding</span>
              <span className="value">{reputationData.fundingContributions}</span>
            </div>
            <div className="reputation-stat">
              <span className="label">Content</span>
              <span className="value">{reputationData.contentContributions}</span>
            </div>
            <div className="reputation-stat">
              <span className="label">Governance</span>
              <span className="value">{reputationData.governanceContributions}</span>
            </div>
          </div>
          
          <div className="reputation-stats">
            <div className="reputation-stat">
              <span className="label">Decay Rate</span>
              <span className="value">{reputationData.decayRate}</span>
            </div>
          </div>
        </div>
        
        {showAddContributionForm && (
          <div className="reputation-card">
            <h2>Add Contribution</h2>
            <form onSubmit={handleAddContribution}>
              <div className="form-group">
                <label htmlFor="contributionType">Contribution Type:</label>
                <select
                  id="contributionType"
                  value={contributionType}
                  onChange={(e) => setContributionType(e.target.value)}
                  required
                >
                  <option value="code">Code</option>
                  <option value="funding">Funding</option>
                  <option value="content">Content</option>
                  <option value="governance">Governance</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="contributionValue">Value (Reputation Points):</label>
                <input
                  id="contributionValue"
                  type="number"
                  min="1"
                  value={contributionValue}
                  onChange={(e) => setContributionValue(e.target.value)}
                  placeholder="Estimated reputation value"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contributionDescription">Description:</label>
                <textarea
                  id="contributionDescription"
                  value={contributionDescription}
                  onChange={(e) => setContributionDescription(e.target.value)}
                  placeholder="Describe your contribution"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contributionProof">Proof (URL, Transaction Hash, etc.):</label>
                <input
                  id="contributionProof"
                  type="text"
                  value={contributionProof}
                  onChange={(e) => setContributionProof(e.target.value)}
                  placeholder="Link to proof of contribution"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAddContributionForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">Submit Contribution</button>
              </div>
            </form>
          </div>
        )}
        
        <div className="reputation-card">
          <h2>Recent Contributions</h2>
          {mockContributions.length === 0 ? (
            <div className="empty-contributions">
              <p>No contributions recorded yet.</p>
            </div>
          ) : (
            <div className="contribution-list">
              {mockContributions.map(contribution => (
                <div key={contribution.id} className="contribution-item">
                  <div className="contribution-header">
                    <span className={`contribution-type ${contribution.type}`}>
                      {getContributionTypeLabel(contribution.type)}
                    </span>
                    <span className="contribution-amount">+{contribution.value} points</span>
                  </div>
                  <div className="contribution-date">
                    {formatDate(contribution.timestamp)}
                  </div>
                  <div className="contribution-description">
                    {contribution.description}
                  </div>
                  <div className="contribution-proof">
                    <strong>Proof:</strong> {contribution.proof.startsWith('http') ? (
                      <a href={contribution.proof} target="_blank" rel="noopener noreferrer">
                        {contribution.proof}
                      </a>
                    ) : (
                      contribution.proof
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reputation; 