const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Testing contract interaction...");
  
  // Load deployment info
  const deploymentInfoPath = path.join(__dirname, "../deployment-info.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
  
  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`Using deployer address: ${deployer.address}`);
  
  // Load contracts
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const ProposalSystem = await ethers.getContractFactory("ProposalSystem");
  const Treasury = await ethers.getContractFactory("Treasury");
  
  const governanceToken = GovernanceToken.attach(deploymentInfo.governanceToken);
  const proposalSystem = ProposalSystem.attach(deploymentInfo.proposalSystem);
  const treasury = Treasury.attach(deploymentInfo.treasury);
  
  console.log("\n--- Contract Information ---");
  console.log(`GovernanceToken: ${governanceToken.address}`);
  console.log(`ProposalSystem: ${proposalSystem.address}`);
  console.log(`Treasury: ${treasury.address}`);
  
  // Test GovernanceToken
  console.log("\n--- Testing GovernanceToken ---");
  const name = await governanceToken.name();
  const symbol = await governanceToken.symbol();
  const totalSupply = await governanceToken.totalSupply();
  const deployerBalance = await governanceToken.balanceOf(deployer.address);
  const user1Balance = await governanceToken.balanceOf(user1.address);
  
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
  console.log(`Deployer Balance: ${ethers.utils.formatEther(deployerBalance)} ${symbol}`);
  console.log(`User1 Balance: ${ethers.utils.formatEther(user1Balance)} ${symbol}`);
  
  // Test Treasury
  console.log("\n--- Testing Treasury ---");
  const treasuryBalance = await ethers.provider.getBalance(treasury.address);
  console.log(`Treasury ETH Balance: ${ethers.utils.formatEther(treasuryBalance)} ETH`);
  
  // Check if ProposalSystem has GOVERNOR_ROLE
  const GOVERNOR_ROLE = await treasury.GOVERNOR_ROLE();
  const hasRole = await treasury.hasRole(GOVERNOR_ROLE, proposalSystem.address);
  console.log(`ProposalSystem has GOVERNOR_ROLE: ${hasRole}`);
  
  // Test ProposalSystem
  console.log("\n--- Testing ProposalSystem ---");
  const treasuryAddress = await proposalSystem.treasury();
  const quorumVotes = await proposalSystem.quorumVotes();
  const votingPeriod = await proposalSystem.votingPeriod();
  const votingDelay = await proposalSystem.votingDelay();
  const proposalThreshold = await proposalSystem.proposalThreshold();
  
  console.log(`Treasury Address: ${treasuryAddress}`);
  console.log(`Quorum Votes: ${ethers.utils.formatEther(quorumVotes)} ${symbol}`);
  console.log(`Voting Period: ${votingPeriod} blocks`);
  console.log(`Voting Delay: ${votingDelay} blocks`);
  console.log(`Proposal Threshold: ${ethers.utils.formatEther(proposalThreshold)} ${symbol}`);
  
  // Try to create a proposal
  console.log("\n--- Creating a Test Proposal ---");
  try {
    // Grant GOVERNOR_ROLE to the proposalSystem if it doesn't have it
    if (!hasRole) {
      console.log("Granting GOVERNOR_ROLE to ProposalSystem...");
      const grantRoleTx = await treasury.grantRole(GOVERNOR_ROLE, proposalSystem.address);
      await grantRoleTx.wait();
      console.log("GOVERNOR_ROLE granted to ProposalSystem");
    }
    
    // Create a proposal to send 1 ETH from treasury to user2
    const targets = [treasury.address];
    const values = [ethers.utils.parseEther("0")];
    const calldatas = [
      treasury.interface.encodeFunctionData("allocateFunds", [
        user2.address,
        ethers.utils.parseEther("1"),
        "Test allocation"
      ])
    ];
    const description = "Proposal to send 1 ETH to user2 for testing";
    
    const proposeTx = await proposalSystem.propose(
      targets,
      values,
      calldatas,
      description
    );
    
    const receipt = await proposeTx.wait();
    
    // Find the ProposalCreated event
    const event = receipt.events.find(e => e.event === "ProposalCreated");
    const proposalId = event.args.proposalId;
    
    console.log(`Proposal created with ID: ${proposalId}`);
    
    // Check proposal state
    const state = await proposalSystem.state(proposalId);
    console.log(`Proposal state: ${state}`);
    
  } catch (error) {
    console.error("Error creating proposal:", error.message);
  }
  
  console.log("\nContract interaction test completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 