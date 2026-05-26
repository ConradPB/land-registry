# 📜 Digital Land Registry Prototype

A secure, transparent, and mobile-accessible land title verification system leveraging **Blockchain Technology** and **USSD** to eliminate double-selling and streamline title deed lookup on standard feature phones.

---

## 🚀 Key Features

- **On-Chain Title Registry (`ERC-721`)**: Each title deed is represented as a secure, unique digital asset minted by the Ministry of Lands.
- **Legal Dispute Freezing**: Enables the registry authority to flag land parcels under dispute, instantly freezing transfers and preventing fraudulent sales.
- **USSD Interactive Interface**: Enables off-grid citizens to verify titles and lookup ownership history using standard dial codes without requiring smartphones or mobile data.
- **Smart Fallback Framework**: Integrated demo database allowing seamless verification (using demo IDs `101`, `102`, `103`) even if connection to the RPC node is offline.

---

## 📂 Repository Structure

```filepath
├── contracts/
│   └── LandRegistry.sol          # Solidity Smart Contract (ERC-721 Title Deeds)
├── supabase/
│   └── functions/
│       └── ussd-handler/
│           └── index.ts          # Supabase Edge Function (Deno USSD Gateway API)
├── package.json                  # Node.js dependencies & scripts
└── README.md                     # Project documentation
```

---

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity, OpenZeppelin (ERC-721, Ownable), Hardhat/Foundry compatible.
- **Backend / Edge**: Supabase Edge Functions (Deno runtime), Ethers.js (v6) for on-chain querying.
- **Gateway Support**: Optimized for Africa's Talking USSD standard HTTP request-response formats.

---

## 🛠️ Local Development & Hardhat Tooling

This repository comes equipped with a modern, fully-configured **Hardhat** workspace to build, test, and deploy the `LandRegistry` smart contract.

### 1. Compile & Build Smart Contracts
Compile the Solidity code using Hardhat's optimized compiler configuration:
```bash
npx hardhat compile
```

### 2. Run Smart Contract Test Suite
Verify security controls, dispute freezings, transfers, and listing queries using Mocha/Chai:
```bash
npx hardhat test
```

### 3. Deploy to a Local Blockchain Node
Spin up a local EVM network node and deploy the contract with pre-configured demo properties:
1. **Start the local Hardhat Node**:
   ```bash
   npx hardhat node
   ```
2. **Deploy and Mint Demo Titles** (in a separate terminal):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   *Note: This script automatically deploys the contract and mints three properties (Land #101, #102, #103) to the first local wallet address (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`). Land #102 is flagged as disputed.*

---

## 🚀 Supabase Deno USSD Gateway Setup

The USSD gateway is built as a Supabase Edge Function using Deno. It features a smart fallback model allowing dynamic on-chain lookups when online, and mock lookups when offline.

### 1. Run Deno Gateway Locally
If you have Deno installed, you can start the HTTP listener locally:
```bash
deno run --allow-net --allow-env supabase/functions/ussd-handler/index.ts
```

### 2. Configure Environment Variables
To connect the Deno gateway to your local blockchain network, set the following environment variables (e.g., in your Supabase dashboard or local edge function `.env` file):
```env
RPC_PROVIDER_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 📱 Dynamic USSD Testing Guide

Use the following sequence to test the interactive USSD interface:

### Option 1: Verify Land Title (On-Chain)
1. Dial your service code, select `1. Verify Land Title`.
2. Input Land Token ID: `101`, `102`, or `103`.
3. If connected on-chain, you'll see the live verified properties:
   - **Land 101**: Nairobi (Clean & Verified)
   - **Land 102**: Mombasa (Disputed & Frozen)
   - **Land 103**: Kisumu (Clean & Verified)

### Option 2: Check My Lands (On-Chain Enumerable)
1. Select `2. Check My Lands`.
2. Input the deployer's public address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`.
3. The Deno gateway dynamically queries the blockchain and retrieves the full, live enumerable list of lands registered to that address in real-time.

