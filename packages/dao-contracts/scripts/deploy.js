// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy GovernanceToken
  console.log("Deploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy();
  await governanceToken.deployed();
  console.log("GovernanceToken deployed to:", governanceToken.address);

  // Deploy ReputationSystem
  console.log("Deploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.deployed();
  console.log("ReputationSystem deployed to:", reputationSystem.address);

  // Deploy TimelockController
  console.log("Deploying TimelockController...");
  const minDelay = 172800; // 2 days in seconds
  const proposers = [deployer.address]; // Will be updated later
  const executors = [deployer.address]; // Will be updated later
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelockController = await TimelockController.deploy(
    minDelay,
    proposers,
    executors
  );
  await timelockController.deployed();
  console.log("TimelockController deployed to:", timelockController.address);

  // Deploy ProposalSystem
  console.log("Deploying ProposalSystem...");
  const quorumPercentage = 4; // 4% of total supply
  const votingPeriod = 45818; // ~1 week
  const votingDelay = 1; // 1 block
  const proposalStake = ethers.utils.parseEther("100"); // 100 tokens
  const reputationWeightFactor = 50; // 50% weight for reputation
  const quadraticVotingFactor = 70; // 70% quadratic, 30% linear
  
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
  console.log("ProposalSystem deployed to:", proposalSystem.address);

  // Deploy Treasury
  console.log("Deploying Treasury...");
  const transactionFeePercent = 50; // 0.5% fee (in basis points)
  const burnPercent = 30; // 30% of fees burned
  const reservePercent = 20; // 20% of fees to reserves
  
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(
    governanceToken.address,
    transactionFeePercent,
    burnPercent,
    reservePercent
  );
  await treasury.deployed();
  console.log("Treasury deployed to:", treasury.address);

  // Setup roles
  console.log("Setting up roles...");
  
  // Grant BURNER_ROLE to Treasury
  const BURNER_ROLE = await governanceToken.BURNER_ROLE();
  await governanceToken.grantRole(BURNER_ROLE, treasury.address);
  console.log("Granted BURNER_ROLE to Treasury");
  
  // Grant GOVERNOR_ROLE to ProposalSystem
  const GOVERNOR_ROLE = await treasury.GOVERNOR_ROLE();
  await treasury.grantRole(GOVERNOR_ROLE, proposalSystem.address);
  console.log("Granted GOVERNOR_ROLE to ProposalSystem");
  
  // Grant REPUTATION_MANAGER_ROLE to ProposalSystem
  const REPUTATION_MANAGER_ROLE = await reputationSystem.REPUTATION_MANAGER_ROLE();
  await reputationSystem.grantRole(REPUTATION_MANAGER_ROLE, proposalSystem.address);
  console.log("Granted REPUTATION_MANAGER_ROLE to ProposalSystem");
  
  // Update TimelockController proposers and executors
  const PROPOSER_ROLE = await timelockController.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelockController.EXECUTOR_ROLE();
  
  await timelockController.grantRole(PROPOSER_ROLE, proposalSystem.address);
  await timelockController.grantRole(EXECUTOR_ROLE, proposalSystem.address);
  console.log("Updated TimelockController roles");

  console.log("Deployment complete!");
  
  // Return the deployed contract addresses for testing
  return {
    governanceToken: governanceToken.address,
    reputationSystem: reputationSystem.address,
    timelockController: timelockController.address,
    proposalSystem: proposalSystem.address,
    treasury: treasury.address
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 