import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import './Challenges.css';

// Categories of global challenges
export const challengeCategories = [
  {
    id: 'existential',
    title: 'Existential Risks',
    description: 'Addressing threats to human survival including climate change, nuclear war, pandemics, AI misuse, and cosmic risks.',
    icon: '⚠️',
    color: '#FF5252',
    challenges: [
      {
        id: 'climate-change',
        title: 'Climate Change',
        description: 'Mitigating and adapting to the effects of global climate change through renewable energy, carbon capture, and sustainable practices.',
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80'
      },
      {
        id: 'nuclear-threats',
        title: 'Nuclear Threats',
        description: 'Reducing the risk of nuclear war and accidents through arms control, non-proliferation, and international cooperation.',
        image: 'https://images.unsplash.com/photo-1576974121842-7fe367602ab3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'pandemic-prevention',
        title: 'Pandemic Prevention',
        description: 'Building global systems to prevent, detect, and rapidly respond to emerging infectious disease threats.',
        image: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80'
      },
      {
        id: 'ai-safety',
        title: 'AI Safety',
        description: 'Ensuring advanced AI systems remain aligned with human values and intentions as they become more capable.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80'
      },
      {
        id: 'asteroid-defense',
        title: 'Asteroid Defense',
        description: 'Developing technologies and systems to detect and deflect potentially hazardous near-Earth objects.',
        image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80'
      }
    ]
  },
  {
    id: 'structural',
    title: 'Structural Failures',
    description: 'Fixing broken education systems, economic inequality, ineffective governance, failing healthcare, and misinformation.',
    icon: '🏛️',
    color: '#FFC107',
    challenges: [
      {
        id: 'education-reform',
        title: 'Education Reform',
        description: 'Transforming education systems to better prepare people for the challenges and opportunities of the 21st century.',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80'
      },
      {
        id: 'economic-equality',
        title: 'Economic Equality',
        description: 'Addressing growing wealth inequality and creating more inclusive economic systems that work for everyone.',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
      },
      {
        id: 'governance-innovation',
        title: 'Governance Innovation',
        description: 'Developing new models of governance that are more responsive, transparent, and effective in addressing complex challenges.',
        image: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'healthcare-access',
        title: 'Healthcare Access',
        description: 'Ensuring everyone has access to quality healthcare services without financial hardship.',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80'
      },
      {
        id: 'information-integrity',
        title: 'Information Integrity',
        description: 'Combating misinformation and disinformation while promoting high-quality information ecosystems.',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      }
    ]
  },
  {
    id: 'wellbeing',
    title: 'Human Well-Being',
    description: 'Addressing mental health crisis, loss of meaning and community, decline in trust, and purpose in an AI-driven world.',
    icon: '🧠',
    color: '#2196F3',
    challenges: [
      {
        id: 'mental-health',
        title: 'Mental Health',
        description: 'Addressing the growing global mental health crisis through prevention, treatment, and destigmatization.',
        image: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'community-building',
        title: 'Community Building',
        description: 'Strengthening social connections and rebuilding community ties in an increasingly isolated world.',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'trust-restoration',
        title: 'Trust Restoration',
        description: 'Rebuilding trust in institutions, experts, and each other to enable collective action on shared challenges.',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80'
      },
      {
        id: 'meaningful-work',
        title: 'Meaningful Work',
        description: 'Creating opportunities for fulfilling work and purpose in an era of increasing automation and AI.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'digital-wellbeing',
        title: 'Digital Wellbeing',
        description: 'Promoting healthy relationships with technology and mitigating the negative impacts of digital life.',
        image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      }
    ]
  },
  {
    id: 'ethical',
    title: 'Ethical Challenges',
    description: 'Navigating technological ethics, human rights violations, and overconsumption and waste.',
    icon: '⚖️',
    color: '#9C27B0',
    challenges: [
      {
        id: 'tech-ethics',
        title: 'Tech Ethics',
        description: 'Developing ethical frameworks and governance for emerging technologies like AI, biotech, and neurotechnology.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80'
      },
      {
        id: 'human-rights',
        title: 'Human Rights',
        description: 'Protecting and advancing human rights globally, with special focus on vulnerable populations and emerging threats.',
        image: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
      },
      {
        id: 'sustainable-consumption',
        title: 'Sustainable Consumption',
        description: 'Transforming consumption patterns and reducing waste to operate within planetary boundaries.',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'ethical-ai',
        title: 'Ethical AI',
        description: 'Ensuring AI systems are developed and deployed in ways that are fair, transparent, and respect human autonomy.',
        image: 'https://images.unsplash.com/photo-1677442135136-760c813a743d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'digital-rights',
        title: 'Digital Rights',
        description: 'Protecting privacy, free expression, and other fundamental rights in the digital realm.',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      }
    ]
  },
  {
    id: 'vision',
    title: 'Unified Vision',
    description: 'Combating short-term thinking, promoting global cooperation, and evolving human consciousness.',
    icon: '🔭',
    color: '#4CAF50',
    challenges: [
      {
        id: 'long-term-planning',
        title: 'Long-term Planning',
        description: 'Developing institutions and decision-making processes that account for the long-term future and future generations.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'global-cooperation',
        title: 'Global Cooperation',
        description: 'Strengthening international cooperation and governance to address shared global challenges.',
        image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'consciousness-evolution',
        title: 'Consciousness Evolution',
        description: 'Fostering the development of human consciousness, wisdom, and compassion to meet the challenges of our time.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'shared-values',
        title: 'Shared Values',
        description: 'Developing shared values and ethical frameworks that can unite humanity across cultural differences.',
        image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'future-visioning',
        title: 'Future Visioning',
        description: 'Creating compelling, positive visions of the future to inspire action and guide development.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80'
      }
    ]
  }
];

