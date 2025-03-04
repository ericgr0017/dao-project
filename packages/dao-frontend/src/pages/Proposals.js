import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { useLocation } from 'react-router-dom';
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

// Categories of global challenges
const challengeCategories = [
  {
    id: 'existential',
    title: 'Existential Risks',
    description: 'Addressing threats to human survival including climate change, nuclear war, pandemics, AI misuse, and cosmic risks.',
    icon: '⚠️',
    color: '#FF5252'
  },
  {
    id: 'structural',
    title: 'Structural Failures',
    description: 'Fixing broken education systems, economic inequality, ineffective governance, failing healthcare, and misinformation.',
    icon: '🏛️',
    color: '#FFC107'
  },
  {
    id: 'wellbeing',
    title: 'Human Well-Being',
    description: 'Addressing mental health crisis, loss of meaning and community, decline in trust, and purpose in an AI-driven world.',
    icon: '🧠',
    color: '#2196F3'
  },
  {
    id: 'ethical',
    title: 'Ethical Challenges',
    description: 'Navigating technological ethics, human rights violations, and overconsumption and waste.',
    icon: '⚖️',
    color: '#9C27B0'
  },
  {
    id: 'vision',
    title: 'Unified Vision',
    description: 'Combating short-term thinking, promoting global cooperation, and evolving human consciousness.',
    icon: '🔭',
    color: '#4CAF50'
  },
  {
    id: 'other',
    title: 'Other Initiatives',
    description: 'Other important initiatives that don\'t fit into the categories above.',
    icon: '🔍',
    color: '#9E9E9E'
  }
];

