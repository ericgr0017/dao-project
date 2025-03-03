const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem", function () {
  let ReputationSystem;
  let reputationSystem;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new ReputationSystem contract before each test
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await reputationSystem.hasRole(await reputationSystem.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await reputationSystem.hasRole(await reputationSystem.REPUTATION_MANAGER_ROLE(), owner.address)).to.equal(true);
    });
    
    it("Should set the default decay rate", async function () {
      expect(await reputationSystem.defaultDecayRate()).to.equal(10); // 10% per year
    });
  });

  describe("Reputation Management", function () {
    it("Should add reputation correctly", async function () {
      await reputationSystem.addReputation(addr1.address, 0, 100); // 100 CODE reputation
      
      expect(await reputationSystem.getReputation(addr1.address)).to.equal(100);
      expect(await reputationSystem.getContributionByType(addr1.address, 0)).to.equal(100);
      expect(await reputationSystem.getTotalReputation()).to.equal(100);
    });
    
    it("Should add reputation for different contribution types", async function () {
      await reputationSystem.addReputation(addr1.address, 0, 100); // CODE
      await reputationSystem.addReputation(addr1.address, 1, 200); // FUNDING
      await reputationSystem.addReputation(addr1.address, 2, 150); // CONTENT
      await reputationSystem.addReputation(addr1.address, 3, 50);  // GOVERNANCE
      
      expect(await reputationSystem.getReputation(addr1.address)).to.equal(500);
      expect(await reputationSystem.getContributionByType(addr1.address, 0)).to.equal(100);
      expect(await reputationSystem.getContributionByType(addr1.address, 1)).to.equal(200);
      expect(await reputationSystem.getContributionByType(addr1.address, 2)).to.equal(150);
      expect(await reputationSystem.getContributionByType(addr1.address, 3)).to.equal(50);
      expect(await reputationSystem.getTotalReputation()).to.equal(500);
    });
    
    it("Should not allow adding reputation by non-managers", async function () {
      await expect(
        reputationSystem.connect(addr1).addReputation(addr2.address, 0, 100)
      ).to.be.reverted;
    });
  });

  describe("Reputation Decay", function () {
    it("Should apply decay correctly over time", async function () {
      await reputationSystem.addReputation(addr1.address, 0, 100);
      
      // Increase time by 6 months (half a year)
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // With 10% annual decay, after 6 months should be ~95% of original
      const expectedReputation = 100 * 0.95; // Approximate
      const actualReputation = await reputationSystem.getReputation(addr1.address);
      
      // Allow for small variations due to block timing
      expect(actualReputation).to.be.closeTo(expectedReputation, 1);
    });
    
    it("Should apply decay when adding new reputation", async function () {
      await reputationSystem.addReputation(addr1.address, 0, 100);
      
      // Increase time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Add more reputation
      await reputationSystem.addReputation(addr1.address, 0, 100);
      
      // After 1 year with 10% decay, first 100 should be 90, plus new 100 = 190
      expect(await reputationSystem.getReputation(addr1.address)).to.be.closeTo(190, 1);
    });
    
    it("Should allow setting custom decay rates", async function () {
      await reputationSystem.addReputation(addr1.address, 0, 100);
      
      // Set a higher decay rate for addr1
      await reputationSystem.setDecayRate(addr1.address, 20); // 20% per year
      
      // Increase time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // With 20% annual decay, after 1 year should be 80% of original
      expect(await reputationSystem.getReputation(addr1.address)).to.be.closeTo(80, 1);
    });
    
    it("Should allow setting default decay rate", async function () {
      await reputationSystem.setDefaultDecayRate(5); // 5% per year
      expect(await reputationSystem.defaultDecayRate()).to.equal(5);
      
      // New users should get the new default rate
      await reputationSystem.addReputation(addr2.address, 0, 100);
      
      // Increase time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // With 5% annual decay, after 1 year should be 95% of original
      expect(await reputationSystem.getReputation(addr2.address)).to.be.closeTo(95, 1);
    });
  });
}); 