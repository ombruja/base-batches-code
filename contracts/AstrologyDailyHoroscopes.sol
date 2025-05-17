// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {IAstrologyDailyHoroscopes} from "./interfaces/IAstrologyDailyHoroscopes.sol";

import {SupportModule} from "./SupportModule.sol";

contract AstrologyDailyHoroscopes is
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721PausableUpgradeable,
    ERC721BurnableUpgradeable,
    SupportModule,
    IAstrologyDailyHoroscopes
{
    // // // // // // // // // // // // // // // // // // // //
    // LIBRARIES, CONSTANTS, AND STRUCTS
    // // // // // // // // // // // // // // // // // // // //

    // Custom errors
    error InvalidTreasury();

    // // // // // // // // // // // // // // // // // // // //
    // VARIABLES - REMEMBER TO UPDATE __gap
    // // // // // // // // // // // // // // // // // // // //

    string private __baseURI;
    address private __treasury;

    // // // // // // // // // // // // // // // // // // // //
    // CONSTRUCTOR
    // // // // // // // // // // // // // // // // // // // //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address usdcAddress_,
        address treasury_
    ) public initializer {
        __ERC721_init(name_, symbol_);
        __ERC721Enumerable_init();
        __ERC721Pausable_init();
        __ERC721Burnable_init();

        __SupportModule_init(usdcAddress_);

        _updateTreasury(treasury_);

        // Set the price to 25 cents
        _setUnitPrice(USDC_ONE_CENT * 25);
        _setURI(baseURI_);
    }

    // // // // // // // // // // // // // // // // // // // //
    // OVERRIDE FUNCTIONS
    // The following functions are overrides required by Solidity.
    // // // // // // // // // // // // // // // // // // // //

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, SupportModule)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            ERC721PausableUpgradeable
        )
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // // // // // // // // // // // // // // // // // // // //
    // VERSION FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Tells the current version of the contract
     * @return The numbered version (major, minor, sub)
     */
    function version()
        external
        pure
        override
        returns (uint256, uint256, uint256)
    {
        return (0, 0, 2);
    }

    // // // // // // // // // // // // // // // // // // // //
    // PAUSER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Pauses the contract
     */
    function pause() external override onlyRole(PAUSER_ROLE) nonReentrant {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external override onlyRole(PAUSER_ROLE) nonReentrant {
        _unpause();
    }

    // // // // // // // // // // // // // // // // // // // //
    // TOKEN URI FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Sets the base URI
     * @param newuri The new base URI
     */
    function setURI(
        string memory newuri
    )
        public
        override(IAstrologyDailyHoroscopes)
        onlyRole(URI_SETTER_ROLE)
        nonReentrant
    {
        _setURI(newuri);
    }

    /**
     * @notice Sets the base URI
     * @param newuri The new base URI
     */
    function _setURI(string memory newuri) internal {
        string memory olduri = __baseURI;
        __baseURI = newuri;

        emit BaseURISet(olduri, newuri);
    }

    /**
     * @notice Returns the base URI
     * @return The base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }

    // // // // // // // // // // // // // // // // // // // //
    // TREASURY FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Returns the treasury
     * @return The treasury
     */
    function treasury() external view override returns (address) {
        return _treasury();
    }

    /**
     * @notice Returns the treasury
     * @return The treasury
     */
    function _treasury() internal view returns (address) {
        return __treasury;
    }

    /**
     * @notice Updates the treasury
     * @param newTreasury the new treasury
     */
    function updateTreasury(
        address newTreasury
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (newTreasury == address(0)) {
            revert InvalidTreasury();
        }

        _updateTreasury(newTreasury);
    }

    /**
     * @notice Updates the treasury
     * @param newTreasury the new treasury
     */
    function _updateTreasury(address newTreasury) internal {
        address oldTreasury = _treasury();
        __treasury = newTreasury;

        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    // // // // // // // // // // // // // // // // // // // //
    // MINT FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Mints a token
     * @param to The account of the mint
     * @param tokenId The id of the token
     * @param data The data of the mint
     */
    function mint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) external override nonReentrant {
        uint256[] memory ids = new uint256[](1);
        ids[0] = tokenId;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;

        _mintAllowedCheck(data, ids, amounts, to);

        // Make sure the user has enough USDC
        if (_usdc().balanceOf(_msgSender()) < _price(1)) {
            revert InsufficientUSDCBalance();
        }

        // Make sure approved amount is enough
        if (_usdc().allowance(_msgSender(), address(this)) < _price(1)) {
            revert InsufficientUSDCAllowance();
        }

        _mintInternal(to, tokenId, data);
    }

    /**
     * @notice Mints a token
     * @param to The account of the mint
     * @param tokenId The id of the token
     * @param data The data of the mint
     */
    function _mintInternal(
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        // Log the nonce as used
        _logNonceAsUsed(data);

        // First transfer the full amount to this contract
        _transferUsdcIn(_msgSender(), _price(1));

        // Mint the token
        _safeMint(to, tokenId);

        // Now we need to split it out to the payment splitters
        _transferUsdcOut(_treasury(), _price(1));
    }

    // // // // // // // // // // // // // // // // // // // //
    // GAP
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[48] private __gap;
}
