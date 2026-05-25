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

## 📖 Upcoming Sections

*Detailed guides on smart contract deployment, local development, environment variable configuration, and USSD gateway configuration will be populated here during the next phase of development.*
