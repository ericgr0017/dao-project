// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title GovernanceToken
 * @dev ERC20 token with voting capabilities for the DAO governance
 */
contract GovernanceToken is ERC20Votes, AccessControl {
    using SafeMath for uint256;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Token distribution parameters
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;   // 1 billion tokens
    
    // Staking parameters
    uint256 public stakingRewardRate;  // Annual reward rate in basis points (1/100 of a percent)
    mapping(address => uint256) private _stakedBalances;
    mapping(address => uint256) private _stakingTimestamp;
    uint256 public totalStaked;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensStaked(address indexed staker, uint256 amount);
    event TokensUnstaked(address indexed staker, uint256 amount);
    event StakingRewardsClaimed(address indexed staker, uint256 amount);
    
    /**
     * @dev Constructor for the GovernanceToken
     */
    constructor() ERC20("Governance Token", "GT") ERC20Permit("Governance Token") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        
        // Initial token distribution
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Set initial staking reward rate to 5% annually
        stakingRewardRate = 500; // 5.00%
    }
    
    /**
     * @dev Mint new tokens
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply().add(amount) <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Stake tokens for governance and rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // If already staking, claim rewards first
        if (_stakedBalances[msg.sender] > 0) {
            claimStakingRewards();
        }
        
        // Transfer tokens to staking
        _transfer(msg.sender, address(this), amount);
        
        // Update staking balances
        _stakedBalances[msg.sender] = _stakedBalances[msg.sender].add(amount);
        totalStaked = totalStaked.add(amount);
        
        // Update staking timestamp
        _stakingTimestamp[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external {
        require(amount > 0, "Cannot unstake 0");
        require(_stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        
        // Claim rewards first
        claimStakingRewards();
        
        // Update staking balances
        _stakedBalances[msg.sender] = _stakedBalances[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        // Update staking timestamp
        _stakingTimestamp[msg.sender] = block.timestamp;
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim staking rewards
     * @return Amount of rewards claimed
     */
    function claimStakingRewards() public returns (uint256) {
        require(_stakedBalances[msg.sender] > 0, "No staked tokens");
        
        // Calculate rewards
        uint256 rewards = calculateStakingRewards(msg.sender);
        
        if (rewards > 0) {
            // Mint rewards to user
            _mint(msg.sender, rewards);
            
            // Update staking timestamp
            _stakingTimestamp[msg.sender] = block.timestamp;
            
            emit StakingRewardsClaimed(msg.sender, rewards);
        }
        
        return rewards;
    }
    
    /**
     * @dev Calculate staking rewards for an address
     * @param staker Address of the staker
     * @return Amount of rewards
     */
    function calculateStakingRewards(address staker) public view returns (uint256) {
        if (_stakedBalances[staker] == 0) {
            return 0;
        }
        
        // Calculate time elapsed since last claim
        uint256 timeElapsed = block.timestamp.sub(_stakingTimestamp[staker]);
        
        // Calculate rewards based on staking reward rate
        // rewards = stakedBalance * (stakingRewardRate / 10000) * (timeElapsed / 365 days)
        uint256 rewards = _stakedBalances[staker]
            .mul(stakingRewardRate)
            .mul(timeElapsed)
            .div(10000)
            .div(365 days);
            
        return rewards;
    }
    
    /**
     * @dev Set the staking reward rate
     * @param newRate New reward rate in basis points
     */
    function setStakingRewardRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate <= 2000, "Rate too high"); // Max 20%
        stakingRewardRate = newRate;
    }
    
    /**
     * @dev Get staked balance of an address
     * @param account Address to check
     * @return Staked balance
     */
    function stakedBalanceOf(address account) external view returns (uint256) {
        return _stakedBalances[account];
    }
    
    /**
     * @dev Get staking timestamp of an address
     * @param account Address to check
     * @return Timestamp of last staking action
     */
    function stakingTimestampOf(address account) external view returns (uint256) {
        return _stakingTimestamp[account];
    }
    
    /**
     * @dev Override _beforeTokenTransfer to ensure delegations are updated
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
    }
} 