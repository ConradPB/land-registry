const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying LandRegistry contract with account:", deployer.address);

  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const registry = await LandRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("LandRegistry deployed to:", contractAddress);

  // Mint standard demo titles for instant testing
  console.log("Minting demo titles to deployer address...");

  // Land 101: Nairobi
  await registry.mintTitle(
    deployer.address,
    101,
    "LR-NBO-101",
    "Nairobi, Kilimani (GPS: -1.289, 36.806)",
    450,
    "ipfs://QmLandParcel101Details"
  );
  console.log("Minted Land #101 (Nairobi) to deployer");

  // Land 102: Mombasa (Disputed)
  await registry.mintTitle(
    deployer.address,
    102,
    "LR-MSA-102",
    "Mombasa, Nyali (GPS: -4.043, 39.699)",
    1200,
    "ipfs://QmLandParcel102Details"
  );
  await registry.setDisputeStatus(102, true);
  console.log("Minted Land #102 (Mombasa - Flagged as DISPUTED) to deployer");

  // Land 103: Kisumu
  await registry.mintTitle(
    deployer.address,
    103,
    "LR-KIS-103",
    "Kisumu, Milimani (GPS: -0.102, 34.761)",
    850,
    "ipfs://QmLandParcel103Details"
  );
  console.log("Minted Land #103 (Kisumu) to deployer");

  console.log("\nDemo setup completed successfully!");
  console.log("=================================================================");
  console.log("Add the following environment variables to your Supabase/Deno environment:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log("RPC_PROVIDER_URL=http://127.0.0.1:8545");
  console.log("=================================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
