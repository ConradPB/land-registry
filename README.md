# TitleChain 🔗

### Blockchain-Based Digital Land Registry

> _Own it. Prove it. On-chain._

TitleChain tokenizes land title deeds as NFTs on the Polygon blockchain, making ownership records **immutable, tamper-proof, and publicly verifiable** — accessible to anyone with a feature phone via USSD, no internet or smartphone required.

---

## 🌍 Live Deployment

| Component         | Status                             | Link                                                                                             |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Smart Contract    | ✅ LIVE — Polygon Amoy Testnet     | [0xc6A4...6Cfb](https://amoy.polygonscan.com/address/0xc6A41798d3BC687c53053936cFD1975eb6206Cfb) |
| USSD API Endpoint | ✅ LIVE — Supabase Edge            | `https://uggnvrxlcakygzqjdrrx.supabase.co/functions/v1/rapid-service`                            |
| USSD Short Code   | ✅ LIVE — Africa's Talking Sandbox | Dial `*384*4700#` to verify land titles                                                          |
| Land Parcels      | ✅ 5 PARCELS MINTED ON-CHAIN       | Kampala · Wakiso · Jinja · Mbarara · Gulu                                                        |

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

### Demo mode (no contract needed)

# try these token IDs

| Token ID | Title      | Location        | Status             |
| -------- | ---------- | --------------- | ------------------ |
| `0`      | LR-KLA-001 | Kampala, Kololo | ✅ Clean           |
| `1`      | LR-WKS-002 | Wakiso, Nansana | ✅ Clean           |
| `2`      | LR-JJA-003 | Jinja, Bugembe  | ✅ Clean           |
| `3`      | LR-MBR-004 | Mbarara, Kakoba | ⚠️ Disputed/Frozen |
| `4`      | LR-GLU-005 | Gulu, Pece      | ✅ Clean           |

---

## 🔗 Smart Contract Functions

| Function                                                  | Access     | Description                   |
| --------------------------------------------------------- | ---------- | ----------------------------- |
| `mintTitle(to, titleNumber, location, size, metadataURI)` | Owner only | Mint a new land title NFT     |
| `getLandParcel(tokenId)`                                  | Public     | Returns all 8 parcel fields   |
| `exists(tokenId)`                                         | Public     | Check if a token exists       |
| `setDisputeStatus(tokenId, disputed)`                     | Owner only | Freeze or unfreeze a title    |
| `balanceOf(owner)`                                        | Public     | Count titles owned by address |
| `tokenOfOwnerByIndex(owner, index)`                       | Public     | Enumerate titles by owner     |

### Verify on Polygonscan

Every transaction is publicly verifiable:
https://amoy.polygonscan.com/address/0xc6A41798d3BC687c53053936cFD1975eb6206Cfb

---

## 🔒 Security

- **Access control**: Only the government administrator wallet (`onlyOwner`) can mint titles or freeze disputes — enforced cryptographically by the smart contract
- **Immutability**: Records on-chain cannot be altered or deleted by any party
- **Dispute freeze**: `isDisputed = true` blocks all transfers at contract level
- **Secrets**: All sensitive keys stored in `.env` — never committed to git
- **Audit trail**: Every mint, transfer and dispute event permanently logged on-chain

---

## 🗺️ Roadmap

### ✅ Phase 1 — Prototype (Complete)

- ERC-721 smart contract deployed on Polygon Amoy
- USSD handler live on Supabase Edge Functions
- Land parcel minted and verifiable on-chain
- Mock fallback for offline demo

### 🔜 Phase 2 — Pilot (Next)

- Deploy on Polygon Mainnet
- Live Africa's Talking USSD short code on MTN/Airtel Uganda
- Web dashboard for registry officers
- NIRA National ID integration for KYC

### 🔮 Phase 3 — National Scale

- GPS map layer — view parcel boundaries on satellite map
- Inheritance / next-of-kin designation on-chain
- Ministry of Lands database migration
- SMS notifications on title activity

### 🌍 Phase 4 — Regional

- East Africa multi-country deployment
- Open-source reference implementation for African governments
- Pan-African land registry interoperability standard

---

## 👤 Author

**Conrad Mbaziira**
Ugandan software developer building blockchain solutions for real African problems.

> _"The most powerful technology is the kind that works for everyone — not just those with smartphones and stable internet."_

---

## 📄 License

MIT — open source, free to use, adapt, and deploy.

> Built with ❤️ for Uganda. Powered by Polygon + Supabase.
