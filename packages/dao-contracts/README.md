# DAO Smart Contracts

This package contains the smart contracts for the DAO project, including governance, treasury, and reputation systems.

## Safety First

This codebase follows strict safety practices to prevent crashes and vulnerabilities:

1. **Comprehensive Testing**: All contracts have individual unit tests and integration tests
2. **Code Coverage**: Aim for >90% test coverage before deployment
3. **Incremental Development**: Make small, testable changes rather than large refactors
4. **Defensive Programming**: Use SafeMath and other safety mechanisms throughout

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn
- MetaMask or another Ethereum wallet

### Installation

```bash
# Install dependencies
yarn install
```

### Local Development

```bash
# Start a local Hardhat node
npx hardhat node

# In a separate terminal, deploy contracts to local node
npx hardhat run scripts/development.js --network localhost
```

### Testing

```bash
# Run all tests
yarn test

# Run specific test
npx hardhat test test/Governance.test.js

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

## Contract Architecture

### GovernanceToken

ERC20 token with voting capabilities, staking, and reward mechanisms.

### ReputationSystem

Tracks reputation scores for DAO participants based on their contributions.

### ProposalSystem

Governance system with quadratic voting and reputation-based weighting.

### Treasury

Manages the DAO treasury, including revenue streams and token burn mechanisms.

## Deployment

### Testnet Deployment

```bash
# Deploy to testnet (Sepolia)
npx hardhat run scripts/deploy.js --network testnet

# Verify contracts on Etherscan
npx hardhat verify --network testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Mainnet Deployment

Before deploying to mainnet:

1. Run all tests multiple times
2. Conduct a security audit
3. Deploy to testnet and test thoroughly
4. Have multiple team members review the deployment script

```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## Safety Checklist

Before making changes:

- [ ] Understand the existing code and its dependencies
- [ ] Write tests first (Test-Driven Development)
- [ ] Run the full test suite locally
- [ ] Check for potential reentrancy vulnerabilities
- [ ] Verify access control is properly implemented
- [ ] Consider gas optimization without sacrificing safety

## License

This project is licensed under the MIT License - see the LICENSE file for details. 