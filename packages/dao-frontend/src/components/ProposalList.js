import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import useProposals from '../hooks/useProposals';

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

const ProposalList = () => {
  const { isConnected } = useWeb3();
  const { getProposalCount, getProposal, isLoading, error } = useProposals();
  const [proposals, setProposals] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  
  useEffect(() => {
    const fetchProposals = async () => {
      if (!isConnected && process.env.NODE_ENV !== 'development') return;
      
      try {
        setFetchError(null);
        
        // For development mode, create mock proposals
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Fetching mock proposals');
          const mockProposals = [];
          try {
            for (let i = 0; i < 3; i++) {
              const proposal = await getProposal(i);
              if (proposal) mockProposals.push(proposal);
            }
            setProposals(mockProposals);
          } catch (err) {
            console.error('Error fetching mock proposals:', err);
            // Create fallback mock proposals if getProposal fails
            for (let i = 0; i < 3; i++) {
              mockProposals.push({
                id: i.toString(),
                title: `Fallback Mock Proposal ${i}`,
                description: 'This is a fallback mock proposal for development purposes.',
                proposer: '0x1234567890123456789012345678901234567890',
                state: i % 5,
                startBlock: Math.floor(Date.now() / 1000) - 86400,
                endBlock: Math.floor(Date.now() / 1000) + 86400
              });
            }
            setProposals(mockProposals);
          }
          return;
        }
        
        // For production mode
        const count = await getProposalCount();
        console.log(`Found ${count} proposals`);
        
        if (count === 0) {
          setProposals([]);
          return;
        }
        
        const proposalPromises = [];
        
        // Get the most recent 5 proposals
        const startIdx = Math.max(0, count - 5);
        for (let i = startIdx; i < count; i++) {
          proposalPromises.push(getProposal(i));
        }
        
        const fetchedProposals = await Promise.all(proposalPromises);
        // Filter out null proposals and reverse to show newest first
        const validProposals = fetchedProposals.filter(p => p !== null);
        setProposals(validProposals.reverse());
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setFetchError(err.message);
        
        // In development mode, still show mock proposals even if there's an error
        if (process.env.NODE_ENV === 'development') {
          const mockProposals = [];
          for (let i = 0; i < 3; i++) {
            mockProposals.push({
              id: i.toString(),
              title: `Mock Proposal ${i}`,
              description: 'This is a mock proposal for development purposes.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: i % 5,
              startBlock: Math.floor(Date.now() / 1000) - 86400,
              endBlock: Math.floor(Date.now() / 1000) + 86400
            });
          }
          setProposals(mockProposals);
        }
      }
    };
    
    fetchProposals();
    
    // Set up interval to refresh proposals
    const interval = setInterval(fetchProposals, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, getProposalCount, getProposal]);
  
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
  
  // Safe string truncation helper
  const truncateString = (str, maxLength) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };
  
  // Safe address formatting helper
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 10) return 'Unknown';
    try {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } catch (err) {
      return 'Invalid address';
    }
  };
  
  if (isLoading && proposals.length === 0) {
    return <div className="proposal-list loading">Loading proposals...</div>;
  }
  
  if ((error || fetchError) && proposals.length === 0 && process.env.NODE_ENV !== 'development') {
    return (
      <div className="proposal-list error">
        <div className="error-message">
          <p>{error || fetchError}</p>
          <p className="note">Note: This is a development environment. In production, this would connect to real contracts.</p>
        </div>
        <div className="proposal-actions">
          <Link to="/create-proposal" className="create-proposal-button">Create Proposal</Link>
        </div>
        <div className="empty-proposals">
          <p>No proposals available.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="proposal-list">
      {proposals.length === 0 ? (
        <div className="empty-proposals">
          <p>No proposals have been created yet.</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="dev-note">In development mode, mock proposals should be displayed. If none appear, there might be an issue with the mock data generation.</p>
          )}
        </div>
      ) : (
        proposals.map((proposal) => {
          if (!proposal || typeof proposal !== 'object') {
            console.error('Invalid proposal object:', proposal);
            return null;
          }
          
          return (
            <div 
              key={proposal.id || 'unknown'} 
              className={`proposal-card ${getProposalStateClass(proposal.state)}`}
            >
              <div className="proposal-header">
                <h3 className="proposal-title">{proposal.title || `Proposal ${proposal.id || 'Unknown'}`}</h3>
                <span className={`proposal-state ${getProposalStateClass(proposal.state)}`}>
                  {getProposalStateString(proposal.state)}
                </span>
              </div>
              
              <div className="proposal-details">
                {proposal.proposer && (
                  <div className="proposal-detail">
                    <span className="label">Proposer:</span>
                    <span className="value">{formatAddress(proposal.proposer)}</span>
                  </div>
                )}
                {proposal.startBlock && (
                  <div className="proposal-detail">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(proposal.startBlock)}</span>
                  </div>
                )}
                {proposal.endBlock && (
                  <div className="proposal-detail">
                    <span className="label">Ends:</span>
                    <span className="value">{formatDate(proposal.endBlock)}</span>
                  </div>
                )}
                {proposal.description && (
                  <div className="proposal-description">
                    <p>{truncateString(proposal.description, 100)}</p>
                  </div>
                )}
              </div>
              
              <Link to={`/proposals/${proposal.id || 0}`} className="view-proposal-link">
                View Details
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProposalList; 