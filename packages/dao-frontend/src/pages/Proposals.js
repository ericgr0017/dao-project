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

// Define proposal types
const proposalTypes = [
  { id: 'funding', label: 'Funding Request (Grants, impact investments, resource allocation)' },
  { id: 'governance', label: 'Governance & Policy Change (Decision-making, voting, DAO structure)' },
  { id: 'initiative', label: 'New Initiative/Project (Select broad category below)' },
  { id: 'partnership', label: 'Partnership Proposal (Collaboration with organizations, governments, DAOs)' },
  { id: 'hiring', label: 'Hiring Request (Onboarding experts, strategists, contributors)' },
  { id: 'technology', label: 'Technology & Infrastructure Development (Tech solutions, AI, blockchain, data systems)' },
  { id: 'transparency', label: 'Transparency & Accountability (Audits, reporting, ethical standards)' },
  { id: 'other', label: 'Other (Provide details)' }
];

// Define funding types
const fundingTypes = [
  { id: 'one-time', label: 'One-time Grant' },
  { id: 'recurring', label: 'Recurring Funding' },
  { id: 'reallocation', label: 'Treasury Reallocation' },
  { id: 'none', label: 'No Funding Needed' }
];

// Define problem types
const problemTypes = [
  { id: 'crisis', label: 'Addresses an urgent global crisis' },
  { id: 'quality', label: 'Improves quality of life for millions of people' },
  { id: 'gaps', label: 'Bridges gaps in technology, governance, or resources' },
  { id: 'systemic', label: 'Creates long-term systemic change' },
  { id: 'grassroots', label: 'Supports grassroots and local movements' },
  { id: 'other', label: 'Other (Provide details)' }
];

// Define impact types
const impactTypes = [
  { id: 'direct', label: 'Directly improves lives (X number of people served or assisted)' },
  { id: 'disparities', label: 'Reduces economic/social disparities' },
  { id: 'research', label: 'Advances scientific research or medical breakthroughs' },
  { id: 'scalable', label: 'Creates scalable models for global adoption' },
  { id: 'governance', label: 'Strengthens governance, ethics, and human rights' },
  { id: 'awareness', label: 'Increases public awareness and education' },
  { id: 'other', label: 'Other (Provide details)' }
];

// Define scalability types
const scalabilityTypes = [
  { id: 'global', label: 'Can be replicated globally with minimal resources' },
  { id: 'regional', label: 'Can expand regionally before scaling worldwide' },
  { id: 'pilot', label: 'Is a pilot project to test a larger concept' },
  { id: 'immediate', label: 'Focuses on immediate impact, but needs ongoing support' },
  { id: 'other', label: 'Other (Provide details)' }
];

// Define timeline options
const timelineOptions = [
  { id: 'immediate', label: 'Immediate (within 30 days)' },
  { id: 'short', label: 'Short-term (1-3 months)' },
  { id: 'medium', label: 'Medium-term (3-6 months)' },
  { id: 'long', label: 'Long-term (6+ months)' }
];