// Helper function to get proposal state string
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

const Challenges = () => {
  const [activeCategory, setActiveCategory] = useState('existential');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { address, isConnected, contracts } = useWeb3();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    fundedProposals: 0,
    totalFunding: ethers.utils.parseEther('0')
  });

  // Fetch proposals from the contract
  useEffect(() => {
    const fetchProposals = async () => {
      if (!contracts.proposalSystem) return;
      
      try {
        setLoading(true);
        
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
              category: 'existential'
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
          
          // Calculate stats
          const totalProposals = mockProposals.length;
          const activeProposals = mockProposals.filter(p => p.state === 1).length;
          const fundedProposals = mockProposals.filter(p => p.state === 7).length;
          const totalFunding = mockProposals
            .filter(p => p.state === 7)
            .reduce((sum, p) => sum.add(p.amount), ethers.utils.parseEther('0'));
          
          setStats({
            totalProposals,
            activeProposals,
            fundedProposals,
            totalFunding
          });
        } else {
          // Fetch real proposals from the contract
          // ... (implementation would be similar to the Proposals.js file)
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setMessage({ type: 'error', text: 'Error fetching proposals. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposals();
  }, [contracts.proposalSystem]);

  // Format date from block number (mock implementation)
  const formatDate = (blockNumber) => {
    // In a real implementation, you would convert block number to timestamp
    // For now, just return a mock date
    const now = new Date();
    const futureDate = new Date(now.getTime() + blockNumber * 1000);
    return futureDate.toLocaleDateString();
  };

  // Filter proposals by category
  const filteredProposals = proposals.filter(proposal => proposal.category === activeCategory);

  // Get category details by ID
  const getCategoryById = (categoryId) => {
    return challengeCategories.find(cat => cat.id === categoryId) || challengeCategories[0];
  };

  // Get current category
  const currentCategory = getCategoryById(activeCategory);

  // Add this function to handle navigation to challenge detail page
  const handleViewChallenge = (categoryId, challengeId) => {
    navigate(`/challenges/${categoryId}/${challengeId}`);
  };

  return (
    <div className="challenges-container">
      <div className="challenges-header">
        <h1>Global Challenges</h1>
        <p>Explore and contribute to solutions for humanity's most pressing challenges</p>
      </div>

      {message.text && (
        <div className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      <div className="challenges-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProposals}</div>
          <div className="stat-label">Total Initiatives</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeProposals}</div>
          <div className="stat-label">Active Proposals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.fundedProposals}</div>
          <div className="stat-label">Funded Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{ethers.utils.formatEther(stats.totalFunding)} ETH</div>
          <div className="stat-label">Total Funding</div>
        </div>
      </div>

      <div className="challenges-tabs">
        {challengeCategories.map(category => (
          <button
            key={category.id}
            className={`challenge-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
            style={{ 
              '--tab-color': category.color,
              borderColor: activeCategory === category.id ? category.color : 'transparent'
            }}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-title">{category.title}</span>
          </button>
        ))}
      </div>

      <div className="challenge-content">
        <div className="challenge-info">
          <h2 style={{ color: currentCategory.color }}>{currentCategory.title}</h2>
          <p>{currentCategory.description}</p>
          
          <div className="specific-challenges">
            <h3>Explore Specific Challenges</h3>
            <div className="challenges-grid">
              {currentCategory.challenges.map((challenge) => (
                <div className="challenge-card" key={challenge.id}>
                  <div className="challenge-card-image" style={{ backgroundImage: `url(${challenge.image})` }}>
                    <div className="challenge-card-overlay"></div>
                  </div>
                  <div className="challenge-card-content">
                    <h4>{challenge.title}</h4>
                    <p>{challenge.description}</p>
                    <button 
                      className="view-challenge-btn"
                      onClick={() => handleViewChallenge(activeCategory, challenge.id)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="challenge-actions">
            <button 
              className="primary-btn"
              onClick={() => navigate('/proposals', { state: { category: activeCategory } })}
              style={{ backgroundColor: currentCategory.color }}
            >
              View All Proposals
            </button>
            <button 
              className="secondary-btn"
              onClick={() => navigate('/proposals', { state: { category: activeCategory, showForm: true } })}
              disabled={!isConnected}
            >
              Create Proposal
            </button>
          </div>
        </div>

        <div className="challenge-proposals">
          <h3>Recent Proposals</h3>
          
          {loading ? (
            <div className="loading">Loading proposals...</div>
          ) : (
            <>
              {filteredProposals.length === 0 ? (
                <div className="no-proposals">
                  <p>No proposals found in this category.</p>
                  <button 
                    className="create-first-btn"
                    onClick={() => navigate('/proposals', { state: { category: activeCategory, showForm: true } })}
                    disabled={!isConnected}
                  >
                    Create the First Proposal
                  </button>
                </div>
              ) : (
                <div className="proposal-list">
                  {filteredProposals.map((proposal) => (
                    <div key={proposal.id} className="proposal-item">
                      <div className="proposal-header">
                        <h4>{proposal.title}</h4>
                        <span className={`proposal-state ${getProposalStateClass(proposal.state)}`}>
                          {getProposalStateString(proposal.state)}
                        </span>
                      </div>
                      <p className="proposal-description">{proposal.description.substring(0, 150)}...</p>
                      <div className="proposal-meta">
                        <span className="proposal-funding">{ethers.utils.formatEther(proposal.amount)} ETH</span>
                        <span className="proposal-date">Ends: {formatDate(proposal.endBlock)}</span>
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
                      <div className="proposal-actions">
                        <button 
                          className="vote-btn"
                          onClick={() => navigate(`/proposals/${proposal.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges; 