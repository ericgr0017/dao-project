// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../reputation/ReputationSystem.sol";

/**
 * @title ProposalSystem
 * @dev Governance system for the DAO with quadratic voting and reputation-based weighting
 */
contract ProposalSystem is 
    Governor, 
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl 
{
    using SafeMath for uint256;
    
    // Proposal stake amount
    uint256 public proposalStake; 
    
    // Reputation system contract
    ReputationSystem public reputationSystem;
    
    // Reputation weight factor (0-100)
    // 0 = only token voting, 100 = equal weight between tokens and reputation
    uint256 public reputationWeightFactor;
    
    // Quadratic voting factor (0-100)
    // 0 = linear voting, 100 = fully quadratic
    uint256 public quadraticVotingFactor;
    
    // Mapping to track if a user has voted on a proposal
    mapping(uint256 => mapping(address => bool)) private _hasVoted;
    
    // Mapping to track vote weights
    mapping(uint256 => mapping(address => uint256)) private _voteWeights;
    
    // Events
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        string title,
        string description,
        uint256 stake
    );
    
    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        uint8 support,
        uint256 tokenWeight,
        uint256 reputationWeight,
        uint256 quadraticWeight
    );
    
    /**
     * @dev Constructor for the ProposalSystem
     * @param _token Governance token
     * @param _timelock Timelock controller
     * @param _quorumPercentage Percentage of total supply needed for quorum
     * @param _votingPeriod Duration of voting in blocks
     * @param _votingDelay Delay before voting starts in blocks
     * @param _proposalStake Amount of tokens required to submit a proposal
     * @param _reputationSystem Address of the reputation system contract
     * @param _reputationWeightFactor Weight factor for reputation (0-100)
     * @param _quadraticVotingFactor Weight factor for quadratic voting (0-100)
     */
    constructor(
        ERC20Votes _token,
        TimelockController _timelock,
        uint256 _quorumPercentage,
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _proposalStake,
        ReputationSystem _reputationSystem,
        uint256 _reputationWeightFactor,
        uint256 _quadraticVotingFactor
    )
        Governor("Problem Solving DAO")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {
        require(_reputationWeightFactor <= 100, "Reputation weight factor too high");
        require(_quadraticVotingFactor <= 100, "Quadratic voting factor too high");
        
        proposalStake = _proposalStake;
        reputationSystem = _reputationSystem;
        reputationWeightFactor = _reputationWeightFactor;
        quadraticVotingFactor = _quadraticVotingFactor;
    }
    
    /**
     * @dev Override the castVote function to implement quadratic voting and reputation weighting
     * @param proposalId ID of the proposal
     * @param support Support value for the vote (0=against, 1=for, 2=abstain)
     */
    function castVote(uint256 proposalId, uint8 support) 
        public 
        override 
        returns (uint256) 
    {
        require(!_hasVoted[proposalId][msg.sender], "Already voted");
        require(state(proposalId) == ProposalState.Active, "Proposal not active");
        
        // Get token-based voting weight
        uint256 tokenWeight = getVotes(msg.sender, proposalSnapshot(proposalId));
        
        // Get reputation-based voting weight
        uint256 reputationWeight = reputationSystem.getReputation(msg.sender);
        
        // Calculate combined weight with reputation factor
        uint256 combinedWeight = tokenWeight;
        if (reputationWeightFactor > 0 && reputationWeight > 0) {
            // Scale reputation to be comparable to token weight
            uint256 scaledReputation = reputationWeight.mul(tokenWeight).div(
                reputationSystem.getTotalReputation()
            );
            
            // Apply reputation weight factor
            uint256 reputationComponent = scaledReputation.mul(reputationWeightFactor).div(100);
            combinedWeight = tokenWeight.add(reputationComponent);
        }
        
        // Apply quadratic voting if factor > 0
        uint256 finalWeight = combinedWeight;
        if (quadraticVotingFactor > 0 && combinedWeight > 0) {
            // Calculate square root component
            uint256 sqrtWeight = sqrt(combinedWeight);
            
            // Mix linear and quadratic based on factor
            uint256 quadraticComponent = sqrtWeight.mul(quadraticVotingFactor).div(100);
            uint256 linearComponent = combinedWeight.mul(100 - quadraticVotingFactor).div(100);
            
            finalWeight = linearComponent.add(quadraticComponent);
        }
        
        // Record vote
        _countVote(proposalId, msg.sender, support, finalWeight);
        _hasVoted[proposalId][msg.sender] = true;
        _voteWeights[proposalId][msg.sender] = finalWeight;
        
        emit VoteCast(
            msg.sender,
            proposalId,
            support,
            tokenWeight,
            reputationWeight,
            finalWeight
        );
        
        return finalWeight;
    }
    
    /**
     * @dev Get the voting weight for a specific vote
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Weight of the vote
     */
    function getVoteWeight(uint256 proposalId, address voter) 
        external 
        view 
        returns (uint256) 
    {
        require(_hasVoted[proposalId][voter], "Has not voted");
        return _voteWeights[proposalId][voter];
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return True if the address has voted
     */
    function hasVoted(uint256 proposalId, address voter) 
        public 
        view 
        override 
        returns (bool) 
    {
        return _hasVoted[proposalId][voter];
    }
    
    /**
     * @dev Set the reputation weight factor
     * @param newFactor New reputation weight factor (0-100)
     */
    function setReputationWeightFactor(uint256 newFactor) external onlyGovernance {
        require(newFactor <= 100, "Factor too high");
        reputationWeightFactor = newFactor;
    }
    
    /**
     * @dev Set the quadratic voting factor
     * @param newFactor New quadratic voting factor (0-100)
     */
    function setQuadraticVotingFactor(uint256 newFactor) external onlyGovernance {
        require(newFactor <= 100, "Factor too high");
        quadraticVotingFactor = newFactor;
    }
    
    /**
     * @dev Set the proposal stake amount
     * @param newStake New stake amount
     */
    function setProposalStake(uint256 newStake) external onlyGovernance {
        proposalStake = newStake;
    }
    
    /**
     * @dev Calculate the square root of a number
     * @param x The number to calculate the square root of
     * @return y The square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
    // Override required functions
    
    function votingDelay() public view override returns (uint256) {
        return 1; // 1 block
    }
    
    function votingPeriod() public view override returns (uint256) {
        return 45818; // ~1 week
    }
    
    function proposalThreshold() public view override returns (uint256) {
        return proposalStake;
    }
} 