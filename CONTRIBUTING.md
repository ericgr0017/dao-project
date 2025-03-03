# Contributing to the DAO Project

Thank you for your interest in contributing to our decentralized problem-solving DAO! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include screenshots if applicable

### Suggesting Features

- Check if the feature has already been suggested in the Issues section
- Use the feature request template when creating a new issue
- Explain why this feature would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

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

### Project Structure

This project is organized as a monorepo with the following packages:

- **dao-contracts**: Smart contracts for governance, treasury, and reputation systems
- **dao-frontend**: React-based web application for interacting with the DAO
- **dao-indexer**: Backend services for indexing and API
- **dao-docs**: Documentation and community resources

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation for changes

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 