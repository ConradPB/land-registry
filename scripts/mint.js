const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  
  const contract = await ethers.getContractAt(
    "LandRegistry",
    "0xc6A41798d3BC687c53053936cFD1975eb6206Cfb"
  );

  console.log("Minting land parcel...");
  
  const tx = await contract.mintTitle(
    owner.address,
    "LR-KLA-001",
    "Kampala, Kololo (GPS: 0.323, 32.585)",
    450,
    "ipfs://demo"
  );

  await tx.wait();
  console.log("Minted! Token ID: 0");
  console.log("Transaction:", tx.hash);
}

main().catch(console.error);