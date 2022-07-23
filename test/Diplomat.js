const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

describe("Diplomat", function () {
 
  async function setup() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, college] = await ethers.getSigners();

    const Diplomat = await ethers.getContractFactory("Diplomat");
    const diplomat = await Diplomat.deploy();

    await diplomat.setAdmin(owner.address, true);

    return { diplomat, owner, otherAccount, college };
  }

  describe("Deployment", function () {
    it("Should set the nft url", async function () {
      const { diplomat, owner, otherAccount, college } = await loadFixture(setup);
      await diplomat.connect(owner).createDiplomat("ipfs://somehash", college.address);
      expect(await diplomat.connect(owner).createDiplomat("ipfs://fooo", college.address))
        .to.be.revertedWith("Diplomat already exists");

      await expect(diplomat.connect(otherAccount)
        .createDiplomat("ipfs://cool", college.address)).to.be.reverted;
    });

    it("Basic setup, mint & soulbound", async function () {
      const { diplomat, owner, otherAccount, college } = await loadFixture(setup);

      // not allowed bacause its not setup
      await expect(diplomat.connect(owner).mint(otherAccount.address, 1))
        .revertedWith("Diplomat not setup");

        await diplomat.connect(owner).createDiplomat("ipfs://somehash", college.address);

      // even owner can't mint
      await expect(diplomat.connect(owner).mint(otherAccount.address, 1))
        .revertedWith("You are not allow");

      await expect(diplomat.connect(otherAccount).mint(otherAccount.address, 1))
        .revertedWith("You are not allow");

      const tx = await diplomat.connect(college).mint(otherAccount.address, 1);
      await tx.wait();

      await expect(diplomat.connect(college).mint(otherAccount.address, 1)).to.be.reverted;

      expect(await diplomat.balanceOf(otherAccount.address, 1)).to.equal(1);

      await expect(diplomat.connect(otherAccount).safeTransferFrom(
        otherAccount.address,
        college.address,
        1, // token id
        1, // amount
        '0x00')).to.be.rejectedWith("cant transfer soulbound");
    });

    it("Get the allowed diplomats per address", async function () {
      const { diplomat, owner, otherAccount, college } = await loadFixture(setup);
      
      await diplomat.connect(owner).createDiplomat("ipfs://somehash1", college.address);
      
      let diplomatsAllowed;

      for(let i = 0; i < 10; i++) {
        diplomatsAllowed = await diplomat.getAllowedDiplomats(college.address);
        expect(diplomatsAllowed).to.deep.equal([1]);
      }
      
      
      await diplomat.connect(owner).createDiplomat("ipfs://somehash2", college.address);
      await diplomat.connect(owner).createDiplomat("ipfs://somehash3", otherAccount.address);
      await diplomat.connect(owner).createDiplomat("ipfs://somehash4", otherAccount.address);
      await diplomat.connect(owner).createDiplomat("ipfs://somehash5", otherAccount.address);

      diplomatsAllowed = await diplomat.getAllowedDiplomats(otherAccount.address);
      expect(diplomatsAllowed).to.deep.equal([3, 4, 5]);

      diplomatsAllowed = await diplomat.getAllowedDiplomats(college.address);
      expect(diplomatsAllowed).to.deep.equal([1, 2]);

      //const allowed = await diplomat.connect(owner).getAllowedDiplomats(otherAccount.address);
      //expect(allowed.length).to.equal(3);
    })
  });
});
