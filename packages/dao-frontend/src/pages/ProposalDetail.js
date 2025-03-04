import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import useProposals from '../hooks/useProposals';
import '../styles/Proposals.css';

const ProposalDetail = () => {
  const { id } = useParams();
  const { isConnected } = useWeb3();
  const { getProposal, castVote, isLoading, error } = useProposals();
  const [proposal, setProposal] = useState(null);
  const [voteStatus, setVoteStatus] = useState('');
  const [voteError, setVoteError] = useState('');
  const [fetchError, setFetchError] = useState(null);
  
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      
      try {
        setFetchError(null);
        const fetchedProposal = await getProposal(id);
        setProposal(fetchedProposal);
      } catch (err) {
        console.error('Error fetching proposal:', err);
        setFetchError(err.message);
      }
    };
    
    fetchProposal();
  }, [id, getProposal]);
  
  const handleVote = async (support) => {
    if (!isConnected && process.env.NODE_ENV !== 'development') {
      setVoteError('Please connect your wallet to vote');
      return;
    }
    
    try {
      setVoteStatus('Submitting vote...');
      setVoteError('');
      
      const success = await castVote(id, support);
      
      if (success) {
        setVoteStatus('Vote submitted successfully!');
        
        // Refresh proposal data
        const updatedProposal = await getProposal(id);
        setProposal(updatedProposal);
      } else {
        setVoteError('Failed to submit vote');
        setVoteStatus('');
      }
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setVoteStatus('');
      }, 5000);
      
    } catch (err) {
      console.error('Error voting:', err);
      setVoteError(err.message || 'Failed to submit vote');
      setVoteStatus('');
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };
  
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 10) return 'Unknown';
    try {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } catch (err) {
      return 'Invalid address';
    }
  };
  
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
  
  if (isLoading && !proposal) {
    return <div className="proposal-detail loading">Loading proposal...</div>;
  }
  
  if ((error || fetchError) && !proposal) {
    return (
      <div className="proposal-detail error">
        <div className="error-message">
          <p>{error || fetchError}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="dev-note">
              Note: This is a development environment. Mock data will be displayed.
            </p>
          )}
        </div>
        <Link to="/proposals" className="back-button">Back to Proposals</Link>
      </div>
    );
  }
  
  if (!proposal) {
    return (
      <div className="proposal-detail not-found">
        <h2>Proposal Not Found</h2>
        <p>The proposal you're looking for doesn't exist or couldn't be loaded.</p>
        <Link to="/proposals" className="back-button">Back to Proposals</Link>
      </div>
    );
  }
  
  return (
    <div className="proposal-detail-container">
      <div className="proposal-detail-header">
        <Link to="/proposals" className="back-button">Back to Proposals</Link>
        <h1>{proposal.title}</h1>
        <span className={`proposal-state ${getProposalStateClass(proposal.state)}`}>
          {getProposalStateString(proposal.state)}
        </span>
      </div>
      
      {voteStatus && (
        <div className="transaction-status success">
          {voteStatus}
        </div>
      )}
      
      {voteError && (
        <div className="transaction-status error">
          {voteError}
        </div>
      )}
      
      <div className="proposal-detail-card">
        <div className="proposal-info">
          <div className="proposal-info-item">
            <span className="label">Proposer:</span>
            <span className="value">{formatAddress(proposal.proposer)}</span>
          </div>
          
          <div className="proposal-info-item">
            <span className="label">Created:</span>
            <span className="value">{formatDate(proposal.startBlock)}</span>
          </div>
          
          <div className="proposal-info-item">
            <span className="label">Deadline:</span>
            <span className="value">{formatDate(proposal.deadline || proposal.endBlock)}</span>
          </div>
          
          {proposal.threshold && (
            <div className="proposal-info-item">
              <span className="label">Threshold:</span>
              <span className="value">{proposal.threshold} tokens</span>
            </div>
          )}
          
          {proposal.quorumVotes && (
            <div className="proposal-info-item">
              <span className="label">Quorum:</span>
              <span className="value">{proposal.quorumVotes} tokens</span>
            </div>
          )}
        </div>
        
        <div className="proposal-description">
          <h3>Description</h3>
          <p>{proposal.description}</p>
        </div>
        
        <div className="proposal-votes">
          <h3>Votes</h3>
          
          <div className="vote-bar">
            <div 
              className="for-votes" 
              style={{ 
                width: `${proposal.forVotes ? 
                  (parseInt(proposal.forVotes) / 
                  (parseInt(proposal.forVotes) + parseInt(proposal.againstVotes || 0)) * 100) : 0}%` 
              }}
            ></div>
            <div 
              className="against-votes" 
              style={{ 
                width: `${proposal.againstVotes ? 
                  (parseInt(proposal.againstVotes) / 
                  (parseInt(proposal.forVotes || 0) + parseInt(proposal.againstVotes)) * 100) : 0}%` 
              }}
            ></div>
          </div>
          
          <div className="vote-counts">
            <div className="for">
              <span className="label">For:</span>
              <span className="value">{proposal.forVotes || 0} votes</span>
            </div>
            <div className="against">
              <span className="label">Against:</span>
              <span className="value">{proposal.againstVotes || 0} votes</span>
            </div>
          </div>
          
          {proposal.state === 1 && (isConnected || process.env.NODE_ENV === 'development') && (
            <div className="voting-buttons">
              <button 
                className="vote-button for"
                onClick={() => handleVote(1)}
                disabled={isLoading}
              >
                Vote For
              </button>
              <button 
                className="vote-button against"
                onClick={() => handleVote(0)}
                disabled={isLoading}
              >
                Vote Against
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail; 