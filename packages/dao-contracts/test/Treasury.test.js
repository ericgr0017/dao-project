const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury", function () {
  let GovernanceToken;
  let Treasury;
  let governanceToken;
  let treasury;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    Treasury = await ethers.getContractFactory("Treasury");
    
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contracts
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.deployed();
    
    // Deploy Treasury
    const transactionFeePercent = 50; // 0.5% fee (in basis points)
    const burnPercent = 30; // 30% of fees burned
    const reservePercent = 20; // 20% of fees to reserves
    
    treasury = await Treasury.deploy(
      governanceToken.address,
      transactionFeePercent,
      burnPercent,
      reservePercent
    );
    await treasury.deployed();
    
    // Setup roles
    const BURNER_ROLE = await governanceToken.BURNER_ROLE();
    await governanceToken.grantRole(BURNER_ROLE, treasury.address);
    
    const REVENUE_MANAGER_ROLE = await treasury.REVENUE_MANAGER_ROLE();
    await treasury.grantRole(REVENUE_MANAGER_ROLE, owner.address);
    
    // Transfer some tokens to treasury for testing
    await governanceToken.transfer(treasury.address, ethers.utils.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the correct parameters", async function () {
      expect(await treasury.transactionFeePercent()).to.equal(50);
      expect(await treasury.burnPercent()).to.equal(30);
      expect(await treasury.reservePercent()).to.equal(20);
      expect(await treasury.governanceToken()).to.equal(governanceToken.address);
    });
  });

  describe("Fund Allocation", function () {
    beforeEach(async function () {
      // Send some ETH to the treasury
      await owner.sendTransaction({
        to: treasury.address,
        value: ethers.utils.parseEther("10")
      });
    });
    
    it("Should allow allocating ETH funds", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      await treasury.allocateFunds(
        addr1.address,
        ethers.utils.parseEther("1"),
        "Test allocation"
      );
      
      const newBalance = await ethers.provider.getBalance(addr1.address);
      expect(newBalance).to.equal(initialBalance.add(ethers.utils.parseEther("1")));
    });
    
    it("Should allow allocating token funds", async function () {
      const initialBalance = await governanceToken.balanceOf(addr1.address);
      
      await treasury.allocateTokens(
        governanceToken.address,
        addr1.address,
        ethers.utils.parseEther("100"),
        "Test token allocation"
      );
      
      const newBalance = await governanceToken.balanceOf(addr1.address);
      expect(newBalance).to.equal(initialBalance.add(ethers.utils.parseEther("100")));
    });
    
    it("Should not allow non-governors to allocate funds", async function () {
      await expect(
        treasury.connect(addr1).allocateFunds(
          addr2.address,
          ethers.utils.parseEther("1"),
          "Unauthorized allocation"
        )
      ).to.be.reverted;
    });
  });

  describe("Revenue Capture", function () {
    it("Should capture revenue correctly", async function () {
      const transactionAmount = ethers.utils.parseEther("10000");
      
      // Capture revenue
      await treasury.captureRevenue(0, transactionAmount); // 0 = TRANSACTION_FEE
      
      // Check revenue tracking
      const expectedFee = transactionAmount.mul(50).div(10000); // 0.5%
      expect(await treasury.totalRevenue()).to.equal(expectedFee);
      expect(await treasury.getRevenueByStream(0)).to.equal(expectedFee);
      
      // Check reserve fund
      const expectedReserve = expectedFee.mul(20).div(100); // 20% of fee
      expect(await treasury.reserveFund()).to.equal(expectedReserve);
      
      // Check burn amount (this is harder to test directly)
      const expectedBurn = expectedFee.mul(30).div(100); // 30% of fee
      expect(await treasury.totalBurned()).to.equal(expectedBurn);
    });
    
    it("Should process crowdfunding correctly", async function () {
      // First approve treasury to spend tokens
      const fundingAmount = ethers.utils.parseEther("1000");
      await governanceToken.approve(treasury.address, fundingAmount);
      
      // Process crowdfunding
      await treasury.processCrowdfunding(
        governanceToken.address,
        owner.address,
        addr1.address,
        fundingAmount
      );
      
      // Check recipient received funds minus fee
      const expectedFee = fundingAmount.mul(50).div(10000); // 0.5%
      const expectedRecipientAmount = fundingAmount.sub(expectedFee);
      expect(await governanceToken.balanceOf(addr1.address)).to.equal(expectedRecipientAmount);
      
      // Check revenue tracking
      expect(await treasury.getRevenueByStream(1)).to.equal(expectedFee); // 1 = CROWDFUNDING_FEE
    });
    
    it("Should allow setting fee parameters", async function () {
      await treasury.setTransactionFeePercent(75); // 0.75%
      expect(await treasury.transactionFeePercent()).to.equal(75);
      
      await treasury.setBurnPercent(40); // 40%
      expect(await treasury.burnPercent()).to.equal(40);
      
      await treasury.setReservePercent(30); // 30%
      expect(await treasury.reservePercent()).to.equal(30);
    });
    
    it("Should not allow setting invalid parameters", async function () {
      // Fee too high
      await expect(
        treasury.setTransactionFeePercent(101) // > 1%
      ).to.be.revertedWith("Fee too high");
      
      // Percentages exceed 100%
      await expect(
        treasury.setBurnPercent(90) // 90% + 20% > 100%
      ).to.be.revertedWith("Percentages exceed 100%");
      
      await expect(
        treasury.setReservePercent(80) // 30% + 80% > 100%
      ).to.be.revertedWith("Percentages exceed 100%");
    });
  });
}); 