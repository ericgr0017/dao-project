const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernanceToken", function () {
  let GovernanceToken;
  let governanceToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new GovernanceToken contract before each test
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await governanceToken.hasRole(await governanceToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await governanceToken.balanceOf(owner.address);
      expect(await governanceToken.totalSupply()).to.equal(ownerBalance);
    });
    
    it("Should set the initial supply correctly", async function () {
      const initialSupply = ethers.utils.parseEther("100000000"); // 100 million
      expect(await governanceToken.totalSupply()).to.equal(initialSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await governanceToken.transfer(addr1.address, 50);
      const addr1Balance = await governanceToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await governanceToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await governanceToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await governanceToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        governanceToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed
      expect(await governanceToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
  
  describe("Minting", function () {
    it("Should allow minting by minter role", async function () {
      const initialSupply = await governanceToken.totalSupply();
      const mintAmount = ethers.utils.parseEther("1000");
      
      await governanceToken.mint(addr1.address, mintAmount);
      
      expect(await governanceToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await governanceToken.totalSupply()).to.equal(initialSupply.add(mintAmount));
    });
    
    it("Should not allow minting by non-minter role", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(
        governanceToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.reverted;
    });
    
    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await governanceToken.MAX_SUPPLY();
      const currentSupply = await governanceToken.totalSupply();
      const mintAmount = maxSupply.sub(currentSupply).add(1); // Exceed by 1
      
      await expect(
        governanceToken.mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });
  
  describe("Burning", function () {
    it("Should allow burning by burner role", async function () {
      // First mint some tokens to the burner
      const mintAmount = ethers.utils.parseEther("1000");
      await governanceToken.mint(owner.address, mintAmount);
      
      const initialSupply = await governanceToken.totalSupply();
      const burnAmount = ethers.utils.parseEther("500");
      
      await governanceToken.burn(burnAmount);
      
      expect(await governanceToken.totalSupply()).to.equal(initialSupply.sub(burnAmount));
    });
    
    it("Should not allow burning by non-burner role", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      await expect(
        governanceToken.connect(addr1).burn(burnAmount)
      ).to.be.reverted;
    });
  });
  
  describe("Staking", function () {
    beforeEach(async function () {
      // Transfer some tokens to addr1 for staking tests
      const transferAmount = ethers.utils.parseEther("1000");
      await governanceToken.transfer(addr1.address, transferAmount);
    });
    
    it("Should allow staking tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("500");
      
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      expect(await governanceToken.stakedBalanceOf(addr1.address)).to.equal(stakeAmount);
      expect(await governanceToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("500"));
      expect(await governanceToken.totalStaked()).to.equal(stakeAmount);
    });
    
    it("Should allow unstaking tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("500");
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      // Unstake half
      const unstakeAmount = ethers.utils.parseEther("250");
      await governanceToken.connect(addr1).unstake(unstakeAmount);
      
      expect(await governanceToken.stakedBalanceOf(addr1.address)).to.equal(stakeAmount.sub(unstakeAmount));
      expect(await governanceToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("750"));
      expect(await governanceToken.totalStaked()).to.equal(stakeAmount.sub(unstakeAmount));
    });
    
    it("Should not allow unstaking more than staked", async function () {
      const stakeAmount = ethers.utils.parseEther("500");
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      const unstakeAmount = ethers.utils.parseEther("600");
      await expect(
        governanceToken.connect(addr1).unstake(unstakeAmount)
      ).to.be.revertedWith("Insufficient staked balance");
    });
    
    it("Should calculate staking rewards correctly", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      // Increase time by 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Calculate expected rewards (approximate due to block timing variations)
      // 5% annual rate for 30 days = ~0.41% of staked amount
      const expectedRewardsApprox = stakeAmount.mul(5).div(100).mul(30).div(365);
      const calculatedRewards = await governanceToken.calculateStakingRewards(addr1.address);
      
      // Allow for small variations due to block timing
      expect(calculatedRewards).to.be.closeTo(expectedRewardsApprox, ethers.utils.parseEther("0.1"));
    });
    
    it("Should allow claiming staking rewards", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      await governanceToken.connect(addr1).stake(stakeAmount);
      
      // Increase time by 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await governanceToken.balanceOf(addr1.address);
      const calculatedRewards = await governanceToken.calculateStakingRewards(addr1.address);
      
      await governanceToken.connect(addr1).claimStakingRewards();
      
      const newBalance = await governanceToken.balanceOf(addr1.address);
      expect(newBalance).to.be.closeTo(initialBalance.add(calculatedRewards), ethers.utils.parseEther("0.1"));
    });
  });
}); 