import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "https://esm.sh/ethers@6.13.1";

const LAND_REGISTRY_ABI = [
  "function getLandParcel(uint256 tokenId) external view returns (uint256 id, string titleNumber, string location, uint256 sizeInSqMeters, uint256 registeredAt, bool isDisputed, string metadataURI, address currentOwner)",
  "function exists(uint256 tokenId) external view returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
];

const MOCK_LANDS: Record<
  string,
  {
    titleNumber: string;
    location: string;
    size: number;
    owner: string;
    isDisputed: boolean;
    status: string;
  }
> = {
  "0": {
    titleNumber: "LR-KLA-001",
    location: "Kampala, Kololo (GPS: 0.323, 32.585)",
    size: 450,
    owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    isDisputed: false,
    status: "Clean & Verified",
  },
  "1": {
    titleNumber: "LR-KLA-002",
    location: "Kampala, Nakasero (GPS: 0.316, 32.579)",
    size: 1200,
    owner: "0x9b7a4f6d4d8e7b6c5a4d3c2b1a0e9d8c7b6a5f4e",
    isDisputed: true,
    status: "DISPUTED (Frozen by Registry Authority)",
  },
  "2": {
    titleNumber: "LR-ENT-003",
    location: "Entebbe, Kitooro (GPS: 0.063, 32.462)",
    size: 850,
    owner: "0x2506e88e7b6c5a4d3c2b1a0e9d8c7b6a5f4e3d2c",
    isDisputed: false,
    status: "Clean & Verified",
  },
};

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const text = params.get("text") ?? "";
    const inputs = text === "" ? [] : text.split("*");
    const level = inputs.length;

    let responseMessage = "";

    if (level === 0) {
      responseMessage = `CON Welcome to Digital Land Registry
1. Verify Land Title
2. Check My Lands
3. About System
4. Exit`;
    } else if (inputs[0] === "1") {
      if (level === 1) {
        responseMessage = `CON Enter Land Token ID (e.g. 0, 1, 2):`;
      } else if (level === 2) {
        responseMessage = await queryLandTitle(inputs[1].trim());
      } else {
        responseMessage = `END Invalid selection. Please try again.`;
      }
    } else if (inputs[0] === "2") {
      if (level === 1) {
        responseMessage = `CON Enter your wallet address:`;
      } else if (level === 2) {
        responseMessage = await queryUserLands(inputs[1].trim());
      } else {
        responseMessage = `END Invalid selection.`;
      }
    } else if (inputs[0] === "3") {
      responseMessage = `END Digital Land Title Registry
Blockchain-based land verification for Uganda.
Ensures transparent ownership & eliminates double-selling.
Powered by Polygon + Supabase Edge.`;
    } else if (inputs[0] === "4") {
      responseMessage = `END Thank you for using Digital Land Registry.`;
    } else {
      responseMessage = `END Invalid input. Please try again.`;
    }

    return new Response(responseMessage, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("USSD Handler Error:", error);
    return new Response("END Internal Server Error. Please try again later.", {
      headers: { "Content-Type": "text/plain" },
    });
  }
});

async function queryLandTitle(landIdStr: string): Promise<string> {
  const rpcUrl = Deno.env.get("RPC_PROVIDER_URL");
  const contractAddress = Deno.env.get("CONTRACT_ADDRESS");

  if (rpcUrl && contractAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        contractAddress,
        LAND_REGISTRY_ABI,
        provider,
      );

      const tokenExists: boolean = await contract.exists(landIdStr);
      if (!tokenExists) {
        return `END Land ID #${landIdStr} not found in registry.`;
      }

      const parcel = await contract.getLandParcel(landIdStr);

      const titleNumber: string = parcel[1];
      const location: string = parcel[2];
      const size: number = Number(parcel[3]);
      const isDisputed: boolean = parcel[5];
      const owner: string = parcel[7];

      const status = isDisputed ? "DISPUTED/FROZEN" : "CLEAN & VERIFIED";
      const shortOwner = `${owner.slice(0, 6)}...${owner.slice(-4)}`;

      return `END Land Parcel #${landIdStr}:
Title: ${titleNumber}
Loc: ${location}
Size: ${size} sqm
Owner: ${shortOwner}
Status: ${status}`;
    } catch (err) {
      console.warn("Blockchain query failed, using demo data:", err);
    }
  }

  const mockLand = MOCK_LANDS[landIdStr];
  if (mockLand) {
    const statusText = mockLand.isDisputed
      ? "DISPUTED/FROZEN"
      : "CLEAN & VERIFIED";
    const shortOwner = `${mockLand.owner.slice(0, 6)}...${mockLand.owner.slice(
      -4,
    )}`;
    return `END Land Parcel #${landIdStr} (Demo):
Title: ${mockLand.titleNumber}
Loc: ${mockLand.location.slice(0, 28)}
Size: ${mockLand.size} sqm
Owner: ${shortOwner}
Status: ${statusText}`;
  }

  return `END Land ID #${landIdStr} not found.
Try IDs 0, 1, or 2 for demo.`;
}

async function queryUserLands(identifier: string): Promise<string> {
  const rpcUrl = Deno.env.get("RPC_PROVIDER_URL");
  const contractAddress = Deno.env.get("CONTRACT_ADDRESS");

  if (ethers.isAddress(identifier) && rpcUrl && contractAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        contractAddress,
        LAND_REGISTRY_ABI,
        provider,
      );

      const balance = await contract.balanceOf(identifier);
      const count = Number(balance);

      if (count === 0) {
        return `END No lands found for:
${identifier.slice(0, 6)}...${identifier.slice(-4)}`;
      }

      let listStr = `END Lands for ${identifier.slice(
        0,
        6,
      )}...${identifier.slice(-4)}:\n`;
      const maxCount = Math.min(count, 4);

      for (let i = 0; i < maxCount; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(identifier, i);
        const parcel = await contract.getLandParcel(tokenId);
        const titleNumber: string = parcel[1];
        const size: number = Number(parcel[3]);
        const isDisputed: boolean = parcel[5];
        listStr += `${i + 1}. ${titleNumber} (${size}sqm) ${
          isDisputed ? "DISPUTED" : "OK"
        }\n`;
      }

      if (count > maxCount) {
        listStr += `+${count - maxCount} more.`;
      }

      return listStr;
    } catch (err) {
      console.warn("Blockchain query failed, using demo data:", err);
    }
  }

  const normalized = identifier.toLowerCase();
  const matches = Object.entries(MOCK_LANDS).filter(
    ([_, info]) => info.owner.toLowerCase() === normalized,
  );

  if (matches.length === 0) {
    return `END No records found for that address.`;
  }

  let listStr = `END Lands for ${identifier.slice(0, 6)}...:\n`;
  matches.forEach(([id, info], idx) => {
    listStr += `${idx + 1}. [#${id}] ${info.titleNumber} ${
      info.isDisputed ? "DISPUTED" : "OK"
    }\n`;
  });
  return listStr;
}
