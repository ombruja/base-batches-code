// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

interface ISupportModule {
    // // // // // // // // // // // // // // // // // // // //
    // EVENTS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Emitted when a new platform signer is added
     * @param platformSigner the new platform signer
     */
    event PlatformSignerAdded(address indexed platformSigner);

    /**
     * @notice Emitted when a new payment splitter is set
     * @param tokenIdHash the id of the token
     * @param oldSplitter the old address of the payment splitter
     * @param newSplitter the new address of the payment splitter
     */
    event PaymentSplitterSet(
        bytes32 indexed tokenIdHash,
        address indexed oldSplitter,
        address indexed newSplitter
    );

    /**
     * @notice Emitted when a platform signer is removed
     * @param platformSigner the removed platform signer
     */
    event PlatformSignerRemoved(address indexed platformSigner);

    /**
     * @notice Emitted when a new unit price is set
     * @param oldUnitPrice the old unit price
     * @param newUnitPrice the new unit price
     */
    event UnitPriceSet(
        uint256 indexed oldUnitPrice,
        uint256 indexed newUnitPrice
    );

    /**
     * @notice Emitted when the USDC address is updated
     * @param oldUsdcAddress The old USDC address
     * @param newUsdcAddress The new USDC address
     */
    event USDCAddressUpdated(
        address indexed oldUsdcAddress,
        address indexed newUsdcAddress
    );

    // // // // // // // // // // // // // // // // // // // //
    // VERSION FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Tells the current version of the contract
     * @return The numbered version (major, minor, sub)
     */
    function versionSupportModule()
        external
        pure
        returns (uint256, uint256, uint256);

    // // // // // // // // // // // // // // // // // // // //
    // PLATFORM SIGNER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Adds a new platform signer
     * @param newPlatformSigner the new platform signer
     */
    function addPlatformSigner(address newPlatformSigner) external;

    /**
     * @notice Removes a platform signer
     * @param oldPlatformSigner the old platform signer
     */
    function removePlatformSigner(address oldPlatformSigner) external;

    /**
     * @notice Gets the list of platform signers
     * @return The list of platform signers
     */
    function getPlatformSigners() external view returns (address[] memory);

    /**
     * @notice Checks if a signer is a platform signer
     * @param signer the signer to check
     * @return True if the signer is a platform signer, false otherwise
     */
    function isPlatformSigner(address signer) external view returns (bool);

    // // // // // // // // // // // // // // // // // // // //
    // PAYMENT RELATED FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Gets the price of a mint
     * @param amount The amount of mints
     * @return The price of the mints
     */
    function price(uint256 amount) external view returns (uint256);

    /**
     * @notice Gets the unit price
     * @return The unit price
     */
    function unitPrice() external view returns (uint256);

    /**
     * @notice Sets the unit price
     * @param newUnitPrice The new unit price
     */
    function setUnitPrice(uint256 newUnitPrice) external;

    /**
     * @notice Gets the payment splitter for a token
     * @param tokenId The id of the token
     * @return The address of the payment splitter for the token
     */
    function paymentSplitterForToken(
        uint256 tokenId
    ) external view returns (address);

    /**
     * @notice Sets the payment splitter for a token
     * @param tokenIdHash The id of the token
     * @param splitter The address of the payment splitter
     
     */
    function setPaymentSplitter(bytes32 tokenIdHash, address splitter) external;

    /**
     * @notice Gets the USDC address
     * @return The USDC address
     */
    function usdc() external view returns (address);

    /**
     * @notice Updates the USDC address
     * @param usdcAddress_ The new USDC address
     */
    function updateUSDC(address usdcAddress_) external;

    // // // // // // // // // // // // // // // // // // // //
    // HELPER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Checks if a nonce has been used
     * @param nonce The nonce to check
     * @return True if the nonce has been used, false otherwise
     */
    function nonceUsed(bytes32 nonce) external view returns (bool);

    /**
     * @notice Checks if a mint is allowed
     * @param dataPayload The data payload of the mint
     * @param onchainIds The onchain ids of the mint
     * @param amounts The amounts of the mint
     * @param account The account of the mint
     */
    function mintAllowedCheck(
        bytes memory dataPayload,
        uint256[] memory onchainIds,
        uint256[] memory amounts,
        address account
    ) external view;
}
