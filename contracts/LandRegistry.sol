// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LandRegistry
 * @dev A secure, transparent digital land title registry contract using ERC-721 and ERC721Enumerable.
 * Each title represents a unique piece of land, minted by the Ministry of Lands (Owner).
 */
contract LandRegistry is ERC721, ERC721Enumerable, Ownable {

    // Struct to hold complete land parcel details
    struct LandParcelInfo {
        string titleNumber;
        string location;
        uint256 sizeInSqMeters;
        uint256 registeredAt;
        string metadataURI;
    }

    // Mapping from token ID to land parcel details
    mapping(uint256 => LandParcelInfo) private _parcels;

    // Security mapping to freeze transfers of titles under legal dispute
    mapping(uint256 => bool) private _isDisputed;

    // Events for auditing and real-time frontend/USSD updates
    event TitleMinted(address indexed owner, uint256 indexed tokenId, string titleNumber, string location);
    event DisputeStatusChanged(uint256 indexed tokenId, bool isDisputed);

    /**
     * @dev Initializes the contract with the token name and symbol, passing the owner to Ownable.
     */
    constructor() ERC721("LandRegistry", "LAND") Ownable(msg.sender) {}

    /**
     * @dev Mints a new land title. Representing the Ministry issuing a land title to a citizen's wallet.
     * @param to Wallet address of the legal citizen receiving the land title.
     * @param tokenId Unique land parcel identification number.
     * @param titleNumber Unique title number (e.g. LR-NBO-101).
     * @param location Short description or GPS coordinates of the land parcel.
     * @param sizeInSqMeters Size of the land parcel in square meters.
     * @param metadataURI Off-chain metadata URI (e.g., decentralized storage).
     */
    function mintTitle(
        address to, 
        uint256 tokenId, 
        string calldata titleNumber,
        string calldata location,
        uint256 sizeInSqMeters,
        string calldata metadataURI
    ) external onlyOwner {
        require(to != address(0), "LandRegistry: Cannot mint to zero address");
        require(bytes(titleNumber).length > 0, "LandRegistry: Title number cannot be empty");
        require(bytes(location).length > 0, "LandRegistry: Location details cannot be empty");
        require(sizeInSqMeters > 0, "LandRegistry: Size must be greater than zero");
        
        // Mint the ERC-721 token securely
        _safeMint(to, tokenId);
        
        // Store the land location details in the struct mapping
        _parcels[tokenId] = LandParcelInfo({
            titleNumber: titleNumber,
            location: location,
            sizeInSqMeters: sizeInSqMeters,
            registeredAt: block.timestamp,
            metadataURI: metadataU
        });

        emit TitleMinted(to, tokenId, titleNumber, location);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        try this.ownerOf(tokenId) returns (address owner) {
            return owner != address(0);
        } catch {
            return false;
        }
    }

    /**
     * @dev Returns the location string or GPS coordinates for a specific land title.
     * @param tokenId Unique land parcel identification number.
     */
    function getTitleDetails(uint256 tokenId) external view returns (string memory) {
        address owner = ownerOf(tokenId);
        require(owner != address(0), "LandRegistry: Query for nonexistent token");
        return _parcels[tokenId].location;
    }

    /**
     * @dev Returns the complete details of a land parcel.
     */
   // 1. Get the basic info
    function getLandParcelBasic(uint256 tokenId) external view returns (
        uint256 id, 
        string memory titleNumber, 
        string memory location, 
        uint256 sizeInSqMeters
    ) {
        require(ownerOf(tokenId) != address(0), "Nonexistent token");
        LandParcelInfo memory info = _parcels[tokenId];
        return (tokenId, info.titleNumber, info.location, info.sizeInSqMeters);
    }

    // 2. Get the legal/status info
    function getLandParcelStatus(uint256 tokenId) external view returns (
        uint256 registeredAt, 
        bool isDisputed, 
        string memory metadataURI, 
        address currentOwner
    ) {
        addre// 1. Get the basic info
    function getLandParcelBasic(uint256 tokenId) external view returns (
        uint256 id, 
        string memory titleNumber, 
        string memory location, 
        uint256 sizeInSqMeters
    ) {
        require(ownerOf(tokenId) != address(0), "Nonexistent token");
        LandParcelInfo memory info = _parcels[tokenId];
        return (tokenId, info.titleNumber, info.location, info.sizeInSqMeters);
    }

    // 2. Get the legal/status info
    function getLandParcelStatus(uint256 tokenId) external view returns (
        uint256 registeredAt, 
        bool isDisputed, 
        string memory metadataURI, 
        address currentOwner
    ) {
        address owner = ownerOf(tokenId);
        require(owner != address(0), "Nonexistent token");
        LandParcelInfo memory info = _parcels[tokenId];
        return (info.registeredAt, _isDisputed[tokenId], info.metadataURI, owner);
    } owner = ownerOf(tokenId);
        require(owner != address(0), "Nonexistent token");
        LandParcelInfo memory info = _parcels[tokenId];
        return (info.registeredAt, _isDisputed[tokenId], info.metadataURI, owner);
    }

    /**
     * @dev Allows the Ministry (owner) to flag a title under legal dispute to freeze transfers.
     */
    function setDisputeStatus(uint256 tokenId, bool disputed) external onlyOwner {
        require(exists(tokenId), "LandRegistry: Query for nonexistent token");
        _isDisputed[tokenId] = disputed;
        emit DisputeStatusChanged(tokenId, disputed);
    }

    /**
     * @dev Checks if a specific land title is flagged as disputed.
     */
    function isTitleDisputed(uint256 tokenId) external view returns (bool) {
        require(exists(tokenId), "LandRegistry: Query for nonexistent token");
        return _isDisputed[tokenId];
    }

    // Required overrides by Solidity for ERC721 and ERC721Enumerable

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        // Prevent transfer if title is under dispute
        if (_isDisputed[tokenId]) {
            revert("LandRegistry: Title is under dispute and frozen");
        }
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
