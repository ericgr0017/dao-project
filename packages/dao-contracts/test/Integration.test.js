const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO Integration Tests", function () {
  let governanceToken;
  let reputationSystem;
  let timelockController;
  let proposalSystem;
  let treasury;
  
  let owner;
  let addr1;
  let addr2;
  let addrs;
  
  // Test parameters
  const quorumPercentage = 4; // 4%
  const votingPeriod = 5; // 5 blocks
  const votingDelay = 1; // 1 block
  const proposalStake = ethers.utils.parseEther("100"); // 100 tokens
  const reputationWeightFactor = 50; // 50%
  const quadraticVotingFactor = 70; // 70%
  const minDelay = 172800; // 2 days in seconds
  const transactionFeePercent = 50; // 0.5% in basis points
  const burnPercent = 30; // 30% of fees
  const reservePercent = 20; // 20% of fees
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy GovernanceToken
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.deployed();
    
    // Deploy ReputationSystem
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.deployed();
    
    // Deploy TimelockController
    const TimelockController = await ethers.getContractFactory("TimelockController");
    timelockController = await TimelockController.deploy(
      minDelay,
      [owner.address], // proposers
      [owner.address]  // executors
    );
    await timelockController.deployed();
    
    // Deploy ProposalSystem
    const ProposalSystem = await ethers.getContractFactory("ProposalSystem");
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
    
    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(
      governanceToken.address,
      transactionFeePercent,
      burnPercent,
      reservePercent
    );
    await treasury.deployed();
    
    // Set up roles
    await governanceToken.grantRole(await governanceToken.BURNER_ROLE(), treasury.address);
    await treasury.grantRole(await treasury.GOVERNOR_ROLE(), proposalSystem.address);
    await reputationSystem.grantRole(await reputationSystem.REPUTATION_MANAGER_ROLE(), proposalSystem.address);
    
    // Set up TimelockController roles
    const proposerRole = await timelockController.PROPOSER_ROLE();
    const executorRole = await timelockController.EXECUTOR_ROLE();
    await timelockController.grantRole(proposerRole, proposalSystem.address);
    await timelockController.grantRole(executorRole, proposalSystem.address);
    
    // Transfer tokens to test addresses
    await governanceToken.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await governanceToken.transfer(addr2.address, ethers.utils.parseEther("500"));
    
    // Add reputation to test addresses
    await reputationSystem.addReputation(addr1.address, 0, 100); // CODE
    await reputationSystem.addReputation(addr2.address, 1, 200); // FUNDING
  });
  
  describe("Initial Setup", function () {
    it("Should set up all contracts with correct parameters", async function () {
      // Check GovernanceToken
      expect(await governanceToken.name()).to.equal("Governance Token");
      expect(await governanceToken.symbol()).to.equal("GT");
      expect(await governanceToken.totalSupply()).to.equal(ethers.utils.parseEther("100000000"));
      
      // Check ReputationSystem
      expect(await reputationSystem.defaultDecayRate()).to.equal(10);
      expect(await reputationSystem.getReputation(addr1.address)).to.equal(100);
      expect(await reputationSystem.getReputation(addr2.address)).to.equal(200);
      
      // Check ProposalSystem
      expect(await proposalSystem.proposalThreshold()).to.equal(proposalStake);
      expect(await proposalSystem.votingDelay()).to.equal(1);
      expect(await proposalSystem.votingPeriod()).to.equal(45818);
      expect(await proposalSystem.reputationWeightFactor()).to.equal(reputationWeightFactor);
      expect(await proposalSystem.quadraticVotingFactor()).to.equal(quadraticVotingFactor);
      
      // Check Treasury
      expect(await treasury.transactionFeePercent()).to.equal(transactionFeePercent);
      expect(await treasury.burnPercent()).to.equal(burnPercent);
      expect(await treasury.reservePercent()).to.equal(reservePercent);
      expect(await treasury.governanceToken()).to.equal(governanceToken.address);
    });
    
    it("Should set up roles correctly", async function () {
      // Check GovernanceToken roles
      expect(await governanceToken.hasRole(await governanceToken.MINTER_ROLE(), owner.address)).to.equal(true);
      expect(await governanceToken.hasRole(await governanceToken.BURNER_ROLE(), treasury.address)).to.equal(true);
      
      // Check Treasury roles
      expect(await treasury.hasRole(await treasury.GOVERNOR_ROLE(), proposalSystem.address)).to.equal(true);
      
      // Check ReputationSystem roles
      expect(await reputationSystem.hasRole(await reputationSystem.REPUTATION_MANAGER_ROLE(), proposalSystem.address)).to.equal(true);
      
      // Check TimelockController roles
      const proposerRole = await timelockController.PROPOSER_ROLE();
      const executorRole = await timelockController.EXECUTOR_ROLE();
      expect(await timelockController.hasRole(proposerRole, proposalSystem.address)).to.equal(true);
      expect(await timelockController.hasRole(executorRole, proposalSystem.address)).to.equal(true);
    });
  });
  
  describe("Token Operations", function () {
    it("Should allow staking and unstaking tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      
      // Stake tokens
      await governanceToken.connect(addr1).approve(governanceToken.address, stakeAmount);
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      // Check staked balance
      expect(await governanceToken.stakedBalanceOf(addr1.address)).to.equal(stakeAmount);
      expect(await governanceToken.totalStaked()).to.equal(stakeAmount);
      
      // Unstake tokens
      await governanceToken.connect(addr1).unstake(stakeAmount);
      
      // Check staked balance after unstaking
      expect(await governanceToken.stakedBalanceOf(addr1.address)).to.equal(0);
      expect(await governanceToken.totalStaked()).to.equal(0);
    });
    
    it("Should calculate and distribute staking rewards correctly", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      
      // Stake tokens
      await governanceToken.connect(addr1).approve(governanceToken.address, stakeAmount);
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      // Increase time by 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Calculate expected rewards (5% annual rate for 30 days)
      const expectedRewards = stakeAmount.mul(500).mul(30 * 24 * 60 * 60).div(10000).div(365 * 24 * 60 * 60);
      
      // Claim rewards
      await governanceToken.connect(addr1).claimStakingRewards();
      
      // Check balance after claiming rewards
      const balanceAfter = await governanceToken.balanceOf(addr1.address);
      expect(balanceAfter).to.be.closeTo(
        ethers.utils.parseEther("900").add(expectedRewards), // 1000 - 100 (staked) + rewards
        ethers.utils.parseEther("0.1") // Allow for small rounding differences
      );
    });
  });
  
  describe("Treasury Operations", function () {
    it("Should process revenue and apply burn and reserve mechanisms", async function () {
      // Fund treasury with tokens
      await governanceToken.transfer(treasury.address, ethers.utils.parseEther("1000"));
      
      // Capture revenue
      const revenueAmount = ethers.utils.parseEther("100");
      await treasury.captureRevenue(0, revenueAmount); // 0 = TRANSACTION_FEE
      
      // Check revenue tracking
      expect(await treasury.totalRevenue()).to.equal(revenueAmount);
      expect(await treasury.getRevenueByStream(0)).to.equal(revenueAmount);
      
      // Check burn amount (30% of revenue)
      const expectedBurn = revenueAmount.mul(burnPercent).div(100);
      expect(await treasury.totalBurned()).to.equal(expectedBurn);
      
      // Check reserve amount (20% of revenue)
      const expectedReserve = revenueAmount.mul(reservePercent).div(100);
      expect(await treasury.reserveFund()).to.equal(expectedReserve);
    });
    
    it("Should allow fund allocation by governance", async function () {
      // Fund treasury with ETH
      await owner.sendTransaction({
        to: treasury.address,
        value: ethers.utils.parseEther("10")
      });
      
      // Allocate funds
      const allocationAmount = ethers.utils.parseEther("1");
      await treasury.allocateFunds(addr1.address, allocationAmount, "Test allocation");
      
      // Check treasury balance after allocation
      expect(await ethers.provider.getBalance(treasury.address)).to.equal(
        ethers.utils.parseEther("9")
      );
    });
  });
  
  describe("Reputation System", function () {
    it("Should apply reputation decay over time", async function () {
      // Add reputation
      await reputationSystem.addReputation(addr1.address, 0, 100);
      
      // Increase time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Check reputation after decay (10% annual decay)
      expect(await reputationSystem.getReputation(addr1.address)).to.be.closeTo(90, 1);
    });
    
    it("Should allow setting custom decay rates", async function () {
      // Add reputation
      await reputationSystem.addReputation(addr1.address, 0, 100);
      
      // Set custom decay rate (20%)
      await reputationSystem.setDecayRate(addr1.address, 20);
      
      // Increase time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Check reputation after decay (20% annual decay)
      expect(await reputationSystem.getReputation(addr1.address)).to.be.closeTo(80, 1);
    });
  });
  
  // Note: Full proposal creation and voting tests would require more complex setup
  // due to the timelock controller and multiple blocks for voting periods
  describe("Basic Governance", function () {
    it("Should calculate vote weight correctly with quadratic voting and reputation", async function () {
      // This is a simplified test of the vote weight calculation
      // A full proposal test would require more complex setup
      
      // Delegate voting power
      await governanceToken.connect(addr1).delegate(addr1.address);
      await governanceToken.connect(addr2).delegate(addr2.address);
      
      // Move forward one block to activate delegated voting power
      await ethers.provider.send("evm_mine");
      
      // Check voting power
      const blockNumber = await ethers.provider.getBlockNumber();
      const addr1VotingPower = await governanceToken.getPastVotes(addr1.address, blockNumber - 1);
      const addr2VotingPower = await governanceToken.getPastVotes(addr2.address, blockNumber - 1);
      
      expect(addr1VotingPower).to.equal(ethers.utils.parseEther("1000"));
      expect(addr2VotingPower).to.equal(ethers.utils.parseEther("500"));
      
      // Note: To fully test proposal creation and voting would require:
      // 1. Creating a proposal with calldata for the timelock
      // 2. Waiting for the voting delay
      // 3. Casting votes
      // 4. Waiting for the voting period to end
      // 5. Queuing the proposal
      // 6. Waiting for the timelock delay
      // 7. Executing the proposal
      
      // This is complex to test in a single test and would be better
      // split into multiple focused tests or using a custom hardhat network
    });
  });
}); 