#!/bin/bash

# This script runs all tests with coverage reporting
# Usage: ./scripts/test-coverage.sh

echo "Running tests with coverage reporting..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  yarn install
fi

# Run tests with coverage
npx hardhat coverage

echo ""
echo "Coverage report generated."
echo "Open coverage/index.html in your browser to view the report." 