// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../governance/Governance.sol";

/**
 * @title Treasury
 * @dev Manages the DAO treasury, including revenue streams and token burn mechanisms
 */
contract Treasury is AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for GovernanceToken;
    
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant REVENUE_MANAGER_ROLE = keccak256("REVENUE_MANAGER_ROLE");
    
    // Governance token
    GovernanceToken public governanceToken;
    
    // Fee configuration
    uint256 public transactionFeePercent; // In basis points (1/100 of a percent)
    uint256 public burnPercent;           // Percentage of fees to burn
    uint256 public reservePercent;        // Percentage of fees to keep as reserves
    
    // Reserve fund
    uint256 public reserveFund;
    
    // Revenue tracking
    uint256 public totalRevenue;
    uint256 public totalBurned;
    
    // Revenue streams
    enum RevenueStream {
        TRANSACTION_FEE,
        CROWDFUNDING_FEE,
        STAKING_REWARDS,
        EDUCATIONAL_CONTENT
    }
    
    // Revenue by stream
    mapping(RevenueStream => uint256) public revenueByStream;
    
    // Events
    event FundsAllocated(address indexed recipient, uint256 amount, string purpose);
    event RevenueCaptured(RevenueStream indexed stream, uint256 amount);
    event TokensBurned(uint256 amount);
    event ReserveFundIncreased(uint256 amount);
    
    /**
     * @dev Constructor for the Treasury
     * @param _governanceToken Address of the governance token
     * @param _transactionFeePercent Transaction fee in basis points (1/100 of a percent)
     * @param _burnPercent Percentage of fees to burn
     * @param _reservePercent Percentage of fees to keep as reserves
     */
    constructor(
        GovernanceToken _governanceToken,
        uint256 _transactionFeePercent,
        uint256 _burnPercent,
        uint256 _reservePercent
    ) {
        require(_burnPercent + _reservePercent <= 100, "Percentages exceed 100%");
        require(_transactionFeePercent <= 100, "Fee too high"); // Max 1%
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(REVENUE_MANAGER_ROLE, msg.sender);
        
        governanceToken = _governanceToken;
        transactionFeePercent = _transactionFeePercent;
        burnPercent = _burnPercent;
        reservePercent = _reservePercent;
    }
    
    /**
     * @dev Allocate funds from the treasury
     * @param recipient Recipient address
     * @param amount Amount to allocate
     * @param purpose Purpose of the allocation
     */
    function allocateFunds(address payable recipient, uint256 amount, string memory purpose) 
        external 
        onlyRole(GOVERNOR_ROLE) 
    {
        require(address(this).balance >= amount, "Insufficient funds");
        recipient.transfer(amount);
        emit FundsAllocated(recipient, amount, purpose);
    }
    
    /**
     * @dev Allocate tokens from the treasury
     * @param token Token to allocate
     * @param recipient Recipient address
     * @param amount Amount to allocate
     * @param purpose Purpose of the allocation
     */
    function allocateTokens(
        IERC20 token,
        address recipient,
        uint256 amount,
        string memory purpose
    ) 
        external 
        onlyRole(GOVERNOR_ROLE) 
    {
        require(token.balanceOf(address(this)) >= amount, "Insufficient tokens");
        token.safeTransfer(recipient, amount);
        emit FundsAllocated(recipient, amount, purpose);
    }
    
    /**
     * @dev Capture revenue from a transaction
     * @param stream Revenue stream type
     * @param amount Transaction amount
     * @return Fee amount captured
     */
    function captureRevenue(RevenueStream stream, uint256 amount) 
        external 
        onlyRole(REVENUE_MANAGER_ROLE) 
        returns (uint256) 
    {
        uint256 fee = amount.mul(transactionFeePercent).div(10000); // Convert basis points
        
        // Update revenue tracking
        totalRevenue = totalRevenue.add(fee);
        revenueByStream[stream] = revenueByStream[stream].add(fee);
        
        // Calculate burn and reserve amounts
        uint256 burnAmount = fee.mul(burnPercent).div(100);
        uint256 reserveAmount = fee.mul(reservePercent).div(100);
        
        // Burn tokens if burn percentage > 0
        if (burnAmount > 0 && governanceToken.balanceOf(address(this)) >= burnAmount) {
            governanceToken.burn(burnAmount);
            totalBurned = totalBurned.add(burnAmount);
            emit TokensBurned(burnAmount);
        }
        
        // Add to reserve fund
        if (reserveAmount > 0) {
            reserveFund = reserveFund.add(reserveAmount);
            emit ReserveFundIncreased(reserveAmount);
        }
        
        emit RevenueCaptured(stream, fee);
        return fee;
    }
    
    /**
     * @dev Process a crowdfunding transaction
     * @param token Token being used for funding
     * @param sender Sender of the funds
     * @param recipient Recipient of the funds
     * @param amount Amount being sent
     * @return Fee amount captured
     */
    function processCrowdfunding(
        IERC20 token,
        address sender,
        address recipient,
        uint256 amount
    ) 
        external 
        onlyRole(REVENUE_MANAGER_ROLE) 
        returns (uint256) 
    {
        uint256 fee = amount.mul(transactionFeePercent).div(10000); // Convert basis points
        uint256 recipientAmount = amount.sub(fee);
        
        // Transfer tokens from sender to recipient and treasury
        token.safeTransferFrom(sender, recipient, recipientAmount);
        token.safeTransferFrom(sender, address(this), fee);
        
        // Capture revenue
        return captureRevenue(RevenueStream.CROWDFUNDING_FEE, amount);
    }
    
    /**
     * @dev Set the transaction fee percentage
     * @param newFeePercent New fee percentage in basis points
     */
    function setTransactionFeePercent(uint256 newFeePercent) 
        external 
        onlyRole(GOVERNOR_ROLE) 
    {
        require(newFeePercent <= 100, "Fee too high"); // Max 1%
        transactionFeePercent = newFeePercent;
    }
    
    /**
     * @dev Set the burn percentage
     * @param newBurnPercent New burn percentage
     */
    function setBurnPercent(uint256 newBurnPercent) 
        external 
        onlyRole(GOVERNOR_ROLE) 
    {
        require(newBurnPercent + reservePercent <= 100, "Percentages exceed 100%");
        burnPercent = newBurnPercent;
    }
    
    /**
     * @dev Set the reserve percentage
     * @param newReservePercent New reserve percentage
     */
    function setReservePercent(uint256 newReservePercent) 
        external 
        onlyRole(GOVERNOR_ROLE) 
    {
        require(burnPercent + newReservePercent <= 100, "Percentages exceed 100%");
        reservePercent = newReservePercent;
    }
    
    /**
     * @dev Get revenue by stream
     * @param stream Revenue stream type
     * @return Amount of revenue from the stream
     */
    function getRevenueByStream(RevenueStream stream) 
        external 
        view 
        returns (uint256) 
    {
        return revenueByStream[stream];
    }
    
    /**
     * @dev Get treasury balance
     * @return Current ETH balance of the treasury
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get token balance
     * @param token Token to check
     * @return Current token balance of the treasury
     */
    function getTokenBalance(IERC20 token) external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    // Allow the treasury to receive ETH
    receive() external payable {}
} 