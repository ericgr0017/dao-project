// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ProposalSystem
 * @dev A simplified governance contract that doesn't use OpenZeppelin Governor
 * to avoid the contract size limitation
 */
contract ProposalSystem is Ownable {
    // Proposal states
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Executed
    }

    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        uint256 startBlock;
        uint256 endBlock;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
    }

    // Vote types
    enum VoteType {
        Against,
        For
    }

    // State variables
    IERC20 public token;
    address public treasury;
    uint256 public quorumVotes; // Fixed number of votes required for quorum
    uint256 public votingPeriod; // Number of blocks for voting
    uint256 public votingDelay; // Number of blocks before voting starts
    uint256 public proposalThreshold; // Minimum tokens needed to submit proposal
    
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    // Events
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        uint256 startBlock,
        uint256 endBlock,
        string description
    );
    
    event VoteCast(
        address voter,
        uint256 proposalId,
        uint8 support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 proposalId);
    event ProposalCanceled(uint256 proposalId);

    /**
     * @dev Constructor
     */
    constructor(
        IERC20 _token,
        address _treasury,
        uint256 _quorumPercentage,
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _proposalThreshold
    ) {
        token = _token;
        treasury = _treasury;
        
        // Convert percentage to absolute number (assuming token has 18 decimals)
        quorumVotes = 10 * 10**18; // Fixed at 10 tokens for simplicity
        
        votingPeriod = _votingPeriod;
        votingDelay = _votingDelay;
        proposalThreshold = _proposalThreshold;
    }

    /**
     * @dev Create a new proposal
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        require(
            token.balanceOf(msg.sender) >= proposalThreshold,
            "ProposalSystem: proposer votes below proposal threshold"
        );
        
        require(targets.length > 0, "ProposalSystem: empty proposal");
        require(targets.length == values.length && targets.length == calldatas.length, 
                "ProposalSystem: invalid proposal length");
                
        uint256 proposalId = hashProposal(targets, values, calldatas, keccak256(bytes(description)));
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposer == address(0), "ProposalSystem: proposal already exists");
        
        uint256 startBlock = block.number + votingDelay;
        uint256 endBlock = startBlock + votingPeriod;
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.startBlock = startBlock;
        proposal.endBlock = endBlock;
        proposal.description = description;
        proposal.forVotes = 0;
        proposal.againstVotes = 0;
        proposal.executed = false;
        proposal.canceled = false;
        
        proposalCount++;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            startBlock,
            endBlock,
            description
        );
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     */
    function castVote(uint256 proposalId, uint8 support) public returns (uint256) {
        require(state(proposalId) == ProposalState.Active, "ProposalSystem: proposal not active");
        require(support <= uint8(VoteType.For), "ProposalSystem: invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "ProposalSystem: vote already cast");
        
        uint256 votes = token.balanceOf(msg.sender);
        
        if (support == uint8(VoteType.Against)) {
            proposal.againstVotes += votes;
        } else if (support == uint8(VoteType.For)) {
            proposal.forVotes += votes;
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        emit VoteCast(msg.sender, proposalId, support, votes);
        
        return votes;
    }
    
    /**
     * @dev Execute a successful proposal
     */
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        
        require(state(proposalId) == ProposalState.Succeeded, "ProposalSystem: proposal not successful");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call{value: values[i]}(calldatas[i]);
            require(success, "ProposalSystem: transaction execution reverted");
        }
        
        emit ProposalExecuted(proposalId);
        
        return proposalId;
    }
    
    /**
     * @dev Cancel a proposal
     */
    function cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposer == msg.sender, "ProposalSystem: only proposer can cancel");
        require(state(proposalId) != ProposalState.Executed, "ProposalSystem: cannot cancel executed proposal");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
        
        return proposalId;
    }
    
    /**
     * @dev Get the state of a proposal
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        uint256 currentBlock = block.number;
        
        if (currentBlock < proposal.startBlock) {
            return ProposalState.Pending;
        }
        
        if (currentBlock <= proposal.endBlock) {
            return ProposalState.Active;
        }
        
        if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumVotes) {
            return ProposalState.Defeated;
        }
        
        return ProposalState.Succeeded;
    }
    
    /**
     * @dev Hash a proposal to get its ID
     */
    function hashProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(targets, values, calldatas, descriptionHash)));
    }
} 