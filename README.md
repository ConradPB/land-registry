# TitleChain 🔗

### Blockchain-Based Digital Land Registry

> _Own it. Prove it. On-chain._

TitleChain tokenizes land title deeds as NFTs on the Polygon blockchain, making ownership records **immutable, tamper-proof, and publicly verifiable** — accessible to anyone with a feature phone via USSD, no internet or smartphone required.

---

## 🌍 Live Deployment

| Component         | Status                         | Link                                                                                             |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Smart Contract    | ✅ LIVE — Polygon Amoy Testnet | [0xc6A4...6Cfb](https://amoy.polygonscan.com/address/0xc6A41798d3BC687c53053936cFD1975eb6206Cfb) |
| USSD API Endpoint | ✅ LIVE — Supabase Edge        | `https://uggnvrxlcakygzqjdrrx.supabase.co/functions/v1/rapid-service`                            |
| Land Parcel #0    | ✅ MINTED ON-CHAIN             | LR-KLA-001 · Kampala, Kololo                                                                     |

---

## 📂 Repository Structure

├── contracts/
│ └── LandRegistry.sol # Solidity ERC-721 smart contract
├── scripts/
│ └── mint.js # Mint land parcels on-chain
├── ignition/
│ └── modules/
│ └── LandRegistry.js # Hardhat Ignition deploy module
├── supabase/
│ └── functions/
│ └── ussd-handler/
│ └── index.ts # Supabase Edge Function — USSD gateway
├── hardhat.config.js # Hardhat config (reads from .env)
├── .env.example # Environment variable template
└── README.md

---

## 🛠️ Technology Stack

| Layer              | Technology                                                          |
| ------------------ | ------------------------------------------------------------------- |
| Smart Contract     | Solidity ^0.8.20, OpenZeppelin v4.9.6 (ERC-721 Enumerable, Ownable) |
| Contract Framework | Hardhat + Hardhat Ignition                                          |
| Blockchain         | Polygon Amoy Testnet (Mainnet-ready)                                |
| Blockchain Library | Ethers.js v6                                                        |
| Backend            | Supabase Edge Functions (Deno / TypeScript)                         |
| RPC Node           | Alchemy                                                             |
| USSD Gateway       | Africa's Talking (integration-ready)                                |

---

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/land-registry.git
cd land-registry
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xc6A41798d3BC687c53053936cFD1975eb6206Cfb
```

### 3. Compile the contract

```bash
npx hardhat compile
```

### 4. Deploy to Amoy testnet

```bash
npx hardhat ignition deploy ./ignition/modules/LandRegistry.js --network amoy
```

### 5. Mint a land parcel

Edit `scripts/mint.js` with your contract address, then:

```bash
npx hardhat run --network amoy scripts/mint.js
```

---

## 📱 Testing the Live USSD Endpoint

The USSD API is live and accepts POST requests. Simulate a full USSD session from your terminal:

### Main menu

```bash
curl -X POST 'https://uggnvrxlcakygzqjdrrx.supabase.co/functions/v1/rapid-service' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'sessionId=test&phoneNumber=%2B256700000000&serviceCode=%2A123%23&text='
```

**Response:**

CON Welcome to Digital Land Registry

Verify Land Title
Check My Lands
About System
Exit

### Verify a land parcel (token ID 0)

```bash
curl -X POST 'https://uggnvrxlcakygzqjdrrx.supabase.co/functions/v1/rapid-service' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'sessionId=test&phoneNumber=%2B256700000000&serviceCode=%2A123%23&text=1*0'
```

**Response:**

END Land Parcel #0:
Title: LR-KLA-001
Loc: Kampala, Kololo (GPS: 0.323, 32.585)
Size: 450 sqm
Owner: 0xc030...c12B
Status: CLEAN & VERIFIED
