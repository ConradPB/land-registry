// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LandRegistry
 * @dev A smart contract for secure, transparent land title registration and transfer using ERC-721.
 * Each land title is minted as a unique NFT, with metadata stored on-chain.
 */
contract LandRegistry is ERC721, Ownable {
    
    struct LandParcel {
        uint256 id;                 // Token ID & Land ID
        string titleNumber;         // Unique government issued Title/Parcel Number
        string location;            // GPS coordinates or physical address description
        uint256 sizeInSqMeters;     // Size of the land parcel in square meters
        uint256 registeredAt;       // Timestamp of registration
        bool isDisputed;            // Status flag representing whether the title is under dispute
        string metadataURI;         // IPFS or external link to official deeds/documents
    }

    // Mapping from Land/Token ID to LandParcel details
    mapping(uint256 => LandParcel) private _landParcels;
    
    // Mapping from Title Number to Token ID to ensure title uniqueness
    mapping(string => uint256) private _titleNumberToTokenId;

    // Events
    event LandRegistered(
        uint256 indexed landId, 
        address indexed owner, 
        string titleNumber, 
        string location, 
        uint256 sizeInSqMeters
    );
    event LandTransferInitiated(uint256 indexed landId, address indexed currentOwner, address indexed proposedOwner);
    event DisputeLogged(uint256 indexed landId, string reason);
    event DisputeResolved(uint256 indexed landId);

    constructor() ERC721("Digital Land Title Registry", "LAND") Ownable(msg.sender) {}

    /**
     * @dev Registers (mints) a new land parcel. Only the registry authority (contract owner) can register new land.
     * @param to The address representing the initial legal owner of the land parcel.
     * @param landId Unique numeric ID representing the land parcel.
     * @param titleNumber Unique legal title code (e.g. "LR-NBO-12049").
     * @param location Text representation of the location or boundary GPS points.
     * @param sizeInSqMeters Size of the parcel in square meters.
     * @param metadataURI URI pointing to external maps, land surveyor deeds or legal PDFs.
     */
    function registerLand(
        address to,
        uint256 landId,
        string calldata titleNumber,
        string calldata location,
        uint256 sizeInSqMeters,
        string calldata metadataURI
    ) external onlyOwner {
        require(to != address(0), "LandRegistry: Invalid owner address");
        require(bytes(titleNumber).length > 0, "LandRegistry: Title number cannot be empty");
        require(_titleNumberToTokenId[titleNumber] == 0, "LandRegistry: Title number already registered");
        require(!_exists(landId), "LandRegistry: Land ID already exists");

        // Mint ERC-721 token
        _safeMint(to, landId);

        // Store land details
        _landParcels[landId] = LandParcel({
            id: landId,
            titleNumber: titleNumber,
            location: location,
            sizeInSqMeters: sizeInSqMeters,
            registeredAt: block.timestamp,
            isDisputed: false,
            metadataURI: metadataURI
        });

        _titleNumberToTokenId[titleNumber] = landId;

        emit LandRegistered(landId, to, titleNumber, location, sizeInSqMeters);
    }

    /**
     * @dev Overrides ERC721 safe transfer to ensure disputed lands cannot be transferred.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        require(!_landParcels[tokenId].isDisputed, "LandRegistry: Cannot transfer disputed land");
        super.safeTransferFrom(from, to, tokenId, data);
    }

    /**
     * @dev Overrides ERC721 transferFrom to ensure disputed lands cannot be transferred.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(!_landParcels[tokenId].isDisputed, "LandRegistry: Cannot transfer disputed land");
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Logs a formal dispute against a land title, freezing any transfers until resolved.
     * Only the registry authority (contract owner) can log a dispute.
     */
    function logDispute(uint256 landId, string calldata reason) external onlyOwner {
        require(_exists(landId), "LandRegistry: Land does not exist");
        require(!_landParcels[landId].isDisputed, "LandRegistry: Land is already disputed");

        _landParcels[landId].isDisputed = true;
        emit DisputeLogged(landId, reason);
    }

    /**
     * @dev Resolves a land dispute and unfreezes transfers. Only the registry authority can resolve.
     */
    function resolveDispute(uint256 landId) external onlyOwner {
        require(_exists(landId), "LandRegistry: Land does not exist");
        require(_landParcels[landId].isDisputed, "LandRegistry: Land is not under dispute");

        _landParcels[landId].isDisputed = false;
        emit DisputeResolved(landId);
    }

    /**
     * @dev Fetches complete on-chain information about a registered land parcel.
     */
    function getLandParcel(uint256 landId) external view returns (
        uint256 id,
        string memory titleNumber,
        string memory location,
        uint256 sizeInSqMeters,
        uint256 registeredAt,
        bool isDisputed,
        string memory metadataURI,
        address currentOwner
    ) {
        require(_exists(landId), "LandRegistry: Land ID does not exist");
        
        LandParcel memory parcel = _landParcels[landId];
        return (
            parcel.id,
            parcel.titleNumber,
            parcel.location,
            parcel.sizeInSqMeters,
            parcel.registeredAt,
            parcel.isDisputed,
            parcel.metadataURI,
            ownerOf(landId)
        );
    }

    /**
     * @dev Checks if a land title with the given ID exists.
     */
    function exists(uint256 landId) external view returns (bool) {
        return _exists(landId);
    }

    /**
     * @dev Resolves a title number to its Token ID. Returns 0 if not found.
     */
    function getTokenIdByTitle(string calldata titleNumber) external view returns (uint256) {
        return _titleNumberToTokenId[titleNumber];
    }

    /**
     * @dev Internal helper to check token existence (for compatibility across OpenZeppelin versions).
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
}
