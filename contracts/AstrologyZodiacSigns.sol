// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";

import {IAstrologyZodiacSigns} from "./interfaces/IAstrologyZodiacSigns.sol";
import {IPaymentSplitterUpgradeable} from "./interfaces/IPaymentSplitterUpgradeable.sol";

import {SupportModule} from "./SupportModule.sol";

contract AstrologyZodiacSigns is
    ERC1155Upgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155PausableUpgradeable,
    ERC1155SupplyUpgradeable,
    SupportModule,
    IAstrologyZodiacSigns
{
    // // // // // // // // // // // // // // // // // // // //
    // LIBRARIES, CONSTANTS, AND STRUCTS
    // // // // // // // // // // // // // // // // // // // //

    // Custom errors
    error NoTokenPaymentSplitter();
    error InvalidArrayLengths();

    // // // // // // // // // // // // // // // // // // // //
    // VARIABLES - REMEMBER TO UPDATE __gap
    // // // // // // // // // // // // // // // // // // // //

    string public name;
    string public symbol;

    mapping(uint256 => string) private __tokenURIs;

    // // // // // // // // // // // // // // // // // // // //
    // CONSTRUCTOR
    // // // // // // // // // // // // // // // // // // // //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

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
    ) public initializer {
        __ERC1155_init("");
        __ERC1155Pausable_init();
        __ERC1155Burnable_init();
        __ERC1155Supply_init();

        __SupportModule_init(usdcAddress_);

        name = name_;
        symbol = symbol_;

        // Set the price to 1 dollar
        _setUnitPrice(USDC_ONE_DOLLAR);
    }

    // // // // // // // // // // // // // // // // // // // //
    // OVERRIDE FUNCTIONS
    // The following functions are overrides required by Solidity.
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Updates the contract
     * @param from The address of the sender
     * @param to The address of the recipient
     * @param ids The ids of the tokens
     * @param values The values of the tokens
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        override(
            ERC1155Upgradeable,
            ERC1155PausableUpgradeable,
            ERC1155SupplyUpgradeable
        )
    {
        super._update(from, to, ids, values);
    }

    /**
     * @notice Supports the interface
     * @param interfaceId The interface id
     * @return True if the interface is supported, false otherwise
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155Upgradeable, SupportModule) returns (bool) {
        return super.supportsInterface(interfaceId);
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
        override(IAstrologyZodiacSigns)
        onlyRole(URI_SETTER_ROLE)
        nonReentrant
    {
        _setURI(newuri);
        emit BaseURISet(newuri);
    }

    /**
     * @notice Sets the token URI
     * @param tokenId The id of the token
     * @param tokenURI The URI of the token
     */
    function setTokenURI(
        uint256 tokenId,
        string memory tokenURI
    ) public override onlyRole(URI_SETTER_ROLE) nonReentrant {
        __tokenURIs[tokenId] = tokenURI;
        emit TokenURISet(tokenId, tokenURI);
        emit URI(tokenURI, tokenId);
    }

    /**
     * @notice Gets the token URI
     * @param tokenId The id of the token
     * @return The URI of the token
     */
    function uri(
        uint256 tokenId
    )
        public
        view
        override(IAstrologyZodiacSigns, ERC1155Upgradeable)
        returns (string memory)
    {
        string memory tokenURI = __tokenURIs[tokenId];

        // If there's a specific URI for this token, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }

        // Otherwise, return the default URI
        return super.uri(tokenId);
    }

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
    ) external override nonReentrant {
        uint256[] memory ids = new uint256[](1);
        ids[0] = id;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        _mintAllowedCheck(data, ids, amounts, account);

        // Make sure the user has enough USDC
        if (_usdc().balanceOf(_msgSender()) < _price(amount)) {
            revert InsufficientUSDCBalance();
        }

        // Make sure approved amount is enough
        if (_usdc().allowance(_msgSender(), address(this)) < _price(amount)) {
            revert InsufficientUSDCAllowance();
        }

        _mintInternal(account, id, amount, data);
    }

    /**
     * @notice Mints a token
     * @param account The account of the mint
     * @param id The id of the token
     * @param amount The amount of the mint
     * @param data The data of the mint
     */
    function _mintInternal(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal {
        IPaymentSplitterUpgradeable paymentSplitter = IPaymentSplitterUpgradeable(
                _paymentSplitterForToken(id)
            );

        if (address(paymentSplitter) == address(0)) {
            revert NoTokenPaymentSplitter();
        }

        // Log the nonce as used
        _logNonceAsUsed(data);

        // First transfer the full amount to this contract
        _transferUsdcIn(_msgSender(), _price(amount));

        // Mint the token
        _mint(account, id, amount, data);

        // Now we need to split it out to the payment splitters
        _transferUsdcOut(address(paymentSplitter), _price(amount));

        // Release payments to all shareholders
        for (uint256 i = 0; i < paymentSplitter.payees().length; i++) {
            paymentSplitter.release(_usdc(), paymentSplitter.payees()[i]);
        }
    }

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
    ) external override nonReentrant {
        _mintAllowedCheck(data, ids, amounts, account);

        // Make sure array lengths are the same
        if (ids.length != amounts.length) {
            revert InvalidArrayLengths();
        }

        // Calculate total price
        uint256 totalPrice = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            totalPrice += _price(amounts[i]);
        }

        // Make sure the user has enough USDC
        if (_usdc().balanceOf(_msgSender()) < totalPrice) {
            revert InsufficientUSDCBalance();
        }

        // Make sure approved amount is enough
        if (_usdc().allowance(_msgSender(), address(this)) < totalPrice) {
            revert InsufficientUSDCAllowance();
        }

        _mintBatchInternal(account, totalPrice, ids, amounts, data);
    }

    /**
     * @notice Mints a batch of tokens
     * @param account The account of the mint
     * @param totalPrice The total price of the mint
     * @param ids The ids of the tokens
     * @param amounts The amounts of the tokens
     * @param data The data of the mint
     */
    function _mintBatchInternal(
        address account,
        uint256 totalPrice,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal {
        // Log the nonce as used
        _logNonceAsUsed(data);

        // First transfer the full amount to this contract
        _transferUsdcIn(_msgSender(), totalPrice);

        // Now we need to split it out to the payment splitters
        for (uint256 i = 0; i < ids.length; i++) {
            IPaymentSplitterUpgradeable paymentSplitter = IPaymentSplitterUpgradeable(
                    _paymentSplitterForToken(ids[i])
                );

            if (address(paymentSplitter) == address(0)) {
                revert NoTokenPaymentSplitter();
            }

            _transferUsdcOut(address(paymentSplitter), _price(amounts[i]));

            // Release payments to all shareholders
            for (
                uint256 payeeIndex = 0;
                payeeIndex < paymentSplitter.payees().length;
                payeeIndex++
            ) {
                paymentSplitter.release(
                    _usdc(),
                    paymentSplitter.payees()[payeeIndex]
                );
            }
        }

        _mintBatch(account, ids, amounts, data);
    }

    // // // // // // // // // // // // // // // // // // // //
    // GAP
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[47] private __gap;
}
