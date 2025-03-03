const { ethers } = require("hardhat");

/**
 * Development script for local testing
 * This script deploys all contracts and sets up a test environment
 * Run with: npx hardhat run scripts/development.js --network localhost
 */
async function main() {
  console.log("Starting development deployment...");
  
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
  
  // Deploy ReputationSystem
  console.log("\nDeploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.deployed();
  console.log(`ReputationSystem deployed to: ${reputationSystem.address}`);
  
  // Deploy TimelockController
  console.log("\nDeploying TimelockController...");
  const minDelay = 60; // 1 minute for testing (use higher value for production)
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelockController = await TimelockController.deploy(
    minDelay,
    [deployer.address], // proposers
    [deployer.address]  // executors
  );
  await timelockController.deployed();
  console.log(`TimelockController deployed to: ${timelockController.address}`);
  
  // Deploy ProposalSystem
  console.log("\nDeploying ProposalSystem...");
  const quorumPercentage = 4; // 4%
  const votingPeriod = 5; // 5 blocks for testing
  const votingDelay = 1; // 1 block
  const proposalStake = ethers.utils.parseEther("100"); // 100 tokens
  const reputationWeightFactor = 50; // 50%
  const quadraticVotingFactor = 70; // 70%
  
  const ProposalSystem = await ethers.getContractFactory("ProposalSystem");
  const proposalSystem = await ProposalSystem.deploy(
    governanceToken.address,
    timelockController.address,
    quorumPercentage,
    votingPeriod,
    votingDelay,
    proposalStake,
    reputationSystem.address,
    reputationWeightFactor,
    quadraticVotingFactor
  );
  await proposalSystem.deployed();
  console.log(`ProposalSystem deployed to: ${proposalSystem.address}`);
  
  // Deploy Treasury
  console.log("\nDeploying Treasury...");
  const transactionFeePercent = 50; // 0.5% in basis points
  const burnPercent = 30; // 30% of fees
  const reservePercent = 20; // 20% of fees
  
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(
    governanceToken.address,
    transactionFeePercent,
    burnPercent,
    reservePercent
  );
  await treasury.deployed();
  console.log(`Treasury deployed to: ${treasury.address}`);
  
  // Set up roles
  console.log("\nSetting up roles...");
  
  // Grant BURNER_ROLE to Treasury
  const burnerRole = await governanceToken.BURNER_ROLE();
  await governanceToken.grantRole(burnerRole, treasury.address);
  console.log(`Granted BURNER_ROLE to Treasury`);
  
  // Grant GOVERNOR_ROLE to ProposalSystem
  const governorRole = await treasury.GOVERNOR_ROLE();
  await treasury.grantRole(governorRole, proposalSystem.address);
  console.log(`Granted GOVERNOR_ROLE to ProposalSystem`);
  
  // Grant REPUTATION_MANAGER_ROLE to ProposalSystem
  const reputationManagerRole = await reputationSystem.REPUTATION_MANAGER_ROLE();
  await reputationSystem.grantRole(reputationManagerRole, proposalSystem.address);
  console.log(`Granted REPUTATION_MANAGER_ROLE to ProposalSystem`);
  
  // Update TimelockController roles
  const proposerRole = await timelockController.PROPOSER_ROLE();
  const executorRole = await timelockController.EXECUTOR_ROLE();
  await timelockController.grantRole(proposerRole, proposalSystem.address);
  await timelockController.grantRole(executorRole, proposalSystem.address);
  console.log(`Updated TimelockController roles`);
  
  // Set up test data
  console.log("\nSetting up test data...");
  
  // Transfer tokens to test users
  await governanceToken.transfer(user1.address, ethers.utils.parseEther("10000"));
  await governanceToken.transfer(user2.address, ethers.utils.parseEther("5000"));
  console.log(`Transferred tokens to test users`);
  
  // Add reputation to test users
  await reputationSystem.addReputation(user1.address, 0, 1000); // CODE
  await reputationSystem.addReputation(user2.address, 1, 2000); // FUNDING
  console.log(`Added reputation to test users`);
  
  // Fund treasury with ETH
  await deployer.sendTransaction({
    to: treasury.address,
    value: ethers.utils.parseEther("10")
  });
  console.log(`Funded treasury with 10 ETH`);
  
  // Print summary
  console.log("\n=== Deployment Summary ===");
  console.log(`GovernanceToken: ${governanceToken.address}`);
  console.log(`ReputationSystem: ${reputationSystem.address}`);
  console.log(`TimelockController: ${timelockController.address}`);
  console.log(`ProposalSystem: ${proposalSystem.address}`);
  console.log(`Treasury: ${treasury.address}`);
  
  // Save deployment addresses to a file for easy access
  const fs = require("fs");
  const deploymentInfo = {
    governanceToken: governanceToken.address,
    reputationSystem: reputationSystem.address,
    timelockController: timelockController.address,
    proposalSystem: proposalSystem.address,
    treasury: treasury.address,
    deployer: deployer.address,
    user1: user1.address,
    user2: user2.address,
    network: network.name,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
  
  console.log("\nDevelopment deployment complete!");
  return deploymentInfo;
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 