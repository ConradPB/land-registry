const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();

  const contract = await ethers.getContractAt(
    "LandRegistry",
    "0xc6A41798d3BC687c53053936cFD1975eb6206Cfb"
  );

  const parcels = [
    {
      titleNumber: "LR-WKS-002",
      location: "Wakiso, Nansana (GPS: 0.365, 32.521)",
      size: 600,
      metadataURI: "ipfs://demo-2"
    },
    {
      titleNumber: "LR-JJA-003",
      location: "Jinja, Bugembe (GPS: 0.449, 33.211)",
      size: 1200,
      metadataURI: "ipfs://demo-3"
    },
    {
      titleNumber: "LR-MBR-004",
      location: "Mbarara, Kakoba (GPS: -0.607, 30.654)",
      size: 850,
      metadataURI: "ipfs://demo-4"
    },
    {
      titleNumber: "LR-GLU-005",
      location: "Gulu, Pece (GPS: 2.774, 32.299)",
      size: 2000,
      metadataURI: "ipfs://demo-5"
    }
  ];

  for (let i = 0; i < parcels.length; i++) {
    const p = parcels[i];
    console.log(`Minting ${p.titleNumber}...`);
    const tx = await contract.mintTitle(
      owner.address,
      p.titleNumber,
      p.location,
      p.size,
      p.metadataURI
    );
    await tx.wait();
    console.log(`✅ Minted token ID ${i + 1} — ${p.titleNumber}`);
  }

  // Flag token ID 3 (Mbarara) as disputed
  console.log("\nFlagging LR-MBR-004 as disputed...");
  const disputeTx = await contract.setDisputeStatus(3, true);
  await disputeTx.wait();
  console.log("⚠️  Token #3 flagged as DISPUTED / FROZEN");

  console.log("\n✅ All done. Parcels on chain:");
  console.log("  #0 — LR-KLA-001 Kampala Kololo        CLEAN");
  console.log("  #1 — LR-WKS-002 Wakiso Nansana         CLEAN");
  console.log("  #2 — LR-JJA-003 Jinja Bugembe          CLEAN");
  console.log("  #3 — LR-MBR-004 Mbarara Kakoba         DISPUTED ⚠️");
  console.log("  #4 — LR-GLU-005 Gulu Pece              CLEAN");
}

main().catch(console.error);