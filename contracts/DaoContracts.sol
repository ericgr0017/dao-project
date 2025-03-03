// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GovernanceToken
 * @dev ERC20 Token for voting and governance within the DAO.
 */
contract GovernanceToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("GovernanceToken", "GT") {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title QuadraticVoting
 * @dev Smart contract implementing quadratic voting for proposals.
 */
contract QuadraticVoting is ReentrancyGuard {
    struct Proposal {
        string description;
        uint256 voteCount;
        uint256 endTime;
        bool executed;
    }

    GovernanceToken public governanceToken;
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => uint256)) public votes;

    event ProposalCreated(uint256 proposalId, string description, uint256 endTime);
    event Voted(uint256 proposalId, address voter, uint256 voteWeight);
    event ProposalExecuted(uint256 proposalId);

    constructor(address tokenAddress) {
        governanceToken = GovernanceToken(tokenAddress);
    }

    function createProposal(string memory _description, uint256 _duration) external {
        uint256 endTime = block.timestamp + _duration;
        proposals.push(Proposal({
            description: _description,
            voteCount: 0,
            endTime: endTime,
            executed: false
        }));
        emit ProposalCreated(proposals.length - 1, _description, endTime);
    }

    function vote(uint256 proposalId, uint256 tokens) external nonReentrant {
        require(proposalId < proposals.length, "Invalid proposal");
        require(block.timestamp < proposals[proposalId].endTime, "Voting period over");
        require(governanceToken.balanceOf(msg.sender) >= tokens, "Insufficient tokens");

        uint256 voteWeight = sqrt(tokens); 
        votes[proposalId][msg.sender] += voteWeight;
        proposals[proposalId].voteCount += voteWeight;
        emit Voted(proposalId, msg.sender, voteWeight);
    }

    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting still active");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}

/**
 * @title DAOTreasury
 * @dev Multi-signature treasury smart contract for secure fund management.
 */
contract DAOTreasury is Ownable {
    address[] public signers;
    mapping(address => bool) public isSigner;
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    struct Transaction {
        address to;
        uint256 amount;
        bool executed;
        mapping(address => bool) approvals;
    }

    event TransactionCreated(uint256 transactionId, address to, uint256 amount);
    event TransactionExecuted(uint256 transactionId);

    constructor(address[] memory _signers) {
        require(_signers.length >= 3, "At least 3 signers required");
        for (uint256 i = 0; i < _signers.length; i++) {
            signers.push(_signers[i]);
            isSigner[_signers[i]] = true;
        }
    }

    function createTransaction(address _to, uint256 _amount) external onlyOwner {
        uint256 transactionId = transactionCount++;
        transactions[transactionId] = Transaction({
            to: _to,
            amount: _amount,
            executed: false
        });
        emit TransactionCreated(transactionId, _to, _amount);
    }

    function approveTransaction(uint256 transactionId) external {
        require(isSigner[msg.sender], "Not a signer");
        require(transactionId < transactionCount, "Invalid transaction");
        Transaction storage transaction = transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(!transaction.approvals[msg.sender], "Already approved");

        transaction.approvals[msg.sender] = true;
        uint256 approvalCount = 0;
        for (uint256 i = 0; i < signers.length; i++) {
            if (transaction.approvals[signers[i]]) {
                approvalCount++;
            }
        }

        if (approvalCount >= (signers.length / 2) + 1) {
            transaction.executed = true;
            payable(transaction.to).transfer(transaction.amount);
            emit TransactionExecuted(transactionId);
        }
    }
}

/**
 * @title Deployment Scripts
 * @dev Hardhat script for deploying contracts to the testnet.
 */
module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // Deploy Governance Token
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: ["1000000000000000000000000"], // 1 million tokens
        log: true,
    });

    // Deploy Quadratic Voting
    const quadraticVoting = await deploy("QuadraticVoting", {
        from: deployer,
        args: [governanceToken.address],
        log: true,
    });

    // Deploy DAO Treasury
    const daoTreasury = await deploy("DAOTreasury", {
        from: deployer,
        args: [[deployer]], // Initial signer list
        log: true,
    });
};

