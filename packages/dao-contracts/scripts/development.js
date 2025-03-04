/**
 * Development script for local testing
 * This script deploys all contracts and sets up a test environment
 * Run with: npx hardhat run scripts/development.js --network localhost
 */

async function main() {
  console.log("Starting development deployment...");
  
  // Get ethers and the network from hardhat
  const hre = require("hardhat");
  const { ethers } = hre;
  
  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Test user 1 address: ${user1.address}`);
  console.log(`Test user 2 address: ${user2.address}`);
  
  // Deploy GovernanceToken
  console.log("\nDeploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy();
  await governanceToken.deployed();
  console.log(`GovernanceToken deployed to: ${governanceToken.address}`);
  
  // Deploy Treasury
  console.log("\nDeploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();
  console.log(`Treasury deployed to: ${treasury.address}`);
  
  // Deploy ProposalSystem
  console.log("\nDeploying ProposalSystem...");
  const quorumPercentage = 4; // 4%
  const votingPeriod = 5; // 5 blocks for testing
  const votingDelay = 1; // 1 block
  const proposalStake = ethers.utils.parseEther("100"); // 100 tokens
  
  const ProposalSystem = await ethers.getContractFactory("ProposalSystem");
  const proposalSystem = await ProposalSystem.deploy(
    governanceToken.address,
    treasury.address,
    quorumPercentage,
    votingPeriod,
    votingDelay,
    proposalStake
  );
  await proposalSystem.deployed();
  console.log(`ProposalSystem deployed to: ${proposalSystem.address}`);
  
  // Setup test data
  console.log("\nSetting up test data...");
  
  // Transfer tokens to test users
  await governanceToken.transfer(user1.address, ethers.utils.parseEther("10000"));
  await governanceToken.transfer(user2.address, ethers.utils.parseEther("5000"));
  console.log(`Transferred tokens to test users`);
  
  // Fund treasury with ETH
  await deployer.sendTransaction({
    to: treasury.address,
    value: ethers.utils.parseEther("10")
  });
  console.log(`Funded treasury with 10 ETH`);
  
  // Deployment summary
  console.log("\nDeployment Summary:");
  console.log(`GovernanceToken: ${governanceToken.address}`);
  console.log(`ProposalSystem: ${proposalSystem.address}`);
  console.log(`Treasury: ${treasury.address}`);
  
  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    governanceToken: governanceToken.address,
    proposalSystem: proposalSystem.address,
    treasury: treasury.address,
    deployer: deployer.address,
    user1: user1.address,
    user2: user2.address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 