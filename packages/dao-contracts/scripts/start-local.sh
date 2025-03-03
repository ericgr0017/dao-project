#!/bin/bash

# This script starts a local Hardhat node and deploys the contracts
# Usage: ./scripts/start-local.sh

echo "Starting local development environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  yarn install
fi

# Start Hardhat node in the background
echo "Starting Hardhat node..."
npx hardhat node > hardhat.log 2>&1 &
NODE_PID=$!

# Wait for node to start
echo "Waiting for Hardhat node to start..."
sleep 5

# Deploy contracts
echo "Deploying contracts to local node..."
npx hardhat run scripts/development.js --network localhost

echo ""
echo "Local development environment is running!"
echo "Hardhat node is running in the background (PID: $NODE_PID)"
echo "To stop the node, run: kill $NODE_PID"
echo ""
echo "Deployment information has been saved to deployment-info.json"
echo ""
echo "You can now interact with the contracts using the Hardhat console:"
echo "npx hardhat console --network localhost"
echo ""
echo "Or start the frontend application to interact with the contracts."

# Save PID to file for easy cleanup
echo $NODE_PID > .node-pid

# Trap SIGINT and SIGTERM to kill the node process
trap "echo 'Stopping Hardhat node...'; kill $NODE_PID; rm .node-pid; exit" SIGINT SIGTERM

# Keep script running to maintain the background process
echo "Press Ctrl+C to stop the local development environment."
wait $NODE_PID 