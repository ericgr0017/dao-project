import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import './Solutions.css';

const Solutions = () => {
  const navigate = useNavigate();
  const { contracts } = useWeb3();
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Solutions' },
    { id: 'climate', name: 'Climate Change' },
    { id: 'health', name: 'Global Health' },
    { id: 'education', name: 'Education' },
    { id: 'poverty', name: 'Poverty Reduction' },
    { id: 'equality', name: 'Equality & Inclusion' },
    { id: 'technology', name: 'Technology & Innovation' },
    { id: 'governance', name: 'Governance & Democracy' },
    { id: 'other', name: 'Other Solutions' }
  ];

  // Mock solutions data - in a real app, this would come from a contract or API
  const mockSolutions = [
    {
      id: 1,
      title: 'Decentralized Carbon Credit Marketplace',
      category: 'climate',
      description: 'A blockchain-based platform that enables transparent tracking and trading of carbon credits, incentivizing carbon reduction projects worldwide.',
      impact: 'Potential to reduce global carbon emissions by 2% annually through improved efficiency and transparency in carbon markets.',
      status: 'In Development',
      fundingReceived: '120,000 DAI',
      proposalId: 'PROP-001',
      contributors: 24,
      imageUrl: 'https://images.unsplash.com/photo-1569950044272-6af6907de607?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 2,
      title: 'Decentralized Healthcare Records System',
      category: 'health',
      description: 'A secure, patient-controlled electronic health record system that enables seamless sharing of medical data across healthcare providers while maintaining privacy.',
      impact: 'Improved healthcare outcomes through better coordination of care, reduced medical errors, and enhanced patient engagement.',
      status: 'Active',
      fundingReceived: '85,000 DAI',
      proposalId: 'PROP-007',
      contributors: 18,
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 3,
      title: 'Microfinance DAO for Underserved Communities',
      category: 'poverty',
      description: 'A decentralized autonomous organization that provides microloans to entrepreneurs in underserved communities, with governance decisions made by community members.',
      impact: 'Economic empowerment for thousands of small business owners, creating jobs and reducing poverty in target communities.',
      status: 'Active',
      fundingReceived: '150,000 DAI',
      proposalId: 'PROP-012',
      contributors: 32,
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 4,
      title: 'Decentralized Education Credential Verification',
      category: 'education',
      description: 'A blockchain-based system for verifying educational credentials, reducing fraud and enabling seamless credential verification across borders.',
      impact: 'Increased trust in educational credentials, reduced verification costs, and improved mobility for students and professionals.',
      status: 'In Development',
      fundingReceived: '75,000 DAI',
      proposalId: 'PROP-019',
      contributors: 15,
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1422&q=80'
    },
    {
      id: 5,
      title: 'Transparent Supply Chain Tracking',
      category: 'technology',
      description: 'A blockchain solution that enables end-to-end tracking of products from source to consumer, ensuring ethical sourcing and reducing counterfeiting.',
      impact: 'Improved supply chain transparency, reduced environmental impact, and increased consumer trust in product origins.',
      status: 'Active',
      fundingReceived: '110,000 DAI',
      proposalId: 'PROP-023',
      contributors: 27,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 6,
      title: 'Decentralized Voting Platform',
      category: 'governance',
      description: 'A secure, transparent voting system that enables verifiable elections and community decision-making without centralized control.',
      impact: 'Increased trust in democratic processes, reduced election costs, and improved accessibility for voters.',
      status: 'In Development',
      fundingReceived: '95,000 DAI',
      proposalId: 'PROP-031',
      contributors: 21,
      imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 7,
      title: 'Inclusive Financial Services Platform',
      category: 'equality',
      description: 'A decentralized platform providing financial services to unbanked and underbanked populations, with a focus on accessibility and low fees.',
      impact: 'Financial inclusion for millions of people currently excluded from traditional banking systems.',
      status: 'Active',
      fundingReceived: '130,000 DAI',
      proposalId: 'PROP-042',
      contributors: 29,
      imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'
    },
    {
      id: 8,
      title: 'Community-Owned Renewable Energy Grid',
      category: 'climate',
      description: 'A decentralized energy system that enables communities to generate, store, and trade renewable energy without reliance on centralized utilities.',
      impact: 'Reduced carbon emissions, increased energy resilience, and economic benefits for participating communities.',
      status: 'In Development',
      fundingReceived: '200,000 DAI',
      proposalId: 'PROP-055',
      contributors: 38,
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80'
    }
  ];

  // Fetch solutions from contract or use mock data
  useEffect(() => {
    const fetchSolutions = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch data from the contract
        // if (contracts && contracts.dao) {
        //   const solutionsData = await contracts.dao.getSolutions();
        //   setSolutions(solutionsData);
        // } else {
        //   // Use mock data for development
        //   setSolutions(mockSolutions);
        // }
        
        // Using mock data for now
        setTimeout(() => {
          setSolutions(mockSolutions);
          setIsLoading(false);
        }, 1000); // Simulate loading delay
      } catch (error) {
        console.error('Error fetching solutions:', error);
        setSolutions(mockSolutions);
        setIsLoading(false);
      }
    };

    fetchSolutions();
  }, [contracts, mockSolutions]);

  // Filter solutions based on selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredSolutions(solutions);
    } else {
      setFilteredSolutions(solutions.filter(solution => solution.category === selectedCategory));
    }
  }, [selectedCategory, solutions]);

  // Navigate to solution detail page
  const handleSolutionClick = (solutionId) => {
    // In a real implementation, this would navigate to a solution detail page
    // navigate(`/solutions/${solutionId}`);
    console.log(`Navigating to solution ${solutionId}`);
    // For now, just log the action since we haven't implemented the detail page
  };

  // Navigate to proposal page
  const handleViewProposal = (e, proposalId) => {
    e.stopPropagation();
    // In a real implementation, this would navigate to the proposal detail page
    // navigate(`/proposals/${proposalId}`);
    console.log(`Navigating to proposal ${proposalId}`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="page-container solutions-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container solutions-page">
      <div className="solutions-header">
        <h1>Solutions for Global Challenges</h1>
        <p className="solutions-subtitle">
          Explore innovative solutions proposed and funded by our community to address humanity's most pressing challenges.
        </p>
      </div>

      <div className="solutions-filter">
        <div className="filter-container">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select 
            id="category-filter" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        
        <div className="solutions-stats">
          <div className="stat-item">
            <span className="stat-value">{solutions.length}</span>
            <span className="stat-label">Total Solutions</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {solutions.filter(s => s.status === 'Active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {solutions.filter(s => s.status === 'In Development').length}
            </span>
            <span className="stat-label">In Development</span>
          </div>
        </div>
      </div>

      {filteredSolutions.length === 0 ? (
        <div className="no-solutions">
          <p>No solutions found for the selected category.</p>
        </div>
      ) : (
        <div className="solutions-grid">
          {filteredSolutions.map(solution => (
            <div 
              key={solution.id} 
              className="solution-card"
              onClick={() => handleSolutionClick(solution.id)}
            >
              <div className="solution-image">
                <img src={solution.imageUrl} alt={solution.title} />
                <div className="solution-status">{solution.status}</div>
              </div>
              <div className="solution-content">
                <h3 className="solution-title">{solution.title}</h3>
                <div className="solution-category">{categories.find(c => c.id === solution.category)?.name}</div>
                <p className="solution-description">{solution.description}</p>
                <div className="solution-impact">
                  <h4>Expected Impact:</h4>
                  <p>{solution.impact}</p>
                </div>
                <div className="solution-meta">
                  <div className="solution-funding">
                    <span className="meta-label">Funding:</span>
                    <span className="meta-value">{solution.fundingReceived}</span>
                  </div>
                  <div className="solution-contributors">
                    <span className="meta-label">Contributors:</span>
                    <span className="meta-value">{solution.contributors}</span>
                  </div>
                </div>
                <button 
                  className="view-proposal-btn"
                  onClick={(e) => handleViewProposal(e, solution.proposalId)}
                >
                  View Original Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="solutions-cta">
        <h2>Have an innovative solution?</h2>
        <p>Submit a proposal to receive funding and support from our community.</p>
        <button 
          className="create-proposal-btn"
          onClick={() => navigate('/proposals')}
        >
          Create a Proposal
        </button>
      </div>
    </div>
  );
};

export default Solutions; 