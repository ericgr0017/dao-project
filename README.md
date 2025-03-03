# Decentralized Problem-Solving DAO

A decentralized autonomous organization (DAO) for global problem-solving, leveraging blockchain technology, cryptocurrency, and collective intelligence.

## Project Structure

This project is organized as a monorepo with the following packages:

- **dao-contracts**: Smart contracts for governance, treasury, and reputation systems
- **dao-frontend**: React-based web application for interacting with the DAO
- **dao-indexer**: (Optional) Backend services for indexing and API
- **dao-docs**: Documentation and community resources

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dao-project.git
cd dao-project
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

#### Smart Contracts

```bash
# Compile contracts
yarn contracts compile

# Run tests
yarn contracts test

# Deploy to testnet
yarn contracts deploy:testnet
```

#### Frontend

```bash
# Start development server
yarn frontend start

# Build for production
yarn frontend build
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 