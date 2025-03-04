const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Testing deployed contracts...");
  
  // Load deployment info
  const deploymentInfoPath = path.join(__dirname, "../deployment-info.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
  
  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);
  
  // Load contracts
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const ProposalSystem = await ethers.getContractFactory("ProposalSystem");
  const Treasury = await ethers.getContractFactory("Treasury");
  
  const governanceToken = GovernanceToken.attach(deploymentInfo.governanceToken);
  const proposalSystem = ProposalSystem.attach(deploymentInfo.proposalSystem);
  const treasury = Treasury.attach(deploymentInfo.treasury);
  
  // Test GovernanceToken
  console.log("\n--- Testing GovernanceToken ---");
  const name = await governanceToken.name();
  const symbol = await governanceToken.symbol();
  const totalSupply = await governanceToken.totalSupply();
  const deployerBalance = await governanceToken.balanceOf(deployer.address);
  const user1Balance = await governanceToken.balanceOf(user1.address);
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
  console.log(`Deployer Balance: ${ethers.utils.formatEther(deployerBalance)} ${symbol}`);
  console.log(`User1 Balance: ${ethers.utils.formatEther(user1Balance)} ${symbol}`);
  
  // Test Treasury
  console.log("\n--- Testing Treasury ---");
  const treasuryBalance = await ethers.provider.getBalance(treasury.address);
  console.log(`Treasury ETH Balance: ${ethers.utils.formatEther(treasuryBalance)} ETH`);
  
  // Check if deployer has GOVERNOR_ROLE
  const GOVERNOR_ROLE = await treasury.GOVERNOR_ROLE();
  const hasGovernorRole = await treasury.hasRole(GOVERNOR_ROLE, proposalSystem.address);
  console.log(`ProposalSystem has GOVERNOR_ROLE: ${hasGovernorRole}`);
  
  // Test ProposalSystem
  console.log("\n--- Testing ProposalSystem ---");
  const treasuryAddress = await proposalSystem.treasury();
  const quorumVotes = await proposalSystem.quorumVotes();
  const votingPeriod = await proposalSystem.votingPeriod();
  const votingDelay = await proposalSystem.votingDelay();
  const proposalThreshold = await proposalSystem.proposalThreshold();
  
  console.log(`Treasury Address: ${treasuryAddress}`);
  console.log(`Quorum Votes: ${ethers.utils.formatEther(quorumVotes)} tokens`);
  console.log(`Voting Period: ${votingPeriod} blocks`);
  console.log(`Voting Delay: ${votingDelay} blocks`);
  console.log(`Proposal Threshold: ${ethers.utils.formatEther(proposalThreshold)} tokens`);
  
  // Create a test proposal
  console.log("\n--- Creating a test proposal ---");
  try {
    // First, grant GOVERNOR_ROLE to the ProposalSystem if it doesn't have it
    if (!hasGovernorRole) {
      console.log("Granting GOVERNOR_ROLE to ProposalSystem...");
      const grantRoleTx = await treasury.grantRole(GOVERNOR_ROLE, proposalSystem.address);
      await grantRoleTx.wait();
      console.log("GOVERNOR_ROLE granted to ProposalSystem");
    }
    
    // Create a proposal to send 1 ETH from treasury to user2
    const description = "Send 1 ETH to user2 for testing";
    const targets = [treasury.address];
    const values = [ethers.utils.parseEther("0")]; // No ETH sent with the call
    const calldatas = [
      treasury.interface.encodeFunctionData("allocateFunds", [
        user2.address,
        ethers.utils.parseEther("1"),
        "Test allocation"
      ])
    ];
    
    console.log("Submitting proposal...");
    const proposeTx = await proposalSystem.propose(targets, values, calldatas, description);
    const proposeReceipt = await proposeTx.wait();
    
    // Get the proposal ID from the event
    const proposalId = proposeReceipt.events[0].args.proposalId;
    console.log(`Proposal created with ID: ${proposalId}`);
    
    // Check proposal state
    const state = await proposalSystem.state(proposalId);
    const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Executed"];
    console.log(`Proposal state: ${stateNames[state]}`);
    
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error creating proposal:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 