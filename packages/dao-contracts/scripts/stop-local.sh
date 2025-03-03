#!/bin/bash

# This script stops the local Hardhat node
# Usage: ./scripts/stop-local.sh

echo "Stopping local development environment..."

# Check if PID file exists
if [ -f ".node-pid" ]; then
  NODE_PID=$(cat .node-pid)
  
  # Check if process is running
  if ps -p $NODE_PID > /dev/null; then
    echo "Stopping Hardhat node (PID: $NODE_PID)..."
    kill $NODE_PID
    rm .node-pid
    echo "Hardhat node stopped."
  else
    echo "Hardhat node is not running."
    rm .node-pid
  fi
else
  echo "No running Hardhat node found."
  
  # Try to find and kill any running Hardhat nodes
  HARDHAT_PIDS=$(ps aux | grep "hardhat node" | grep -v grep | awk '{print $2}')
  
  if [ ! -z "$HARDHAT_PIDS" ]; then
    echo "Found running Hardhat nodes. Stopping them..."
    for pid in $HARDHAT_PIDS; do
      echo "Stopping Hardhat node (PID: $pid)..."
      kill $pid
    done
    echo "All Hardhat nodes stopped."
  fi
fi

echo "Local development environment stopped." 