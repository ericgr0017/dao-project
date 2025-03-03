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

## Collaboration Workflow

This project follows a Git Flow-inspired branching strategy:

### Main Branches

- **main**: Production-ready code
- **develop**: Latest development changes

### Feature Branches

- **feature/contracts**: For smart contract development
- **feature/frontend**: For frontend development
- **feature/indexer**: For indexer development
- **feature/docs**: For documentation updates

### Workflow Steps

1. **Pick an issue** from the GitHub Issues board
2. **Create a branch** from the appropriate feature branch
   ```bash
   git checkout feature/contracts
   git pull
   git checkout -b feature/contracts-your-feature-name
   ```
3. **Make your changes** and commit them
4. **Push your branch** to GitHub
   ```bash
   git push -u origin feature/contracts-your-feature-name
   ```
5. **Create a Pull Request** to merge into the appropriate feature branch
6. After review and approval, your changes will be merged

## Continuous Integration

This project uses GitHub Actions for continuous integration. All pull requests are automatically tested before they can be merged.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 