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
