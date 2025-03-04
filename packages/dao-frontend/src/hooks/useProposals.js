import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

const useProposals = () => {
  const { contracts, signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get proposal count
  const getProposalCount = async () => {
    if (!contracts?.proposalSystem) {
      console.log('Development mode: Contract not initialized');
      return process.env.NODE_ENV === 'development' ? 3 : 0;
    }
    
    try {
      // For development mode, return mock count
      if (process.env.NODE_ENV === 'development') {
        return 3;
      }
      
      // This is a placeholder - the actual implementation will depend on your contract
      const count = await contracts.proposalSystem.proposalCount();
      return count.toNumber();
    } catch (err) {
      console.error('Failed to get proposal count:', err);
      setError(err.message);
      return process.env.NODE_ENV === 'development' ? 3 : 0;
    }
  };
  
  // Create a proposal
  const createProposal = async (title, description, recipient, amount) => {
    if (!contracts?.proposalSystem || !signer) {
      setError('Wallet not connected or contract not initialized');
      
      // For development mode, return mock ID
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Mocking proposal creation');
        return 'mock-proposal-id';
      }
      
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // For development mode, mock the proposal
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Mocking proposal creation');
        console.log(`Title: ${title}, Description: ${description}, Recipient: ${recipient}, Amount: ${amount}`);
        setIsLoading(false);
        return 'mock-proposal-id';
      }
      
      // Format the full description with title
      const fullDescription = `${title}\n\n${description}`;
      
      // Create the proposal - adjust parameters based on your contract
      const tx = await contracts.proposalSystem.propose(
        [recipient], // targets
        [amount],    // values
        ['0x'],      // calldatas (empty for simple transfer)
        fullDescription  // description
      );
      
      const receipt = await tx.wait();
      
      // Extract proposal ID from event logs
      const proposalCreatedEvent = receipt.events.find(
        event => event.event === 'ProposalCreated'
      );
      
      const proposalId = proposalCreatedEvent?.args?.proposalId?.toString() || 'unknown-id';
      
      setIsLoading(false);
      return proposalId;
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setError(err.message);
      setIsLoading(false);
      
      // For development mode, return mock ID even on error
      if (process.env.NODE_ENV === 'development') {
        return 'mock-proposal-id';
      }
      
      return null;
    }
  };
  
  // Get proposal details
  const getProposal = async (proposalId) => {
    try {
      if (!contracts?.proposalSystem) {
        console.log('Development mode: Contract not initialized');
        return getMockProposal(proposalId);
      }
      
      // For development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockProposal(proposalId);
      }
      
      // Get proposal state
      const state = await contracts.proposalSystem.state(proposalId);
      
      // Get proposal details - this will depend on your contract implementation
      // Use optional chaining to safely access methods
      const proposalSnapshot = await contracts.proposalSystem?.proposalSnapshot?.(proposalId) || 0;
      const proposalDeadline = await contracts.proposalSystem?.proposalDeadline?.(proposalId) || 0;
      const proposalThreshold = await contracts.proposalSystem?.proposalThreshold?.() || 0;
      const quorumVotes = await contracts.proposalSystem?.quorum?.(proposalSnapshot) || 0;
      
      // Convert state number to readable string
      const stateString = getProposalStateString(state);
      
      return {
        id: proposalId.toString(),
        title: `Proposal ${proposalId}`, // Actual title would come from event logs or IPFS
        description: 'Proposal description would be stored on-chain or in IPFS',
        proposer: '0x1234567890123456789012345678901234567890', // This would come from event logs
        state: state,
        stateString: stateString,
        startBlock: proposalSnapshot.toString(),
        endBlock: proposalDeadline.toString(),
        snapshot: proposalSnapshot.toString(),
        deadline: proposalDeadline.toString(),
        threshold: ethers.utils.formatEther(proposalThreshold),
        quorumVotes: ethers.utils.formatEther(quorumVotes)
      };
    } catch (err) {
      console.error('Failed to get proposal:', err);
      setError(`Failed to get proposal: ${err.message}`);
      
      // Return mock data in case of error
      return getMockProposal(proposalId);
    }
  };
  
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
  
  // Helper function to get mock proposal data for development
  const getMockProposal = (proposalId) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = proposalId?.toString() || '0';
      
      return {
        id: id,
        title: `Mock Proposal ${id}`,
        description: 'This is a mock proposal for development purposes. It demonstrates how proposals would look in a production environment with real blockchain data.',
        proposer: '0x1234567890123456789012345678901234567890',
        state: parseInt(id) % 5, // Cycle through states 0-4
        startBlock: now - 86400, // 1 day ago
        endBlock: now + 86400,   // 1 day from now
        forVotes: '100',
        againstVotes: '50',
        snapshot: '12345678',
        deadline: (now + 86400).toString(),
        threshold: '10',
        quorumVotes: '100'
      };
    } catch (error) {
      console.error('Error creating mock proposal:', error);
      // Return a minimal valid proposal object if there's an error
      return {
        id: proposalId?.toString() || '0',
        title: 'Fallback Mock Proposal',
        description: 'This is a fallback mock proposal.',
        proposer: '0x1234567890123456789012345678901234567890',
        state: 0,
        startBlock: Math.floor(Date.now() / 1000) - 86400,
        endBlock: Math.floor(Date.now() / 1000) + 86400
      };
    }
  };
  
  // Cast a vote on a proposal
  const castVote = async (proposalId, support) => {
    if (!contracts?.proposalSystem || !signer) {
      setError('Wallet not connected or contract not initialized');
      
      // For development mode, mock success
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode: Mocking vote on proposal ${proposalId} with support ${support}`);
        return true;
      }
      
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // For development mode, mock the vote
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode: Mocking vote on proposal ${proposalId} with support ${support}`);
        setIsLoading(false);
        return true;
      }
      
      // Cast vote (0 = against, 1 = for, 2 = abstain)
      const tx = await contracts.proposalSystem.castVote(proposalId, support);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to cast vote:', err);
      setError(err.message);
      setIsLoading(false);
      
      // For development mode, return success even on error
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      return false;
    }
  };
  
  // Get proposal data for execution
  const getProposalData = async (proposalId) => {
    // For development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        targets: ['0x1234567890123456789012345678901234567890'],
        values: [ethers.utils.parseEther('0.1')],
        calldatas: ['0x'],
        descriptionHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Mock proposal'))
      };
    }
    
    // This is a placeholder - implement based on your contract
    try {
      // Implement real contract calls here
      return {
        targets: ['0x1234567890123456789012345678901234567890'],
        values: [ethers.utils.parseEther('0.1')],
        calldatas: ['0x'],
        descriptionHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Mock proposal'))
      };
    } catch (err) {
      console.error('Failed to get proposal data:', err);
      setError(err.message);
      
      // Return mock data in case of error
      return {
        targets: ['0x1234567890123456789012345678901234567890'],
        values: [ethers.utils.parseEther('0.1')],
        calldatas: ['0x'],
        descriptionHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Mock proposal'))
      };
    }
  };
  
  return {
    isLoading,
    error,
    getProposalCount,
    createProposal,
    getProposal,
    castVote,
    getProposalData
  };
};

export default useProposals; 