// Define resource types
const resourceTypes = [
  { id: 'financial', label: 'Financial Support' },
  { id: 'research', label: 'Research & Development Experts' },
  { id: 'technology', label: 'Technology & Infrastructure' },
  { id: 'marketing', label: 'Marketing & Global Outreach' },
  { id: 'legal', label: 'Legal & Policy Guidance' },
  { id: 'community', label: 'Community Volunteers & Local Implementation' },
  { id: 'other', label: 'Other (Provide details)' }
];

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
        <div 
          key={step} 
          className={`step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
        >
          {step}
        </div>
      ))}
    </div>
  );
};

const Proposals = () => {
  const { address, isConnected, contracts } = useWeb3();
  const location = useLocation();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(location.state?.category || 'other');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'all');
  const [proposalType, setProposalType] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [problemSolved, setProblemSolved] = useState([]);
  const [otherProblem, setOtherProblem] = useState('');
  const [expectedImpact, setExpectedImpact] = useState([]);
  const [otherImpact, setOtherImpact] = useState('');
  const [scalability, setScalability] = useState('');
  const [timeline, setTimeline] = useState('');
  const [requiredResources, setRequiredResources] = useState([]);
  const [otherResources, setOtherResources] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalSummary, setProposalSummary] = useState('');
  const [userVotes, setUserVotes] = useState({});
  const [userProposals, setUserProposals] = useState([]);

  // Load user proposals from localStorage on component mount
  useEffect(() => {
    try {
      const savedProposals = localStorage.getItem('userProposals');
      if (savedProposals) {
        // Convert string values back to BigNumber objects
        const parsedProposals = JSON.parse(savedProposals).map(proposal => ({
          ...proposal,
          forVotes: ethers.BigNumber.from(proposal.forVotes || '0'),
          againstVotes: ethers.BigNumber.from(proposal.againstVotes || '0'),
          amount: ethers.BigNumber.from(proposal.amount || '0')
        }));
        console.log('Loaded user proposals from localStorage:', parsedProposals);
        setUserProposals(parsedProposals);
      }
    } catch (error) {
      console.error('Error loading proposals from localStorage:', error);
      // If there's an error, clear localStorage and start fresh
      localStorage.removeItem('userProposals');
    }
  }, []);

  // Save user proposals to localStorage whenever they change
  useEffect(() => {
    if (userProposals.length > 0) {
      try {
        // Convert BigNumber objects to strings before saving to localStorage
        const serializedProposals = userProposals.map(proposal => ({
          ...proposal,
          forVotes: proposal.forVotes ? proposal.forVotes.toString() : '0',
          againstVotes: proposal.againstVotes ? proposal.againstVotes.toString() : '0',
          amount: proposal.amount ? proposal.amount.toString() : '0'
        }));
        console.log('Saving user proposals to localStorage:', serializedProposals);
        localStorage.setItem('userProposals', JSON.stringify(serializedProposals));
      } catch (error) {
        console.error('Error saving proposals to localStorage:', error);
      }
    }
  }, [userProposals]);

  // Reset selected category when navigating from Home page with a category
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  // Load proposals on component mount and when userProposals change
  useEffect(() => {
    if (contracts.proposalSystem) {
      fetchProposals();
    }
  }, [contracts.proposalSystem, userProposals.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch proposals from the contract
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
        
        // Combine mock proposals with user-created proposals
        // Make sure we don't have duplicates
        const mockIds = mockProposals.map(p => p.id);
        const filteredUserProposals = userProposals.filter(p => !mockIds.includes(p.id));
        
        console.log('User proposals before combining:', filteredUserProposals);
        console.log('Mock proposals before combining:', mockProposals);
        
        const combinedProposals = [...filteredUserProposals, ...mockProposals];
        console.log('Combined proposals:', combinedProposals);
        
        setProposals(combinedProposals);
        setIsLoading(false);
        return;
      }
      
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
          } catch (err) {
            console.warn('Error parsing proposal metadata:', err);
          }
          
          fetchedProposals.push({
            id: i.toString(),
            title: proposal.title || `Proposal ${i}`,
            description: cleanDescription,
            proposer: proposal.proposer,
            state: proposal.state.toNumber(),
            forVotes: proposal.forVotes,
            againstVotes: proposal.againstVotes,
            startBlock: proposal.startBlock.toNumber(),
            endBlock: proposal.endBlock.toNumber(),
            amount: proposal.amount,
            category
          });
        } catch (err) {
          console.error(`Error fetching proposal ${i}:`, err);
        }
      }
      
      // Combine fetched proposals with user-created proposals
      // Only include user proposals that don't exist on-chain
      const onChainIds = fetchedProposals.map(p => p.id);
      const filteredUserProposals = userProposals.filter(p => !onChainIds.includes(p.id));
      const combinedProposals = [...filteredUserProposals, ...fetchedProposals];
      setProposals(combinedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setIsLoading(false);
    }
  };

  // Handle multi-select dropdown change
  const handleMultiSelectChange = (e, setter, currentValues) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setter(options);
  };

  // Generate proposal summary
  const generateProposalSummary = () => {
    // Get label texts for selected options
    const proposalTypeLabel = proposalTypes.find(t => t.id === proposalType)?.label || '';
    const categoryLabel = challengeCategories.find(c => c.id === category)?.title || '';
    const fundingTypeLabel = fundingTypes.find(f => f.id === fundingType)?.label || '';
    const scalabilityLabel = scalabilityTypes.find(s => s.id === scalability)?.label || '';
    const timelineLabel = timelineOptions.find(t => t.id === timeline)?.label || '';
    
    // Create lists for multi-select options
    const problemsList = problemSolved.map(id => {
      const label = problemTypes.find(p => p.id === id)?.label || '';
      if (id === 'other' && otherProblem) {
        return `${label}: ${otherProblem}`;
      }
      return label;
    });
    
    const impactList = expectedImpact.map(id => {
      const label = impactTypes.find(i => i.id === id)?.label || '';
      if (id === 'other' && otherImpact) {
        return `${label}: ${otherImpact}`;
      }
      return label;
    });
    
    const resourcesList = requiredResources.map(id => {
      const label = resourceTypes.find(r => r.id === id)?.label || '';
      if (id === 'other' && otherResources) {
        return `${label}: ${otherResources}`;
      }
      return label;
    });

    // Return formatted HTML
    return (
      <>
        <h4>Proposal Summary</h4>
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Type:</strong> {proposalTypeLabel}</p>
        <p><strong>Category:</strong> {categoryLabel}</p>
        <p><strong>Funding Type:</strong> {fundingTypeLabel}</p>
        {fundingType === 'financial' && amount && (
          <p><strong>Requested Amount:</strong> {amount} ETH</p>
        )}
        
        <h4>Description</h4>
        <p>{description}</p>
        
        <h4>Problems Addressed</h4>
        <ul>
          {problemsList.map((problem, index) => (
            <li key={index}>{problem}</li>
          ))}
        </ul>
        
        <h4>Expected Impact</h4>
        <ul>
          {impactList.map((impact, index) => (
            <li key={index}>{impact}</li>
          ))}
        </ul>
        
        <h4>Scalability Approach</h4>
        <p>{scalabilityLabel}</p>
        
        <h4>Implementation Timeline</h4>
        <p>{timelineLabel}</p>
        
        <h4>Required Resources</h4>
        <ul>
          {resourcesList.map((resource, index) => (
            <li key={index}>{resource}</li>
          ))}
        </ul>
      </>
    );
  };

  // Check if user can proceed to next step
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return proposalType !== '';
      case 2:
        return title.trim() !== '';
      case 3:
        return category !== '';
      case 4:
        return fundingType !== '';
      case 5:
        return problemSolved.length > 0 && (
          !problemSolved.includes('other') || otherProblem.trim() !== ''
        );
      case 6:
        return expectedImpact.length > 0 && (
          !expectedImpact.includes('other') || otherImpact.trim() !== ''
        );
      case 7:
        return scalability !== '';
      case 8:
        return timeline !== '';
      case 9:
        return requiredResources.length > 0 && (
          !requiredResources.includes('other') || otherResources.trim() !== ''
        );
      default:
        return true;
    }
  };

  // Check if proposal can be submitted
  const canSubmitProposal = () => {
    return (
      title.trim() !== '' &&
      description.trim() !== '' &&
      category !== '' &&
      proposalType !== '' &&
      fundingType !== '' &&
      problemSolved.length > 0 &&
      expectedImpact.length > 0 &&
      scalability !== '' &&
      timeline !== '' &&
      requiredResources.length > 0 &&
      (!problemSolved.includes('other') || otherProblem.trim() !== '') &&
      (!expectedImpact.includes('other') || otherImpact.trim() !== '') &&
      (!requiredResources.includes('other') || otherResources.trim() !== '')
    );
  };

  // Handle form navigation
  const handleNextStep = () => {
    if (currentStep === 9) {
      // Generate summary before going to the review step
      const summaryText = generateProposalSummary();
      setProposalSummary(summaryText);
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle proposal creation
  const handleCreateProposal = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      
      // Validate all required fields
      if (!canSubmitProposal()) {
        setMessage('Error: Please complete all required fields before submitting.');
        setIsLoading(false);
        return;
      }
      
      // Format the proposal data
      const proposalData = {
        title,
        description,
        category,
        proposalType,
        fundingType,
        amount: fundingType === 'financial' ? amount : '0',
        problemSolved,
        otherProblem,
        expectedImpact,
        otherImpact,
        scalability,
        timeline,
        requiredResources,
        otherResources
      };
      
      console.log('Creating proposal with data:', proposalData);
      
      // If we have a contract, submit the proposal
      if (contracts.proposalSystem && !contracts.proposalSystem.isDevelopment) {
        // Convert amount to wei if needed
        const amountInWei = fundingType === 'financial' && amount 
          ? ethers.utils.parseEther(amount.toString()) 
          : ethers.utils.parseEther('0');
        
        // Call the contract method
        const tx = await contracts.proposalSystem.createProposal(
          title,
          description,
          amountInWei,
          category
        );
        
        await tx.wait();
        console.log('Proposal created on blockchain:', tx.hash);
      } else {
        // Simulate proposal creation in development mode
        console.log('Development mode: Simulating proposal creation');
        
        // Create a mock proposal for development testing
        const newId = `user-${Date.now().toString()}`;
        const mockProposal = {
          id: newId,
          title,
          description,
          category,
          amount: ethers.utils.parseEther(fundingType === 'financial' && amount ? amount.toString() : '0'),
          state: 0, // Pending
          proposer: address || '0x123...', // Use connected address or mock
          startBlock: 0,
          endBlock: 10000,
          forVotes: ethers.BigNumber.from('0'),
          againstVotes: ethers.BigNumber.from('0')
        };
        
        console.log('Created new proposal:', mockProposal);
        
        // Add the mock proposal to both the local state and user proposals
        setProposals(prevProposals => [mockProposal, ...prevProposals]);
        
        // Update userProposals state with the new proposal
        setUserProposals(prevUserProposals => {
          const newProposals = [mockProposal, ...prevUserProposals];
          console.log('Updated user proposals:', newProposals);
          return newProposals;
        });
        
        // Wait for a moment to simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update UI
      setMessage('Proposal created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setProposalType('');
      setCategory('');
      setFundingType('');
      setAmount('');
      setProblemSolved([]);
      setOtherProblem('');
      setExpectedImpact([]);
      setOtherImpact('');
      setScalability('');
      setTimeline('');
      setRequiredResources([]);
      setOtherResources('');
      setProposalSummary('');
      setCurrentStep(1);
      
      // Go back to proposal list
      setShowProposalForm(false);
    } catch (error) {
      console.error('Error creating proposal:', error);
      setMessage(`Error creating proposal: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date from block number
  const formatDate = (blockNumber) => {
    // In a real implementation, you would convert block number to timestamp
    // For now, just return a mock date
    const now = new Date();
    const futureDate = new Date(now.getTime() + blockNumber * 1000);
    return futureDate.toLocaleDateString();
  };

  // Get category by ID
  const getCategoryById = (categoryId) => {
    return challengeCategories.find(cat => cat.id === categoryId) || challengeCategories[6]; // Default to "Other"
  };

  // Render the multi-step form
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3>Step 1: Select Proposal Type (Required)</h3>
            <div className="form-group">
              <label htmlFor="proposalType">Proposal Type</label>
              <select
                id="proposalType"
                value={proposalType}
                onChange={(e) => setProposalType(e.target.value)}
                required
              >
                <option value="">-- Select Proposal Type --</option>
                {proposalTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <h3>Step 2: Proposal Title & Description</h3>
            <div className="form-group">
              <label htmlFor="title">Proposal Title (Required)</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear, concise title for your proposal"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Detailed Description (Required)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive description of your proposal, including its purpose, goals, and expected outcomes"
                rows="6"
                required
              />
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <h3>Step 3: Select Challenge Category</h3>
            <div className="form-group">
              <label htmlFor="category">Challenge Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Select Challenge Category --</option>
                {challengeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.title} - {cat.description}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 4:
        return (
          <>
            <h3>Step 4: Funding & Resources</h3>
            <div className="form-group">
              <label htmlFor="fundingType">Funding Type</label>
              <select
                id="fundingType"
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value)}
                required
              >
                <option value="">-- Select Funding Type --</option>
                {fundingTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {fundingType === 'financial' && (
              <div className="form-group">
                <label htmlFor="amount">Requested Amount (ETH)</label>
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in ETH"
                />
              </div>
            )}
          </>
        );
      
      case 5:
        return (
          <>
            <h3>Step 5: What Problem Does This Solve?</h3>
            <div className="form-group">
              <label htmlFor="problemSolved">Select Problems Addressed (hold Ctrl/Cmd to select multiple)</label>
              <select
                id="problemSolved"
                multiple
                value={problemSolved}
                onChange={(e) => handleMultiSelectChange(e, setProblemSolved, problemSolved)}
                className="multi-select"
                required
              >
                {problemTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              {problemSolved.includes('other') && (
                <div className="form-group">
                  <label htmlFor="otherProblem">Please specify other problem:</label>
                  <textarea
                    id="otherProblem"
                    value={otherProblem}
                    onChange={(e) => setOtherProblem(e.target.value)}
                    placeholder="Describe the other problem this proposal addresses"
                    rows="2"
                    required
                  />
                </div>
              )}
            </div>
          </>
        );
      
      case 6:
        return (
          <>
            <h3>Step 6: Expected Impact & Measurable Outcomes</h3>
            <div className="form-group">
              <label htmlFor="expectedImpact">Select Expected Impacts (hold Ctrl/Cmd to select multiple)</label>
              <select
                id="expectedImpact"
                multiple
                value={expectedImpact}
                onChange={(e) => handleMultiSelectChange(e, setExpectedImpact, expectedImpact)}
                className="multi-select"
                required
              >
                {impactTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              {expectedImpact.includes('other') && (
                <div className="form-group">
                  <label htmlFor="otherImpact">Please specify other impact:</label>
                  <textarea
                    id="otherImpact"
                    value={otherImpact}
                    onChange={(e) => setOtherImpact(e.target.value)}
                    placeholder="Describe the other expected impact"
                    rows="2"
                    required
                  />
                </div>
              )}
            </div>
          </>
        );
      
      case 7:
        return (
          <>
            <h3>Step 7: Scalability & Growth Potential</h3>
            <div className="form-group">
              <label htmlFor="scalability">Scalability Approach</label>
              <select
                id="scalability"
                value={scalability}
                onChange={(e) => setScalability(e.target.value)}
                required
              >
                <option value="">-- Select Scalability Approach --</option>
                {scalabilityTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 8:
        return (
          <>
            <h3>Step 8: Implementation Timeline</h3>
            <div className="form-group">
              <label htmlFor="timeline">Implementation Timeline</label>
              <select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                required
              >
                <option value="">-- Select Timeline --</option>
                {timelineOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 9:
        return (
          <>
            <h3>Step 9: Required Resources & Support</h3>
            <div className="form-group">
              <label htmlFor="requiredResources">Select Required Resources (hold Ctrl/Cmd to select multiple)</label>
              <select
                id="requiredResources"
                multiple
                value={requiredResources}
                onChange={(e) => handleMultiSelectChange(e, setRequiredResources, requiredResources)}
                className="multi-select"
                required
              >
                {resourceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              {requiredResources.includes('other') && (
                <div className="form-group">
                  <label htmlFor="otherResources">Please specify other resources:</label>
                  <textarea
                    id="otherResources"
                    value={otherResources}
                    onChange={(e) => setOtherResources(e.target.value)}
                    placeholder="Describe the other resources needed"
                    rows="2"
                    required
                  />
                </div>
              )}
            </div>
          </>
        );
      
      case 10:
        // Ensure summary is generated if user navigates directly to this step
        if (!proposalSummary) {
          const summaryText = generateProposalSummary();
          setProposalSummary(summaryText);
        }
        
        return (
          <>
            <h3>Step 10: Review & Submit</h3>
            <p>Please review your proposal details before submission:</p>
            <div className="proposal-summary">
              {proposalSummary}
            </div>
            <div className="form-group" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="submit-btn" 
                onClick={handleCreateProposal}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Filter proposals by category
  const filteredProposals = selectedCategory === 'all' 
    ? proposals 
    : proposals.filter(proposal => proposal.category === selectedCategory);

  // Helper function to ensure a value is a BigNumber
  const ensureBigNumber = (value) => {
    if (!value) return ethers.BigNumber.from(0);
    if (typeof value === 'string') return ethers.BigNumber.from(value);
    if (typeof value === 'number') return ethers.BigNumber.from(value.toString());
    if (value._isBigNumber) return value;
    if (value.type === 'BigNumber') return ethers.BigNumber.from(value.hex);
    try {
      return ethers.BigNumber.from(value);
    } catch (error) {
      console.error('Error converting to BigNumber:', error, value);
      return ethers.BigNumber.from(0);
    }
  };

  return (
    <div className="proposals-container">
      <h2>Proposals</h2>
      
      {/* Toggle between proposal list and form */}
      <div className="view-toggle">
        <button 
          className={!showProposalForm ? 'active' : ''} 
          onClick={() => setShowProposalForm(false)}
        >
          View Proposals
        </button>
        <button 
          className={showProposalForm ? 'active' : ''} 
          onClick={() => setShowProposalForm(true)}
        >
          Create Proposal
        </button>
      </div>
      
      {showProposalForm ? (
        <div className="proposal-form">
          <h2>Create a New Proposal</h2>
          <p>Complete all steps to submit your proposal to the DAO community.</p>
          
          <StepIndicator currentStep={currentStep} totalSteps={10} />
          
          {renderFormStep()}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                className="prev-btn" 
                onClick={handlePrevStep}
              >
                Previous
              </button>
            )}
            
            {currentStep < 10 && (
              <button 
                className="next-btn" 
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
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
                              {ethers.utils.formatEther(ensureBigNumber(proposal.amount))} ETH
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
                                width: `${ensureBigNumber(proposal.forVotes).gt(0) || ensureBigNumber(proposal.againstVotes).gt(0) 
                                  ? ensureBigNumber(proposal.forVotes).mul(100).div(
                                      ensureBigNumber(proposal.forVotes).add(ensureBigNumber(proposal.againstVotes))
                                    ).toNumber() 
                                  : 0}%` 
                              }}
                            ></div>
                            <div 
                              className="against-votes"
                              style={{ 
                                width: `${ensureBigNumber(proposal.forVotes).gt(0) || ensureBigNumber(proposal.againstVotes).gt(0) 
                                  ? ensureBigNumber(proposal.againstVotes).mul(100).div(
                                      ensureBigNumber(proposal.forVotes).add(ensureBigNumber(proposal.againstVotes))
                                    ).toNumber() 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                          <div className="vote-counts">
                            <span className="for-count">
                              For: {Number(ethers.utils.formatEther(ensureBigNumber(proposal.forVotes))).toLocaleString()} votes
                            </span>
                            <span className="against-count">
                              Against: {Number(ethers.utils.formatEther(ensureBigNumber(proposal.againstVotes))).toLocaleString()} votes
                            </span>
                          </div>
                        </div>
                        {(proposal.state === 1 || proposal.state === 0) && isConnected && (
                          <div className="vote-actions">
                            {userVotes[proposal.id] ? (
                              <div className="user-vote-status">
                                <p>You voted: <strong>{userVotes[proposal.id] === 'for' ? 'For' : 'Against'}</strong></p>
                                <button 
                                  className="change-vote-btn"
                                  onClick={() => {
                                    try {
                                      setIsLoading(true);
                                      
                                      // Get the current vote
                                      const currentVote = userVotes[proposal.id];
                                      
                                      // Update the proposal in the UI to remove the previous vote
                                      const updatedProposals = proposals.map(p => {
                                        if (p.id === proposal.id) {
                                          let newForVotes = ensureBigNumber(p.forVotes);
                                          let newAgainstVotes = ensureBigNumber(p.againstVotes);
                                          
                                          // Remove the previous vote
                                          if (currentVote === 'for') {
                                            newForVotes = newForVotes.sub(ethers.utils.parseEther('100'));
                                          } else if (currentVote === 'against') {
                                            newAgainstVotes = newAgainstVotes.sub(ethers.utils.parseEther('100'));
                                          }
                                          
                                          return {
                                            ...p,
                                            forVotes: newForVotes,
                                            againstVotes: newAgainstVotes
                                          };
                                        }
                                        return p;
                                      });
                                      
                                      setProposals(updatedProposals);
                                      
                                      // Reset the user's vote for this proposal
                                      setUserVotes(prev => ({
                                        ...prev,
                                        [proposal.id]: null
                                      }));
                                      
                                      setMessage("You can now vote again.");
                                    } catch (error) {
                                      console.error("Error changing vote:", error);
                                      setMessage("Error changing vote. Please try again.");
                                    } finally {
                                      setIsLoading(false);
                                    }
                                  }}
                                >
                                  Change Vote
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  className="vote-btn vote-for"
                                  onClick={async () => {
                                    try {
                                      setIsLoading(true);
                                      if (!contracts.proposalSystem.isDevelopment) {
                                        const tx = await contracts.proposalSystem.vote(proposal.id, true);
                                        await tx.wait();
                                      }
                                      
                                      // Record the user's vote
                                      setUserVotes(prev => ({
                                        ...prev,
                                        [proposal.id]: 'for'
                                      }));
                                      
                                      // Update the proposal in the UI
                                      const updatedProposals = proposals.map(p => {
                                        if (p.id === proposal.id) {
                                          // Add 100 votes and update state if needed
                                          const forVotes = ensureBigNumber(p.forVotes).add(ethers.utils.parseEther('100'));
                                          
                                          // If this is the first vote, change state from Pending to Active
                                          let newState = p.state;
                                          if (p.state === 0) {
                                            newState = 1; // Change to Active
                                          }
                                          
                                          return {
                                            ...p,
                                            forVotes: forVotes,
                                            state: newState
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
                                      
                                      // Record the user's vote
                                      setUserVotes(prev => ({
                                        ...prev,
                                        [proposal.id]: 'against'
                                      }));
                                      
                                      // Update the proposal in the UI
                                      const updatedProposals = proposals.map(p => {
                                        if (p.id === proposal.id) {
                                          // Add 100 votes and update state if needed
                                          // eslint-disable-next-line no-unused-vars
                                          const forVotes = ensureBigNumber(p.forVotes);
                                          const againstVotes = ensureBigNumber(p.againstVotes).add(ethers.utils.parseEther('100'));
                                          
                                          // If this is the first vote, change state from Pending to Active
                                          let newState = p.state;
                                          if (p.state === 0) {
                                            newState = 1; // Change to Active
                                          }
                                          
                                          return {
                                            ...p,
                                            againstVotes: againstVotes,
                                            state: newState
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
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Proposals; 