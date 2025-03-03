// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title ReputationSystem
 * @dev Tracks reputation scores for DAO participants based on their contributions
 * Reputation is used to weight governance votes without requiring token holdings
 */
contract ReputationSystem is AccessControl {
    using SafeMath for uint256;
    
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // Reputation types
    enum ContributionType {
        CODE,       // Code contributions
        FUNDING,    // Financial contributions
        CONTENT,    // Content/documentation contributions
        GOVERNANCE  // Governance participation
    }
    
    // Reputation data structure
    struct Reputation {
        uint256 score;                              // Total reputation score
        uint256 lastUpdateTimestamp;                // Last time reputation was updated
        mapping(ContributionType => uint256) contributions; // Contributions by type
        uint256 decayRate;                          // Rate at which reputation decays (0-100)
    }
    
    // Reputation by address
    mapping(address => Reputation) private _reputations;
    
    // Total reputation in the system
    uint256 private _totalReputation;
    
    // Decay parameters
    uint256 public constant MAX_DECAY_RATE = 100;   // 100% decay
    uint256 public constant DECAY_PERIOD = 365 days; // 1 year decay period
    uint256 public defaultDecayRate = 10;           // 10% decay per year by default
    
    // Events
    event ReputationEarned(address indexed user, ContributionType contributionType, uint256 amount);
    event ReputationDecayed(address indexed user, uint256 amount);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REPUTATION_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Add reputation to a user for a specific contribution type
     * @param user Address of the user
     * @param contributionType Type of contribution
     * @param amount Amount of reputation to add
     */
    function addReputation(
        address user,
        ContributionType contributionType,
        uint256 amount
    ) external onlyRole(REPUTATION_MANAGER_ROLE) {
        require(user != address(0), "Invalid address");
        require(amount > 0, "Amount must be positive");
        
        // Initialize reputation if new user
        if (_reputations[user].lastUpdateTimestamp == 0) {
            _reputations[user].lastUpdateTimestamp = block.timestamp;
            _reputations[user].decayRate = defaultDecayRate;
        } else {
            // Apply decay before adding new reputation
            _applyDecay(user);
        }
        
        // Add reputation
        _reputations[user].contributions[contributionType] = 
            _reputations[user].contributions[contributionType].add(amount);
        _reputations[user].score = _reputations[user].score.add(amount);
        _totalReputation = _totalReputation.add(amount);
        
        // Update timestamp
        _reputations[user].lastUpdateTimestamp = block.timestamp;
        
        emit ReputationEarned(user, contributionType, amount);
    }
    
    /**
     * @dev Get the current reputation score for a user
     * @param user Address of the user
     * @return Current reputation score after applying decay
     */
    function getReputation(address user) public view returns (uint256) {
        if (_reputations[user].lastUpdateTimestamp == 0) {
            return 0;
        }
        
        // Calculate time elapsed since last update
        uint256 timeElapsed = block.timestamp.sub(_reputations[user].lastUpdateTimestamp);
        
        // If no time has passed or decay rate is 0, return current score
        if (timeElapsed == 0 || _reputations[user].decayRate == 0) {
            return _reputations[user].score;
        }
        
        // Calculate decay factor
        uint256 decayFactor = timeElapsed.mul(_reputations[user].decayRate).div(DECAY_PERIOD).div(100);
        
        // Apply decay to current score
        if (decayFactor >= 100) {
            return 0;
        } else {
            return _reputations[user].score.mul(100 - decayFactor).div(100);
        }
    }
    
    /**
     * @dev Get contribution amount by type
     * @param user Address of the user
     * @param contributionType Type of contribution
     * @return Amount contributed for the specific type
     */
    function getContributionByType(address user, ContributionType contributionType) 
        external 
        view 
        returns (uint256) 
    {
        return _reputations[user].contributions[contributionType];
    }
    
    /**
     * @dev Set the decay rate for a specific user
     * @param user Address of the user
     * @param decayRate New decay rate (0-100)
     */
    function setDecayRate(address user, uint256 decayRate) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
    {
        require(decayRate <= MAX_DECAY_RATE, "Decay rate too high");
        _reputations[user].decayRate = decayRate;
    }
    
    /**
     * @dev Set the default decay rate for new users
     * @param newDefaultDecayRate New default decay rate (0-100)
     */
    function setDefaultDecayRate(uint256 newDefaultDecayRate) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
    {
        require(newDefaultDecayRate <= MAX_DECAY_RATE, "Decay rate too high");
        defaultDecayRate = newDefaultDecayRate;
    }
    
    /**
     * @dev Apply decay to a user's reputation
     * @param user Address of the user
     */
    function _applyDecay(address user) private {
        uint256 currentScore = _reputations[user].score;
        uint256 newScore = getReputation(user);
        
        if (newScore < currentScore) {
            uint256 decayAmount = currentScore.sub(newScore);
            _reputations[user].score = newScore;
            _totalReputation = _totalReputation.sub(decayAmount);
            
            emit ReputationDecayed(user, decayAmount);
        }
        
        _reputations[user].lastUpdateTimestamp = block.timestamp;
    }
    
    /**
     * @dev Get the total reputation in the system
     * @return Total reputation
     */
    function getTotalReputation() external view returns (uint256) {
        return _totalReputation;
    }
} 