const Proposals = () => {
  const { address, isConnected, contracts, signer } = useWeb3();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(location.state?.category || 'other');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'all');

  // Reset selected category when navigating from Home page with a category
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  // Fetch proposals from the contract
  useEffect(() => {
    const fetchProposals = async () => {
      if (!contracts.proposalSystem) return;
      
      try {
        setIsLoading(true);
        
        // For development/demo purposes
        if (contracts.proposalSystem.isDevelopment) {
          // Use mock data with categories
          const mockProposals = [
            {
              id: '1',
              title: 'Fund Solar Panel Installation in Underserved Communities',
              description: 'This proposal aims to fund the installation of solar panels in 50 underserved communities, reducing carbon emissions and providing affordable electricity.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: 1, // Active
              forVotes: ethers.utils.parseEther('1500'),
              againstVotes: ethers.utils.parseEther('500'),
              startBlock: 100,
              endBlock: 10000,
              recipient: '0x2345678901234567890123456789012345678901',
              amount: ethers.utils.parseEther('10'),
              category: 'existential'
            },
            {
              id: '2',
              title: 'Global Vaccine Distribution Initiative',
              description: 'Support equitable distribution of vaccines to low-income countries through partnerships with international health organizations.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: 1, // Active
              forVotes: ethers.utils.parseEther('2000'),
              againstVotes: ethers.utils.parseEther('300'),
              startBlock: 200,
              endBlock: 10100,
              recipient: '0x3456789012345678901234567890123456789012',
              amount: ethers.utils.parseEther('15'),
              category: 'structural'
            },
            {
              id: '3',
              title: 'Digital Literacy Program for Rural Areas',
              description: 'Establish digital literacy programs in rural areas to bridge the digital divide and provide educational opportunities.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: 4, // Succeeded
              forVotes: ethers.utils.parseEther('2500'),
              againstVotes: ethers.utils.parseEther('200'),
              startBlock: 300,
              endBlock: 9000,
              recipient: '0x4567890123456789012345678901234567890123',
              amount: ethers.utils.parseEther('8'),
              category: 'structural'
            },
            {
              id: '4',
              title: 'Community Mental Health Support Network',
              description: 'Create a decentralized support network for mental health resources and community building to combat the growing crisis of loneliness and depression.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: 7, // Executed
              forVotes: ethers.utils.parseEther('3000'),
              againstVotes: ethers.utils.parseEther('100'),
              startBlock: 400,
              endBlock: 8000,
              recipient: '0x5678901234567890123456789012345678901234',
              amount: ethers.utils.parseEther('12'),
              category: 'wellbeing'
            },
            {
              id: '5',
              title: 'Open Source AI for Environmental Monitoring',
              description: 'Develop open-source AI tools for monitoring environmental changes and predicting climate-related disasters.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: 1, // Active
              forVotes: ethers.utils.parseEther('1800'),
              againstVotes: ethers.utils.parseEther('400'),
              startBlock: 500,
              endBlock: 10500,
              recipient: '0x6789012345678901234567890123456789012345',
              amount: ethers.utils.parseEther('20'),
              category: 'ethical'
            },
            {
              id: '6',
              title: 'Global Cooperation Framework for Climate Action',
              description: 'Fund the development of a framework to facilitate international cooperation on climate change mitigation and adaptation strategies.',
              proposer: '0x1234567890123456789012345678901234567890',
              state: 0, // Pending
              forVotes: ethers.utils.parseEther('0'),
              againstVotes: ethers.utils.parseEther('0'),
              startBlock: 600,
              endBlock: 11000,
              recipient: '0x7890123456789012345678901234567890123456',
              amount: ethers.utils.parseEther('18'),
              category: 'vision'
            }
          ];
          
          setProposals(mockProposals);
        } else {
          // Fetch real proposals from the contract
          const proposalCount = await contracts.proposalSystem.getProposalCount();
          const fetchedProposals = [];
          
          for (let i = 0; i < proposalCount.toNumber(); i++) {
            try {
              const proposal = await contracts.proposalSystem.getProposal(i);
              
              // Try to parse any metadata from the description (including category)
              let category = 'other';
              let cleanDescription = proposal.description;
              
              try {
                // Check if the description contains JSON metadata
                if (proposal.description.includes('{"category":')) {
                  const metadataStart = proposal.description.indexOf('{"category":');
                  const metadataEnd = proposal.description.indexOf('}', metadataStart) + 1;
                  const metadataStr = proposal.description.substring(metadataStart, metadataEnd);
                  const metadata = JSON.parse(metadataStr);
                  
                  if (metadata.category) {
                    category = metadata.category;
                    // Remove the metadata from the description
                    cleanDescription = proposal.description.replace(metadataStr, '').trim();
                  }
                }
              } catch (error) {
                console.error("Error parsing proposal metadata:", error);
              }
              
              fetchedProposals.push({
                id: i.toString(),
                title: proposal.title || `Proposal ${i}`,
                description: cleanDescription,
                proposer: proposal.proposer,
                state: proposal.state,
                forVotes: proposal.forVotes,
                againstVotes: proposal.againstVotes,
                startBlock: proposal.startBlock.toNumber(),
                endBlock: proposal.endBlock.toNumber(),
                recipient: proposal.recipient,
                amount: proposal.amount,
                category: category
              });
            } catch (error) {
              console.error(`Error fetching proposal ${i}:`, error);
            }
          }
          
          setProposals(fetchedProposals);
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setMessage("Error fetching proposals. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProposals();
  }, [contracts.proposalSystem]);

  // Handle creating a new proposal
  const handleCreateProposal = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setMessage("Please connect your wallet to create a proposal.");
      return;
    }
    
    if (!title || !description || !recipient || !amount) {
      setMessage("Please fill in all fields.");
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage("Creating proposal...");
      
      // Add category metadata to the description
      const descriptionWithMetadata = `${description}\n\n{"category":"${category}"}`;
      
      if (contracts.proposalSystem.isDevelopment) {
        // Mock proposal creation
        setTimeout(() => {
          const newProposal = {
            id: (proposals.length + 1).toString(),
            title,
            description,
            proposer: address,
            state: 0, // Pending
            forVotes: ethers.utils.parseEther('0'),
            againstVotes: ethers.utils.parseEther('0'),
            startBlock: 1000,
            endBlock: 10000,
            recipient,
            amount: ethers.utils.parseEther(amount),
            category
          };
          
          setProposals([...proposals, newProposal]);
          setMessage("Proposal created successfully!");
          setTitle('');
          setDescription('');
          setRecipient('');
          setAmount('');
          setCategory('other');
          setShowForm(false);
          setIsLoading(false);
        }, 1000);
      } else {
        // Create proposal on the contract
        const amountInWei = ethers.utils.parseEther(amount);
        const tx = await contracts.proposalSystem.createProposal(
          title,
          descriptionWithMetadata,
          recipient,
          amountInWei
        );
        
        await tx.wait();
        
        setMessage("Proposal created successfully!");
        setTitle('');
        setDescription('');
        setRecipient('');
        setAmount('');
        setCategory('other');
        setShowForm(false);
        
        // Refresh proposals
        const proposalCount = await contracts.proposalSystem.getProposalCount();
        const newProposalId = proposalCount.sub(1).toString();
        const newProposal = await contracts.proposalSystem.getProposal(newProposalId);
        
        setProposals([...proposals, {
          id: newProposalId,
          title,
          description,
          proposer: address,
          state: newProposal.state,
          forVotes: newProposal.forVotes,
          againstVotes: newProposal.againstVotes,
          startBlock: newProposal.startBlock.toNumber(),
          endBlock: newProposal.endBlock.toNumber(),
          recipient,
          amount: amountInWei,
          category
        }]);
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      setMessage("Error creating proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date from block number (mock implementation)
  const formatDate = (blockNumber) => {
    // In a real implementation, you would convert block number to timestamp
    // For now, just return a mock date
    const now = new Date();
    const futureDate = new Date(now.getTime() + blockNumber * 1000);
    return futureDate.toLocaleDateString();
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Filter proposals by category
  const filteredProposals = selectedCategory === 'all' 
    ? proposals 
    : proposals.filter(proposal => proposal.category === selectedCategory);

  // Get category details by ID
  const getCategoryById = (categoryId) => {
    return challengeCategories.find(cat => cat.id === categoryId) || challengeCategories[6]; // Default to "Other"
  };

  return (
    <div className="proposals-container">
      <div className="proposals-header">
        <h1>Proposals</h1>
        <button 
          className="create-proposal-btn"
          onClick={() => setShowForm(!showForm)}
          disabled={!isConnected}
        >
          {showForm ? 'Cancel' : 'Create Proposal'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="proposal-form-container">
          <h2>Create New Proposal</h2>
          <form onSubmit={handleCreateProposal} className="proposal-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter proposal title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {challengeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your proposal"
                rows="4"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="recipient">Recipient Address</label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount (ETH)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                min="0"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      )}

      <div className="category-filter">
        <h3>Filter by Category:</h3>
        <div className="category-buttons">
          <button 
            className={`category-btn all ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span className="category-icon">🔍</span>
            All Categories
          </button>
          {challengeCategories.map(cat => (
            <button 
              key={cat.id}
              className={`category-btn ${cat.id} ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !proposals.length ? (
        <div className="loading">Loading proposals...</div>
      ) : (
        <>
          {filteredProposals.length === 0 ? (
            <div className="no-proposals">
              <p>No proposals found in this category.</p>
            </div>
          ) : (
            <div className="proposals-grid">
              {filteredProposals.map((proposal) => {
                const categoryInfo = getCategoryById(proposal.category);
                return (
                  <div key={proposal.id} className="proposal-card">
                    <div 
                      className={`proposal-category-tag ${proposal.category}`}
                    >
                      <span className="category-icon">{categoryInfo.icon}</span>
                      {categoryInfo.title}
                    </div>
                    <h3 className="proposal-title">{proposal.title}</h3>
                    <p className="proposal-description">{proposal.description}</p>
                    <div className="proposal-details">
                      <div className="proposal-detail">
                        <span className="detail-label">Status:</span>
                        <span className={`proposal-state ${getProposalStateClass(proposal.state)}`}>
                          {getProposalStateString(proposal.state)}
                        </span>
                      </div>
                      <div className="proposal-detail">
                        <span className="detail-label">Requested:</span>
                        <span className="detail-value">
                          {ethers.utils.formatEther(proposal.amount)} ETH
                        </span>
                      </div>
                      <div className="proposal-detail">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">{formatDate(proposal.endBlock)}</span>
                      </div>
                    </div>
                    <div className="proposal-votes">
                      <div className="vote-bar">
                        <div 
                          className="for-votes"
                          style={{ 
                            width: `${proposal.forVotes.gt(0) || proposal.againstVotes.gt(0) 
                              ? proposal.forVotes.mul(100).div(proposal.forVotes.add(proposal.againstVotes)).toNumber() 
                              : 0}%` 
                          }}
                        ></div>
                        <div 
                          className="against-votes"
                          style={{ 
                            width: `${proposal.forVotes.gt(0) || proposal.againstVotes.gt(0) 
                              ? proposal.againstVotes.mul(100).div(proposal.forVotes.add(proposal.againstVotes)).toNumber() 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="vote-counts">
                        <span className="for-count">
                          For: {ethers.utils.formatEther(proposal.forVotes)}
                        </span>
                        <span className="against-count">
                          Against: {ethers.utils.formatEther(proposal.againstVotes)}
                        </span>
                      </div>
                    </div>
                    {proposal.state === 1 && isConnected && (
                      <div className="vote-actions">
                        <button 
                          className="vote-btn vote-for"
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              if (!contracts.proposalSystem.isDevelopment) {
                                const tx = await contracts.proposalSystem.vote(proposal.id, true);
                                await tx.wait();
                              }
                              // Update the proposal in the UI
                              const updatedProposals = proposals.map(p => {
                                if (p.id === proposal.id) {
                                  return {
                                    ...p,
                                    forVotes: p.forVotes.add(ethers.utils.parseEther('100')) // Mock vote amount
                                  };
                                }
                                return p;
                              });
                              setProposals(updatedProposals);
                              setMessage("Vote cast successfully!");
                            } catch (error) {
                              console.error("Error voting:", error);
                              setMessage("Error casting vote. Please try again.");
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          Vote For
                        </button>
                        <button 
                          className="vote-btn vote-against"
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              if (!contracts.proposalSystem.isDevelopment) {
                                const tx = await contracts.proposalSystem.vote(proposal.id, false);
                                await tx.wait();
                              }
                              // Update the proposal in the UI
                              const updatedProposals = proposals.map(p => {
                                if (p.id === proposal.id) {
                                  return {
                                    ...p,
                                    againstVotes: p.againstVotes.add(ethers.utils.parseEther('100')) // Mock vote amount
                                  };
                                }
                                return p;
                              });
                              setProposals(updatedProposals);
                              setMessage("Vote cast successfully!");
                            } catch (error) {
                              console.error("Error voting:", error);
                              setMessage("Error casting vote. Please try again.");
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          Vote Against
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Proposals; 