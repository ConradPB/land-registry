// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LandRegistry
 * @dev A secure, transparent digital land title registry contract using ERC-721.
 * Each title represents a unique piece of land, minted by the Ministry of Lands (Owner).
 */
contract LandRegistry is ERC721, Ownable {

    // Private mapping to store the land description or GPS coordinates per token ID
    mapping(uint256 => string) private _tokenLocation;

    // Security mapping to freeze transfers of titles under legal dispute
    mapping(uint256 => bool) private _isDisputed;

    // Events for auditing and real-time frontend/USSD updates
    event TitleMinted(address indexed owner, uint256 indexed tokenId, string location);
    event DisputeStatusChanged(uint256 indexed tokenId, bool isDisputed);

    /**
     * @dev Initializes the contract with the token name and symbol, passing the owner to Ownable.
     */
    constructor() ERC721("LandRegistry", "LAND") Ownable(msg.sender) {}

    /**
     * @dev Mints a new land title. Representing the Ministry issuing a land title to a citizen's wallet.
     * @param to Wallet address of the legal citizen receiving the land title.
     * @param tokenId Unique land parcel identification number.
     * @param location Short description or GPS coordinates of the land parcel.
     */
    function mintTitle(
        address to, 
        uint256 tokenId, 
        string calldata location
    ) external onlyOwner {
        require(to != address(0), "LandRegistry: Cannot mint to zero address");
        require(bytes(location).length > 0, "LandRegistry: Location details cannot be empty");
        
        // Mint the ERC-721 token securely
        _safeMint(to, tokenId);
        
        // Store the land location details in the private mapping
        _tokenLocation[tokenId] = location;

        emit TitleMinted(to, tokenId, location);
    }

    /**
     * @dev Returns the location string or GPS coordinates for a specific land title.
     * @param tokenId Unique land parcel identification number.
     */
    function getTitleDetails(uint256 tokenId) external view returns (string memory) {
        // Will automatically revert if the token doesn't exist
        address owner = ownerOf(tokenId);
        require(owner != address(0), "LandRegistry: Invalid token owner");
        
        return _tokenLocation[tokenId];
    }

    /**
     * @dev Allows the Ministry (owner) to flag a title under legal dispute to freeze transfers.
     */
    function setDisputeStatus(uint256 tokenId, bool disputed) external onlyOwner {
        require(_exists(tokenId), "LandRegistry: Query for nonexistent token");
        _isDisputed[tokenId] = disputed;
        emit DisputeStatusChanged(tokenId, disputed);
    }

    /**
     * @dev Checks if a specific land title is flagged as disputed.
     */
    function isTitleDisputed(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "LandRegistry: Query for nonexistent token");
        return _isDisputed[tokenId];
    }

    /**
     * @dev Hook before any token transfer to enforce security rules.
     * Overriding safeTransferFrom to ensure disputed land titles cannot be transferred or double-sold.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        require(!_isDisputed[tokenId], "LandRegistry: Title is under dispute and frozen");
        super.safeTransferFrom(from, to, tokenId, data);
    }

    /**
     * @dev Overriding transferFrom to ensure disputed land titles cannot be transferred.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(!_isDisputed[tokenId], "LandRegistry: Title is under dispute and frozen");
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Internal helper to verify token existence in a multi-version compatible way.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
}
