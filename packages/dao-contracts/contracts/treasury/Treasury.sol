// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury is AccessControl {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    
    event FundsAllocated(address indexed recipient, uint256 amount, string purpose);
    event TokensAllocated(address indexed token, address indexed recipient, uint256 amount, string purpose);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
    
    function allocateFunds(address payable recipient, uint256 amount, string memory purpose) 
        external 
        onlyRole(GOVERNOR_ROLE) 
    {
        require(address(this).balance >= amount, "Insufficient funds");
        recipient.transfer(amount);
        emit FundsAllocated(recipient, amount, purpose);
    }
    
    function allocateTokens(address tokenAddress, address recipient, uint256 amount, string memory purpose)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");
        require(token.transfer(recipient, amount), "Token transfer failed");
        emit TokensAllocated(tokenAddress, recipient, amount, purpose);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }
} 