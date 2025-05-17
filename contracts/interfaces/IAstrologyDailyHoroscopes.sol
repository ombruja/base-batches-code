// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

import {ISupportModule} from "./ISupportModule.sol";

interface IAstrologyDailyHoroscopes is ISupportModule {
    // // // // // // // // // // // // // // // // // // // //
    // EVENTS
    // // // // // // // // // // // // // // // // // // // //
    /**
     * @notice Emitted when a new base URI is set
     * @param olduri the old base URI
     * @param newuri the new base URI
     */
    event BaseURISet(string olduri, string newuri);

    /**
     * @notice Emitted when a new treasury is set
     * @param oldTreasury the old treasury
     * @param newTreasury the new treasury
     */
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // // // // // // // // // // // // // // // // // // // //
    // CONSTRUCTOR
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Initializes the contract
     * @param name_ The name of the contract
     * @param symbol_ The symbol of the contract
     * @param baseURI_ The base URI of the contract
     * @param usdcAddress_ The address of the USDC token
     * @param treasury_ The address of the treasury
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address usdcAddress_,
        address treasury_
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

    // // // // // // // // // // // // // // // // // // // //
    // TREASURY FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Returns the treasury
     * @return The treasury
     */
    function treasury() external view returns (address);

    /**
     * @notice Updates the treasury
     * @param newTreasury the new treasury
     */
    function updateTreasury(address newTreasury) external;

    // // // // // // // // // // // // // // // // // // // //
    // MINT FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Mints a token
     * @param to The account of the mint
     * @param tokenId The id of the token
     * @param data The data of the mint
     */
    function mint(address to, uint256 tokenId, bytes memory data) external;
}
