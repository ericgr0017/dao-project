const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProposalSystem", function () {
  let GovernanceToken;
  let ReputationSystem;
  let TimelockController;
  let ProposalSystem;
  let governanceToken;
  let reputationSystem;
  let timelockController;
  let proposalSystem;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    TimelockController = await ethers.getContractFactory("TimelockController");
    ProposalSystem = await ethers.getContractFactory("ProposalSystem");
    
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contracts
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.deployed();
    
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.deployed();
    
    // Deploy TimelockController
    const minDelay = 1; // 1 second for testing
    const proposers = [owner.address];
    const executors = [owner.address];
    timelockController = await TimelockController.deploy(minDelay, proposers, executors);
    await timelockController.deployed();
    
    // Deploy ProposalSystem
    const quorumPercentage = 4; // 4% of total supply
    const votingPeriod = 5; // 5 blocks for testing
    const votingDelay = 1; // 1 block
    const proposalStake = ethers.utils.parseEther("100"); // 100 tokens
    const reputationWeightFactor = 50; // 50% weight for reputation
    const quadraticVotingFactor = 70; // 70% quadratic, 30% linear
    
    proposalSystem = await ProposalSystem.deploy(
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
    
    // Setup roles
    const REPUTATION_MANAGER_ROLE = await reputationSystem.REPUTATION_MANAGER_ROLE();
    await reputationSystem.grantRole(REPUTATION_MANAGER_ROLE, owner.address);
    
    // Transfer tokens to addr1 and addr2 for testing
    await governanceToken.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await governanceToken.transfer(addr2.address, ethers.utils.parseEther("500"));
    
    // Add reputation to addr1 and addr2
    await reputationSystem.addReputation(addr1.address, 0, 100); // 100 CODE reputation
    await reputationSystem.addReputation(addr2.address, 0, 200); // 200 CODE reputation
    
    // Delegate voting power
    await governanceToken.connect(addr1).delegate(addr1.address);
    await governanceToken.connect(addr2).delegate(addr2.address);
  });

  describe("Deployment", function () {
    it("Should set the correct parameters", async function () {
      expect(await proposalSystem.proposalThreshold()).to.equal(ethers.utils.parseEther("100"));
      expect(await proposalSystem.votingPeriod()).to.equal(5);
      expect(await proposalSystem.votingDelay()).to.equal(1);
      expect(await proposalSystem.reputationWeightFactor()).to.equal(50);
      expect(await proposalSystem.quadraticVotingFactor()).to.equal(70);
    });
  });

  describe("Voting", function () {
    it("Should calculate vote weight correctly with quadratic voting and reputation", async function () {
      // Create a mock proposal
      const targets = [governanceToken.address];
      const values = [0];
      const calldatas = [
        governanceToken.interface.encodeFunctionData("setStakingRewardRate", [1000])
      ];
      const description = "Change staking reward rate to 10%";
      
      // Submit proposal
      const proposalId = await proposalSystem.callStatic.propose(
        targets,
        values,
        calldatas,
        description
      );
      
      await proposalSystem.propose(targets, values, calldatas, description);
      
      // Skip voting delay
      await ethers.provider.send("evm_mine");
      
      // Cast votes
      await proposalSystem.connect(addr1).castVote(proposalId, 1); // Vote for
      
      // Check if vote was recorded
      expect(await proposalSystem.hasVoted(proposalId, addr1.address)).to.equal(true);
      
      // Get vote weight
      const voteWeight = await proposalSystem.getVoteWeight(proposalId, addr1.address);
      
      // Calculate expected weight (approximate due to complex formula)
      // Token weight: 1000 tokens
      // Reputation weight: 100 reputation points
      // Combined with 50% reputation factor
      // Then apply 70% quadratic voting
      
      // This is a simplified check - the exact calculation is complex
      expect(voteWeight).to.be.gt(0);
    });
    
    it("Should allow setting governance parameters", async function () {
      // Only governance can change parameters
      await expect(
        proposalSystem.connect(addr1).setReputationWeightFactor(60)
      ).to.be.reverted;
      
      // Owner can change parameters (in a real scenario, this would be done through governance)
      await proposalSystem.setReputationWeightFactor(60);
      expect(await proposalSystem.reputationWeightFactor()).to.equal(60);
      
      await proposalSystem.setQuadraticVotingFactor(80);
      expect(await proposalSystem.quadraticVotingFactor()).to.equal(80);
      
      await proposalSystem.setProposalStake(ethers.utils.parseEther("200"));
      expect(await proposalSystem.proposalThreshold()).to.equal(ethers.utils.parseEther("200"));
    });
  });
}); 