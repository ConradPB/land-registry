import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "https://esm.sh/ethers@6.13.1";

// ABI slice containing only the getLandParcel method for on-chain queries
const LAND_REGISTRY_ABI = [
  "function getLandParcel(uint256 landId) external view returns (uint256 id, string memory titleNumber, string memory location, uint256 sizeInSqMeters, uint256 registeredAt, bool isDisputed, string memory metadataURI, address currentOwner)",
  "function exists(uint256 landId) external view returns (bool)"
];

// Mock database for immediate demo verification when RPC or contract is not yet configured
const MOCK_LANDS: Record<string, {
  titleNumber: string;
  location: string;
  size: number;
  owner: string;
  isDisputed: boolean;
  status: string;
}> = {
  "101": {
    titleNumber: "LR-NBO-101",
    location: "Nairobi, Kilimani (GPS: -1.289, 36.806)",
    size: 450,
    owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    isDisputed: false,
    status: "Clean & Verified"
  },
  "102": {
    titleNumber: "LR-MSA-102",
    location: "Mombasa, Nyali (GPS: -4.043, 39.699)",
    size: 1200,
    owner: "0x9b7a4f6d4d8e7b6c5a4d3c2b1a0e9d8c7b6a5f4e",
    isDisputed: true,
    status: "DISPUTED (Frozen by Registry Authority)"
  },
  "103": {
    titleNumber: "LR-KIS-103",
    location: "Kisumu, Milimani (GPS: -0.102, 34.761)",
    size: 850,
    owner: "0x2506e88e7b6c5a4d3c2b1a0e9d8c7b6a5f4e3d2c",
    isDisputed: false,
    status: "Clean & Verified"
  }
};

serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Read and parse URL encoded form fields from USSD gateway
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    
    const sessionId = params.get("sessionId") || "";
    const phoneNumber = params.get("phoneNumber") || "";
    const serviceCode = params.get("serviceCode") || "";
    const text = params.get("text") || ""; // Sequence of inputs separated by *

    // Split text into individual inputs to determine hierarchy level
    const inputs = text === "" ? [] : text.split("*");
    const level = inputs.length;

    let responseMessage = "";

    // USSD Menu State Machine
    if (level === 0) {
      // Main Menu
      responseMessage = `CON Welcome to Digital Land Registry
1. Verify Land Title
2. Check My Lands
3. About System
4. Exit`;
    } 
    else if (inputs[0] === "1") {
      // Option 1: Verify Land Title
      if (level === 1) {
        responseMessage = `CON Enter Land Token ID (e.g. 101, 102):`;
      } else if (level === 2) {
        const landIdStr = inputs[1].trim();
        responseMessage = await queryLandTitle(landIdStr);
      } else {
        responseMessage = `END Invalid selection. Returning to start.`;
      }
    } 
    else if (inputs[0] === "2") {
      // Option 2: Check My Lands
      if (level === 1) {
        responseMessage = `CON Enter Registered Wallet Address or National ID:`;
      } else if (level === 2) {
        const identifier = inputs[1].trim();
        responseMessage = queryUserLands(identifier);
      } else {
        responseMessage = `END Invalid selection.`;
      }
    } 
    else if (inputs[0] === "3") {
      // Option 3: About System
      responseMessage = `END Digital Land Title Registry
v1.0.0 (Ethers.js + Supabase Edge)
Allows instantaneous land verification using standard feature phones via USSD.
Ensures transparent ownership and eliminates double-selling.`;
    } 
    else if (inputs[0] === "4") {
      // Option 4: Exit
      responseMessage = `END Thank you for using Digital Land Registry.`;
    } 
    else {
      responseMessage = `END Invalid input. Please try again.`;
    }

    return new Response(responseMessage, {
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    console.error("USSD Handler Error:", error);
    return new Response("END Internal Server Error. Please try again later.", {
      headers: { "Content-Type": "text/plain" }
    });
  }
});

/**
 * Queries land details from the blockchain registry contract or falls back to mock database.
 */
async function queryLandTitle(landIdStr: string): Promise<string> {
  const rpcUrl = Deno.env.get("RPC_PROVIDER_URL");
  const contractAddress = Deno.env.get("CONTRACT_ADDRESS");

  // If environment variables are set, attempt on-chain query
  if (rpcUrl && contractAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, LAND_REGISTRY_ABI, provider);

      // Verify token existence
      const exists = await contract.exists(landIdStr);
      if (!exists) {
        return `END Land ID #${landIdStr} not found in official registry.`;
      }

      // Query complete parcel details
      const parcel = await contract.getLandParcel(landIdStr);
      
      const titleNumber = parcel[1];
      const location = parcel[2];
      const size = Number(parcel[3]);
      const isDisputed = parcel[5];
      const owner = parcel[7];

      const status = isDisputed ? "⚠️ DISPUTED / FROZEN" : "✅ CLEAN & VERIFIED";
      const shortOwner = `${owner.slice(0, 6)}...${owner.slice(-4)}`;

      return `END Land Parcel #${landIdStr} Details:
Title: ${titleNumber}
Loc: ${location}
Size: ${size} sqm
Owner: ${shortOwner}
Status: ${status}`;

    } catch (err) {
      console.warn("Blockchain query failed, falling back to mock database:", err);
      // Fall through to mock DB if blockchain connection fails
    }
  }

  // Mock Fallback Logic
  const mockLand = MOCK_LANDS[landIdStr];
  if (mockLand) {
    const statusText = mockLand.isDisputed ? "⚠️ DISPUTED / FROZEN" : "✅ CLEAN & VERIFIED";
    const shortOwner = `${mockLand.owner.slice(0, 6)}...${mockLand.owner.slice(-4)}`;
    return `END Land Parcel #${landIdStr} (Demo):
Title: ${mockLand.titleNumber}
Loc: ${mockLand.location.slice(0, 25)}...
Size: ${mockLand.size} sqm
Owner: ${shortOwner}
Status: ${statusText}`;
  }

  return `END Land ID #${landIdStr} not found in database or registry.
Try entering 101, 102, or 103 for demo verification.`;
}

/**
 * Searches for lands registered to a specific owner identifier.
 */
function queryUserLands(identifier: string): string {
  const normalized = identifier.toLowerCase();
  
  // Find matching parcels from mock data
  const matches = Object.entries(MOCK_LANDS).filter(([_, info]) => 
    info.owner.toLowerCase() === normalized || 
    normalized.includes(info.titleNumber.toLowerCase().split("-")[2])
  );

  if (matches.length === 0) {
    return `END No active land records found for "${identifier}".`;
  }

  let listStr = `END Records for ${identifier.slice(0, 6)}...:\n`;
  matches.forEach(([id, info], idx) => {
    const disputedIcon = info.isDisputed ? "⚠️" : "✅";
    listStr += `${idx + 1}. [ID: ${id}] ${info.titleNumber} (${info.size}sqm) ${disputedIcon}\n`;
  });
  return listStr;
}
