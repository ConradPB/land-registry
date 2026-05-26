const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry Smart Contract", function () {
  let LandRegistry;
  let registry;
  let owner;
  let citizen1;
  let citizen2;

  beforeEach(async function () {
    // Get signers
    [owner, citizen1, citizen2] = await ethers.getSigners();

    // Deploy contract
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    registry = await LandRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await registry.name()).to.equal("LandRegistry");
      expect(await registry.symbol()).to.equal("LAND");
    });

    it("Should set the deployer as the owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });
  });

  describe("Minting Title Deeds", function () {
    it("Should allow owner to mint land titles with full parcel details", async function () {
      const tokenId = 101;
      const titleNumber = "LR-NBO-101";
      const location = "Nairobi, Kilimani (GPS: -1.289, 36.806)";
      const size = 450;
      const metadataURI = "ipfs://QmLandParcel101Details";

      // Mint title to citizen1
      await expect(
        registry.mintTitle(citizen1.address, tokenId, titleNumber, location, size, metadataURI)
      )
        .to.emit(registry, "TitleMinted")
        .withArgs(citizen1.address, tokenId, titleNumber, location);

      // Verify ownership
      expect(await registry.ownerOf(tokenId)).to.equal(citizen1.address);
      expect(await registry.exists(tokenId)).to.be.true;

      // Verify details
      const parcel = await registry.getLandParcel(tokenId);
      expect(parcel.id).to.equal(tokenId);
      expect(parcel.titleNumber).to.equal(titleNumber);
      expect(parcel.location).to.equal(location);
      expect(parcel.sizeInSqMeters).to.equal(size);
      expect(parcel.isDisputed).to.be.false;
      expect(parcel.metadataURI).to.equal(metadataURI);
      expect(parcel.currentOwner).to.equal(citizen1.address);
    });

    it("Should fail if a non-owner tries to mint a title", async function () {
      await expect(
        registry.connect(citizen1).mintTitle(
          citizen2.address,
          102,
          "LR-MSA-102",
          "Mombasa",
          500,
          "ipfs://QmSomeMetadata"
        )
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should fail if minting a duplicate token ID", async function () {
      await registry.mintTitle(citizen1.address, 101, "LR-NBO-101", "Nairobi", 450, "ipfs://1");
      
      await expect(
        registry.mintTitle(citizen2.address, 101, "LR-NBO-101-DUP", "Nairobi", 500, "ipfs://2")
      ).to.be.reverted; // ERC721InvalidSender or ERC721AlreadyMinted depending on exact ERC721 error in OZ v5
    });
  });

  describe("ERC721Enumerable Operations", function () {
    it("Should correctly track token balances and allow enumerating owned tokens", async function () {
      const lands = [
        { id: 101, title: "LR-NBO-101", size: 450 },
        { id: 103, title: "LR-KIS-103", size: 850 }
      ];

      // Mint two lands to citizen1
      for (const land of lands) {
        await registry.mintTitle(citizen1.address, land.id, land.title, "Location", land.size, "ipfs://uri");
      }

      // Verify balance
      expect(await registry.balanceOf(citizen1.address)).to.equal(2);

      // Verify token listing indices
      expect(await registry.tokenOfOwnerByIndex(citizen1.address, 0)).to.equal(101);
      expect(await registry.tokenOfOwnerByIndex(citizen1.address, 1)).to.equal(103);
    });
  });

  describe("Legal Disputes & Transfer Freezing", function () {
    const tokenId = 102;

    beforeEach(async function () {
      await registry.mintTitle(
        citizen1.address,
        tokenId,
        "LR-MSA-102",
        "Mombasa, Nyali",
        1200,
        "ipfs://QmLandParcel102Details"
      );
    });

    it("Should default to undisputed status", async function () {
      expect(await registry.isTitleDisputed(tokenId)).to.be.false;
      const parcel = await registry.getLandParcel(tokenId);
      expect(parcel.isDisputed).to.be.false;
    });

    it("Should allow the owner (Ministry) to set dispute status", async function () {
      await expect(registry.setDisputeStatus(tokenId, true))
        .to.emit(registry, "DisputeStatusChanged")
        .withArgs(tokenId, true);

      expect(await registry.isTitleDisputed(tokenId)).to.be.true;
      
      const parcel = await registry.getLandParcel(tokenId);
      expect(parcel.isDisputed).to.be.true;
    });

    it("Should reject dispute status changes by non-owners", async function () {
      await expect(
        registry.connect(citizen1).setDisputeStatus(tokenId, true)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should prevent transfers of titles that are under dispute", async function () {
      // Set dispute
      await registry.setDisputeStatus(tokenId, true);

      // Attempt standard transfer
      await expect(
        registry.connect(citizen1).transferFrom(citizen1.address, citizen2.address, tokenId)
      ).to.be.revertedWith("LandRegistry: Title is under dispute and frozen");

      // Attempt safe transfer
      await expect(
        registry.connect(citizen1)["safeTransferFrom(address,address,uint256)"](
          citizen1.address,
          citizen2.address,
          tokenId
        )
      ).to.be.revertedWith("LandRegistry: Title is under dispute and frozen");
    });

    it("Should allow transfers of titles once the dispute status is cleared", async function () {
      // Freeze
      await registry.setDisputeStatus(tokenId, true);

      // Unfreeze
      await registry.setDisputeStatus(tokenId, false);

      // Transfer should succeed
      await registry.connect(citizen1).transferFrom(citizen1.address, citizen2.address, tokenId);
      expect(await registry.ownerOf(tokenId)).to.equal(citizen2.address);

      // Dynamic getter should reflect new owner
      const parcel = await registry.getLandParcel(tokenId);
      expect(parcel.currentOwner).to.equal(citizen2.address);
    });
  });
});
