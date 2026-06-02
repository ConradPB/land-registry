// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is ERC721Enumerable, Ownable {

    uint256 private _nextTokenId;

    struct LandParcelInfo {
        string titleNumber;
        string location;
        uint256 sizeInSqMeters;
        uint256 registeredAt;
        bool isDisputed;
        string metadataURI;
    }

    mapping(uint256 => LandParcelInfo) private _parcels;

    event LandRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string titleNumber,
        string location,
        uint256 sizeInSqMeters
    );

    event DisputeStatusChanged(uint256 indexed tokenId, bool isDisputed);

    constructor() ERC721("LandRegistry", "LAND") {}

    function mintTitle(
        address to,
        string calldata titleNumber,
        string calldata location,
        uint256 sizeInSqMeters,
        string calldata metadataURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _parcels[tokenId] = LandParcelInfo({
            titleNumber: titleNumber,
            location: location,
            sizeInSqMeters: sizeInSqMeters,
            registeredAt: block.timestamp,
            isDisputed: false,
            metadataURI: metadataURI
        });
        emit LandRegistered(tokenId, to, titleNumber, location, sizeInSqMeters);
        return tokenId;
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function getLandParcel(uint256 tokenId) external view returns (
        uint256 id,
        string memory titleNumber,
        string memory location,
        uint256 sizeInSqMeters,
        uint256 registeredAt,
        bool isDisputed,
        string memory metadataURI,
        address currentOwner
    ) {
        require(_exists(tokenId), "Nonexistent token");
        LandParcelInfo storage info = _parcels[tokenId];
        return (
            tokenId,
            info.titleNumber,
            info.location,
            info.sizeInSqMeters,
            info.registeredAt,
            info.isDisputed,
            info.metadataURI,
            ownerOf(tokenId)
        );
    }

    function setDisputeStatus(uint256 tokenId, bool disputed) external onlyOwner {
        require(_exists(tokenId), "Nonexistent token");
        _parcels[tokenId].isDisputed = disputed;
        emit DisputeStatusChanged(tokenId, disputed);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721Enumerable) {
        require(!_parcels[firstTokenId].isDisputed, "Title frozen: disputed");
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
