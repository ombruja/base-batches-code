// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

import {ISupportModule} from "./ISupportModule.sol";

interface IAstrologyZodiacSigns is ISupportModule {
    // // // // // // // // // // // // // // // // // // // //
    // EVENTS
    // // // // // // // // // // // // // // // // // // // //
    /**
     * @notice Emitted when a new base URI is set
     * @param newuri the new base URI
     */
    event BaseURISet(string newuri);

    /**
     * @notice Emitted when a new token URI is set
     * @param tokenId the id of the token
     * @param tokenURI the URI of the token
     */
    event TokenURISet(uint256 indexed tokenId, string tokenURI);

    // // // // // // // // // // // // // // // // // // // //
    // CONSTRUCTOR
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Initializes the contract
     * @param name_ The name of the contract
     * @param symbol_ The symbol of the contract
     * @param usdcAddress_ The address of the USDC token
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address usdcAddress_
    ) external;

    // // // // // // // // // // // // // // // // // // // //
    // VERSION FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Tells the current version of the contract
     * @return The numbered version (major, minor, sub)
     */
    function version() external pure returns (uint256, uint256, uint256);

    // // // // // // // // // // // // // // // // // // // //
    // PAUSER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Pauses the contract
     */
    function pause() external;

    /**
     * @notice Unpauses the contract
     */
    function unpause() external;

    // // // // // // // // // // // // // // // // // // // //
    // TOKEN URI FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Sets the base URI
     * @param newuri The new base URI
     */
    function setURI(string memory newuri) external;

    /**
     * @notice Sets the token URI
     * @param tokenId The id of the token
     * @param tokenURI The URI of the token
     */
    function setTokenURI(uint256 tokenId, string memory tokenURI) external;

    /**
     * @notice Gets the token URI
     * @param tokenId The id of the token
     * @return The URI of the token
     */
    function uri(uint256 tokenId) external view returns (string memory);

    // // // // // // // // // // // // // // // // // // // //
    // MINT FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Mints a token
     * @param account The account of the mint
     * @param id The id of the token
     * @param amount The amount of the mint
     * @param data The data of the mint
     */
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    /**
     * @notice Mints a batch of tokens
     * @param account The account of the mint
     * @param ids The ids of the tokens
     * @param amounts The amounts of the tokens
     * @param data The data of the mint
     */
    function mintBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;
}
